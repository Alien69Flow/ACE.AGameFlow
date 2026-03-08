import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-init-data',
};

// Validate Telegram WebApp initData
async function validateTelegramInitData(initData: string, botToken: string): Promise<{ valid: boolean; user?: { id: number; username?: string; first_name?: string } }> {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return { valid: false };
    
    params.delete('hash');
    
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    const encoder = new TextEncoder();
    const secretKeyData = await crypto.subtle.importKey(
      'raw',
      encoder.encode('WebAppData'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const secretKey = await crypto.subtle.sign(
      'HMAC',
      secretKeyData,
      encoder.encode(botToken)
    );
    
    const keyForData = await crypto.subtle.importKey(
      'raw',
      secretKey,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const calculatedHashBuffer = await crypto.subtle.sign(
      'HMAC',
      keyForData,
      encoder.encode(dataCheckString)
    );
    
    const calculatedHash = Array.from(new Uint8Array(calculatedHashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    if (calculatedHash !== hash) {
      return { valid: false };
    }
    
    const userStr = params.get('user');
    if (!userStr) return { valid: false };
    
    const user = JSON.parse(userStr);
    return { valid: true, user };
  } catch (error) {
    console.error('Telegram validation failed');
    return { valid: false };
  }
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    
    if (!botToken) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const initData = req.headers.get('x-telegram-init-data');
    
    let telegramUserId: string;
    let telegramUsername: string | null = null;
    
    if (initData) {
      const validation = await validateTelegramInitData(initData, botToken);
      if (!validation.valid || !validation.user) {
        return new Response(
          JSON.stringify({ error: 'Invalid Telegram authentication' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      telegramUserId = validation.user.id.toString();
      telegramUsername = validation.user.username || validation.user.first_name || null;
    } else {
      return new Response(
        JSON.stringify({ error: 'Missing authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();
    
    switch (action) {
      case 'init-profile': {
        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('telegram_id', telegramUserId)
          .maybeSingle();
        
        if (!profile) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              telegram_id: telegramUserId,
              username: telegramUsername,
              referral_code: generateReferralCode(),
            })
            .select()
            .single();
          
          if (createError) throw createError;
          profile = newProfile;
        }
        
        // Generate referral code if missing (existing users)
        if (profile && !profile.referral_code) {
          const code = generateReferralCode();
          await supabase
            .from('profiles')
            .update({ referral_code: code })
            .eq('id', profile.id);
          profile.referral_code = code;
        }
        
        // Calculate stamina regeneration
        if (profile) {
          const lastUpdate = new Date(profile.last_stamina_update);
          const now = new Date();
          const secondsElapsed = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
          const staminaRegen = Math.floor(secondsElapsed / 60);
          const newStamina = Math.min(profile.stamina + staminaRegen, profile.max_stamina);
          
          if (newStamina !== profile.stamina) {
            await supabase
              .from('profiles')
              .update({ stamina: newStamina, last_stamina_update: now.toISOString() })
              .eq('id', profile.id);
            profile.stamina = newStamina;
          }
        }
        
        const { data: completedMissions } = await supabase
          .from('missions_completed')
          .select('*')
          .eq('profile_id', profile.id);
        
        return new Response(
          JSON.stringify({ profile, missions: completedMissions || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'tap': {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, energy, stamina, multiplier, multiplier_expires_at')
          .eq('telegram_id', telegramUserId)
          .single();
        
        if (!profile) {
          return new Response(
            JSON.stringify({ error: 'Profile not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (profile.stamina <= 0) {
          return new Response(
            JSON.stringify({ success: false, message: 'No stamina', energy: profile.energy, stamina: 0 }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Check active multiplier
        let activeMultiplier = 1;
        if (profile.multiplier > 1 && profile.multiplier_expires_at) {
          if (new Date(profile.multiplier_expires_at) > new Date()) {
            activeMultiplier = profile.multiplier;
          } else {
            // Expired — reset
            await supabase
              .from('profiles')
              .update({ multiplier: 1, multiplier_expires_at: null })
              .eq('id', profile.id);
          }
        }
        
        const energyGain = 1 * activeMultiplier;
        const newEnergy = profile.energy + energyGain;
        const newStamina = profile.stamina - 1;
        
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ 
            energy: newEnergy, 
            stamina: newStamina, 
            last_stamina_update: new Date().toISOString() 
          })
          .eq('id', profile.id)
          .eq('stamina', profile.stamina)
          .select('energy, stamina');
        
        if (updateError || !updatedProfile || updatedProfile.length === 0) {
          const { data: currentProfile } = await supabase
            .from('profiles')
            .select('energy, stamina')
            .eq('id', profile.id)
            .single();
          
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Concurrent update detected',
              energy: currentProfile?.energy ?? profile.energy,
              stamina: currentProfile?.stamina ?? profile.stamina
            }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            energy: updatedProfile[0].energy, 
            stamina: updatedProfile[0].stamina,
            multiplier: activeMultiplier,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'start-mission': {
        const body = await req.json();
        const { missionId } = body;
        
        if (!missionId || typeof missionId !== 'string') {
          return new Response(
            JSON.stringify({ error: 'Invalid mission ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('telegram_id', telegramUserId)
          .single();
        
        if (!profile) {
          return new Response(
            JSON.stringify({ error: 'Profile not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const now = new Date().toISOString();
        
        await supabase
          .from('missions_completed')
          .upsert({
            profile_id: profile.id,
            mission_id: missionId,
            started_at: now,
          }, { onConflict: 'profile_id,mission_id' });
        
        return new Response(
          JSON.stringify({ success: true, startedAt: now }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'claim-mission': {
        const body = await req.json();
        const { missionId, reward } = body;
        
        if (!missionId || typeof missionId !== 'string' || typeof reward !== 'number' || reward <= 0 || reward > 1000) {
          return new Response(
            JSON.stringify({ error: 'Invalid request' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, energy')
          .eq('telegram_id', telegramUserId)
          .single();
        
        if (!profile) {
          return new Response(
            JSON.stringify({ error: 'Profile not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const { data: mission } = await supabase
          .from('missions_completed')
          .select('*')
          .eq('profile_id', profile.id)
          .eq('mission_id', missionId)
          .single();
        
        if (!mission) {
          return new Response(
            JSON.stringify({ error: 'Mission not started' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (mission.claimed) {
          return new Response(
            JSON.stringify({ error: 'Already claimed' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const startedAt = new Date(mission.started_at);
        const elapsed = (Date.now() - startedAt.getTime()) / 1000;
        if (elapsed < 33) {
          return new Response(
            JSON.stringify({ error: 'Verification not complete', remainingSeconds: Math.ceil(33 - elapsed) }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const now = new Date().toISOString();
        const newEnergy = profile.energy + reward;
        
        await supabase
          .from('missions_completed')
          .update({ completed_at: now, claimed: true })
          .eq('profile_id', profile.id)
          .eq('mission_id', missionId);
        
        await supabase
          .from('profiles')
          .update({ energy: newEnergy })
          .eq('id', profile.id);
        
        return new Response(
          JSON.stringify({ success: true, energy: newEnergy }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'complete-tutorial': {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('telegram_id', telegramUserId)
          .single();
        
        if (!profile) {
          return new Response(
            JSON.stringify({ error: 'Profile not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        await supabase
          .from('profiles')
          .update({ tutorial_completed: true })
          .eq('id', profile.id);
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'sync-stamina': {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, stamina, max_stamina, last_stamina_update')
          .eq('telegram_id', telegramUserId)
          .single();
        
        if (!profile) {
          return new Response(
            JSON.stringify({ error: 'Profile not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const lastUpdate = new Date(profile.last_stamina_update);
        const now = new Date();
        const secondsElapsed = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
        const staminaRegen = Math.floor(secondsElapsed / 60);
        const newStamina = Math.min(profile.stamina + staminaRegen, profile.max_stamina);
        
        if (newStamina !== profile.stamina) {
          await supabase
            .from('profiles')
            .update({ stamina: newStamina, last_stamina_update: now.toISOString() })
            .eq('id', profile.id);
        }
        
        return new Response(
          JSON.stringify({ stamina: newStamina, maxStamina: profile.max_stamina }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get-referral-code': {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, referral_code, referral_count, referred_by')
          .eq('telegram_id', telegramUserId)
          .single();
        
        if (!profile) {
          return new Response(
            JSON.stringify({ error: 'Profile not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        let code = profile.referral_code;
        if (!code) {
          code = generateReferralCode();
          await supabase
            .from('profiles')
            .update({ referral_code: code })
            .eq('id', profile.id);
        }

        return new Response(
          JSON.stringify({ 
            referralCode: code, 
            referralCount: profile.referral_count,
            hasReferred: !!profile.referred_by,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'apply-referral': {
        const body = await req.json();
        const { referralCode } = body;

        if (!referralCode || typeof referralCode !== 'string' || referralCode.length !== 8) {
          return new Response(
            JSON.stringify({ error: 'Invalid referral code' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get current user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, energy, referred_by, referral_code')
          .eq('telegram_id', telegramUserId)
          .single();

        if (!profile) {
          return new Response(
            JSON.stringify({ error: 'Profile not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (profile.referred_by) {
          return new Response(
            JSON.stringify({ error: 'Already used a referral code' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (profile.referral_code === referralCode) {
          return new Response(
            JSON.stringify({ error: 'Cannot use your own code' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Find referrer
        const { data: referrer } = await supabase
          .from('profiles')
          .select('id, energy, referral_count')
          .eq('referral_code', referralCode)
          .single();

        if (!referrer) {
          return new Response(
            JSON.stringify({ error: 'Referral code not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Apply rewards
        await supabase
          .from('profiles')
          .update({ 
            referred_by: referrer.id, 
            energy: profile.energy + 50 
          })
          .eq('id', profile.id);

        await supabase
          .from('profiles')
          .update({ 
            energy: referrer.energy + 100, 
            referral_count: referrer.referral_count + 1 
          })
          .eq('id', referrer.id);

        return new Response(
          JSON.stringify({ success: true, energyGained: 50 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'claim-daily': {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, energy, last_daily_claim, daily_streak')
          .eq('telegram_id', telegramUserId)
          .single();

        if (!profile) {
          return new Response(
            JSON.stringify({ error: 'Profile not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const now = new Date();
        const lastClaim = profile.last_daily_claim ? new Date(profile.last_daily_claim) : null;

        if (lastClaim) {
          const hoursSinceClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
          if (hoursSinceClaim < 24) {
            const nextClaimAt = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000);
            return new Response(
              JSON.stringify({ 
                error: 'Already claimed today', 
                nextClaimAt: nextClaimAt.toISOString(),
                streak: profile.daily_streak,
              }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        // Calculate streak
        let newStreak = 1;
        if (lastClaim) {
          const hoursSinceClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
          if (hoursSinceClaim < 48) {
            newStreak = Math.min(profile.daily_streak + 1, 10);
          }
        }

        // Escalating reward: 10 * streak, max 100
        const reward = Math.min(newStreak * 10, 100);
        const newEnergy = profile.energy + reward;

        await supabase
          .from('profiles')
          .update({ 
            energy: newEnergy, 
            last_daily_claim: now.toISOString(), 
            daily_streak: newStreak 
          })
          .eq('id', profile.id);

        return new Response(
          JSON.stringify({ 
            success: true, 
            reward, 
            streak: newStreak, 
            energy: newEnergy,
            nextClaimAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'leaderboard': {
        const { data: topUsers } = await supabase
          .from('profiles')
          .select('username, energy, referral_count')
          .order('energy', { ascending: false })
          .limit(50);

        // Get current user rank
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, energy, username')
          .eq('telegram_id', telegramUserId)
          .single();

        let userRank = null;
        if (profile) {
          const { count } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .gt('energy', profile.energy);
          userRank = (count || 0) + 1;
        }

        return new Response(
          JSON.stringify({ 
            leaderboard: topUsers || [], 
            userRank,
            userEnergy: profile?.energy || 0,
            userName: profile?.username || 'Anonymous',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'buy-multiplier': {
        // This is validated client-side via TON transaction
        // Server just activates the multiplier after payment confirmation
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, multiplier, multiplier_expires_at')
          .eq('telegram_id', telegramUserId)
          .single();

        if (!profile) {
          return new Response(
            JSON.stringify({ error: 'Profile not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        await supabase
          .from('profiles')
          .update({ multiplier: 2, multiplier_expires_at: expiresAt })
          .eq('id', profile.id);

        return new Response(
          JSON.stringify({ success: true, multiplier: 2, expiresAt }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      default:
        return new Response(
          JSON.stringify({ error: 'Not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Game API error:', error instanceof Error ? error.name : 'Unknown');
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
