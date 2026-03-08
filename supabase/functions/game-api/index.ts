import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-init-data',
};

// Validate Telegram WebApp initData
async function validateTelegramInitData(initData: string, botToken: string): Promise<{ valid: boolean; user?: { id: number; username?: string; first_name?: string }; startParam?: string }> {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return { valid: false };
    
    // Extract start_param before deleting hash
    const startParam = params.get('start_param') || undefined;
    
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
    return { valid: true, user, startParam };
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

// Upgrade catalog
const UPGRADE_CATALOG: Record<string, { values: number[]; costs: number[]; maxLevel: number }> = {
  tap_power:      { values: [1, 2, 3, 5, 8],         costs: [100, 500, 2000, 8000, 25000],  maxLevel: 5 },
  passive_income: { values: [0, 5, 15, 30, 60],      costs: [200, 1000, 5000, 15000, 40000], maxLevel: 5 },
  max_stamina:    { values: [100, 200, 500, 1000, 2000], costs: [150, 800, 3000, 10000, 30000], maxLevel: 5 },
  regen_speed:    { values: [1, 2, 3, 5, 8],          costs: [300, 1200, 4000, 12000, 35000], maxLevel: 5 },
};

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
    let startParam: string | undefined;
    
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
      startParam = validation.startParam;
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

          // Auto-apply deep link referral on first launch
          if (startParam && profile && !profile.referred_by) {
            const { data: referrer } = await supabase
              .from('profiles')
              .select('id, energy, referral_count')
              .eq('referral_code', startParam)
              .single();
            
            if (referrer && referrer.id !== profile.id) {
              await supabase
                .from('profiles')
                .update({ referred_by: referrer.id, energy: profile.energy + 50 })
                .eq('id', profile.id);
              
              await supabase
                .from('profiles')
                .update({ energy: referrer.energy + 100, referral_count: referrer.referral_count + 1 })
                .eq('id', referrer.id);
              
              profile.energy = profile.energy + 50;
              profile.referred_by = referrer.id;
            }
          }
        }
        
        // Generate referral code if missing
        if (profile && !profile.referral_code) {
          const code = generateReferralCode();
          await supabase
            .from('profiles')
            .update({ referral_code: code })
            .eq('id', profile.id);
          profile.referral_code = code;
        }
        
        // Calculate offline earnings from passive income
        let offlineEarnings = 0;
        if (profile) {
          const lastSeen = new Date(profile.last_seen_at);
          const now = new Date();
          const hoursAway = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60));
          
          if (hoursAway > 0 && profile.passive_income_level > 0) {
            const passiveRate = UPGRADE_CATALOG.passive_income.values[profile.passive_income_level] || 0;
            offlineEarnings = Math.min(passiveRate * hoursAway, passiveRate * 8); // Cap at 8h
          }
        }

        // Calculate stamina regeneration (with regen_speed upgrade)
        if (profile) {
          const lastUpdate = new Date(profile.last_stamina_update);
          const now = new Date();
          const secondsElapsed = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
          const regenRate = UPGRADE_CATALOG.regen_speed.values[profile.regen_speed_level] || 1;
          const staminaRegen = Math.floor(secondsElapsed / 60) * regenRate;
          
          // Get max stamina from upgrade
          const actualMaxStamina = UPGRADE_CATALOG.max_stamina.values[profile.max_stamina_level] || 100;
          const newStamina = Math.min(profile.stamina + staminaRegen, actualMaxStamina);
          
          const updates: Record<string, unknown> = { 
            last_seen_at: now.toISOString(),
            max_stamina: actualMaxStamina,
          };
          
          if (newStamina !== profile.stamina) {
            updates.stamina = newStamina;
            updates.last_stamina_update = now.toISOString();
            profile.stamina = newStamina;
          }
          
          if (offlineEarnings > 0) {
            updates.energy = profile.energy + offlineEarnings;
            profile.energy = profile.energy + offlineEarnings;
          }
          
          profile.max_stamina = actualMaxStamina;
          
          await supabase.from('profiles').update(updates).eq('id', profile.id);
        }
        
        // Get upgrades
        const { data: upgrades } = await supabase
          .from('upgrades')
          .select('upgrade_type, level')
          .eq('profile_id', profile.id);
        
        // Get completed missions
        const { data: completedMissions } = await supabase
          .from('missions_completed')
          .select('*')
          .eq('profile_id', profile.id);

        // Get clan info
        let clanInfo = null;
        if (profile.clan_id) {
          const { data: clan } = await supabase
            .from('clans')
            .select('id, name, member_count, total_energy')
            .eq('id', profile.clan_id)
            .single();
          clanInfo = clan;
        }
        
        return new Response(
          JSON.stringify({ 
            profile, 
            missions: completedMissions || [],
            upgrades: upgrades || [],
            offlineEarnings,
            clan: clanInfo,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'tap': {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, energy, stamina, multiplier, multiplier_expires_at, tap_power_level, last_tap_at')
          .eq('telegram_id', telegramUserId)
          .single();
        
        if (!profile) {
          return new Response(
            JSON.stringify({ error: 'Profile not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Anti-cheat: Rate limiting
        const now = Date.now();
        const lastTapTime = profile.last_tap_at ? new Date(profile.last_tap_at).getTime() : 0;
        const timeSinceLastTap = now - lastTapTime;
        
        // Block taps faster than 100ms (bot detection)
        if (timeSinceLastTap < 100) {
          return new Response(
            JSON.stringify({ error: 'Rate limited', success: false }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (profile.stamina <= 0) {
          return new Response(
            JSON.stringify({ success: false, message: 'No stamina', energy: profile.energy, stamina: 0 }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Tap power from upgrade
        const tapPower = UPGRADE_CATALOG.tap_power.values[profile.tap_power_level] || 1;
        
        // Check active multiplier
        let activeMultiplier = 1;
        if (profile.multiplier > 1 && profile.multiplier_expires_at) {
          if (new Date(profile.multiplier_expires_at) > new Date()) {
            activeMultiplier = profile.multiplier;
          } else {
            await supabase
              .from('profiles')
              .update({ multiplier: 1, multiplier_expires_at: null })
              .eq('id', profile.id);
          }
        }
        
        const energyGain = tapPower * activeMultiplier;
        const newEnergy = profile.energy + energyGain;
        const newStamina = profile.stamina - 1;
        
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ 
            energy: newEnergy, 
            stamina: newStamina, 
            last_stamina_update: new Date().toISOString(),
            last_tap_at: new Date().toISOString()
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
            tapPower,
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
          .select('id, stamina, max_stamina, last_stamina_update, regen_speed_level, max_stamina_level')
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
        const regenRate = UPGRADE_CATALOG.regen_speed.values[profile.regen_speed_level] || 1;
        const staminaRegen = Math.floor(secondsElapsed / 60) * regenRate;
        const actualMaxStamina = UPGRADE_CATALOG.max_stamina.values[profile.max_stamina_level] || 100;
        const newStamina = Math.min(profile.stamina + staminaRegen, actualMaxStamina);
        
        if (newStamina !== profile.stamina) {
          await supabase
            .from('profiles')
            .update({ stamina: newStamina, last_stamina_update: now.toISOString(), max_stamina: actualMaxStamina })
            .eq('id', profile.id);
        }
        
        return new Response(
          JSON.stringify({ stamina: newStamina, maxStamina: actualMaxStamina }),
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

        await supabase
          .from('profiles')
          .update({ referred_by: referrer.id, energy: profile.energy + 50 })
          .eq('id', profile.id);

        await supabase
          .from('profiles')
          .update({ energy: referrer.energy + 100, referral_count: referrer.referral_count + 1 })
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
            return new Response(
              JSON.stringify({ error: 'Already claimed today', streak: profile.daily_streak }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        let newStreak = 1;
        if (lastClaim) {
          const hoursSinceClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
          if (hoursSinceClaim < 48) {
            newStreak = Math.min(profile.daily_streak + 1, 10);
          }
        }

        const reward = Math.min(newStreak * 10, 100);
        const newEnergy = profile.energy + reward;

        await supabase
          .from('profiles')
          .update({ energy: newEnergy, last_daily_claim: now.toISOString(), daily_streak: newStreak })
          .eq('id', profile.id);

        return new Response(
          JSON.stringify({ success: true, reward, streak: newStreak, energy: newEnergy }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'leaderboard': {
        const { data: topUsers } = await supabase
          .from('profiles')
          .select('username, energy, referral_count')
          .order('energy', { ascending: false })
          .limit(50);

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
          JSON.stringify({ leaderboard: topUsers || [], userRank, userEnergy: profile?.energy || 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'buy-multiplier': {
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

      // ---- NEW ENDPOINTS ----

      case 'get-upgrades': {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, energy, tap_power_level, passive_income_level, max_stamina_level, regen_speed_level')
          .eq('telegram_id', telegramUserId)
          .single();

        if (!profile) {
          return new Response(
            JSON.stringify({ error: 'Profile not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const upgradeInfo = Object.entries(UPGRADE_CATALOG).map(([type, catalog]) => {
          const levelKey = `${type}_level` as keyof typeof profile;
          const currentLevel = (profile[levelKey] as number) || 0;
          const nextCost = currentLevel < catalog.maxLevel ? catalog.costs[currentLevel] : null;
          const currentValue = catalog.values[currentLevel];
          const nextValue = currentLevel < catalog.maxLevel ? catalog.values[currentLevel + 1] : null;
          
          return {
            type,
            currentLevel,
            maxLevel: catalog.maxLevel,
            currentValue,
            nextValue,
            nextCost,
            canAfford: nextCost !== null && profile.energy >= nextCost,
          };
        });

        return new Response(
          JSON.stringify({ upgrades: upgradeInfo, energy: profile.energy }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'buy-upgrade': {
        const body = await req.json();
        const { upgradeType } = body;

        if (!upgradeType || !UPGRADE_CATALOG[upgradeType]) {
          return new Response(
            JSON.stringify({ error: 'Invalid upgrade type' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const catalog = UPGRADE_CATALOG[upgradeType];
        const levelColumn = `${upgradeType}_level`;

        const { data: profile } = await supabase
          .from('profiles')
          .select(`id, energy, ${levelColumn}`)
          .eq('telegram_id', telegramUserId)
          .single();

        if (!profile) {
          return new Response(
            JSON.stringify({ error: 'Profile not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const currentLevel = (profile as Record<string, unknown>)[levelColumn] as number || 0;
        
        if (currentLevel >= catalog.maxLevel) {
          return new Response(
            JSON.stringify({ error: 'Max level reached' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const cost = catalog.costs[currentLevel];
        if (profile.energy < cost) {
          return new Response(
            JSON.stringify({ error: 'Not enough energy', required: cost, current: profile.energy }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const newLevel = currentLevel + 1;
        const newEnergy = profile.energy - cost;

        // Update profile level + energy
        const updateData: Record<string, unknown> = { 
          energy: newEnergy, 
          [levelColumn]: newLevel 
        };
        
        // If upgrading max_stamina, also update the max_stamina column
        if (upgradeType === 'max_stamina') {
          updateData.max_stamina = catalog.values[newLevel];
        }

        await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', profile.id);

        // Upsert upgrade record
        await supabase
          .from('upgrades')
          .upsert({
            profile_id: profile.id,
            upgrade_type: upgradeType,
            level: newLevel,
            purchased_at: new Date().toISOString(),
          }, { onConflict: 'profile_id,upgrade_type' });

        return new Response(
          JSON.stringify({ 
            success: true, 
            newLevel, 
            newValue: catalog.values[newLevel],
            energy: newEnergy,
            upgradeType,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create-clan': {
        const body = await req.json();
        const { name } = body;

        if (!name || typeof name !== 'string' || name.length < 3 || name.length > 20) {
          return new Response(
            JSON.stringify({ error: 'Clan name must be 3-20 characters' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('id, clan_id, energy')
          .eq('telegram_id', telegramUserId)
          .single();

        if (!profile) {
          return new Response(
            JSON.stringify({ error: 'Profile not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (profile.clan_id) {
          return new Response(
            JSON.stringify({ error: 'Already in a clan' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Cost to create clan: 500 energy
        if (profile.energy < 500) {
          return new Response(
            JSON.stringify({ error: 'Need 500 energy to create a clan' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: clan, error: clanError } = await supabase
          .from('clans')
          .insert({ name, created_by: profile.id, total_energy: profile.energy - 500 })
          .select()
          .single();

        if (clanError) {
          if (clanError.code === '23505') {
            return new Response(
              JSON.stringify({ error: 'Clan name already taken' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          throw clanError;
        }

        await supabase
          .from('clan_members')
          .insert({ profile_id: profile.id, clan_id: clan.id, role: 'leader' });

        await supabase
          .from('profiles')
          .update({ clan_id: clan.id, energy: profile.energy - 500 })
          .eq('id', profile.id);

        return new Response(
          JSON.stringify({ success: true, clan, energy: profile.energy - 500 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'join-clan': {
        const body = await req.json();
        const { clanId } = body;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id, clan_id, energy')
          .eq('telegram_id', telegramUserId)
          .single();

        if (!profile) {
          return new Response(
            JSON.stringify({ error: 'Profile not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (profile.clan_id) {
          return new Response(
            JSON.stringify({ error: 'Already in a clan' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: clan } = await supabase
          .from('clans')
          .select('id, member_count, total_energy')
          .eq('id', clanId)
          .single();

        if (!clan) {
          return new Response(
            JSON.stringify({ error: 'Clan not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        await supabase
          .from('clan_members')
          .insert({ profile_id: profile.id, clan_id: clan.id });

        await supabase
          .from('clans')
          .update({ member_count: clan.member_count + 1, total_energy: clan.total_energy + profile.energy })
          .eq('id', clan.id);

        await supabase
          .from('profiles')
          .update({ clan_id: clan.id })
          .eq('id', profile.id);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'leave-clan': {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, clan_id, energy')
          .eq('telegram_id', telegramUserId)
          .single();

        if (!profile || !profile.clan_id) {
          return new Response(
            JSON.stringify({ error: 'Not in a clan' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        await supabase
          .from('clan_members')
          .delete()
          .eq('profile_id', profile.id)
          .eq('clan_id', profile.clan_id);

        const { data: clan } = await supabase
          .from('clans')
          .select('member_count, total_energy')
          .eq('id', profile.clan_id)
          .single();

        if (clan) {
          await supabase
            .from('clans')
            .update({ member_count: Math.max(0, clan.member_count - 1), total_energy: Math.max(0, clan.total_energy - profile.energy) })
            .eq('id', profile.clan_id);
        }

        await supabase
          .from('profiles')
          .update({ clan_id: null })
          .eq('id', profile.id);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'clan-leaderboard': {
        const { data: clans } = await supabase
          .from('clans')
          .select('id, name, member_count, total_energy')
          .order('total_energy', { ascending: false })
          .limit(50);

        return new Response(
          JSON.stringify({ clans: clans || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'check-daily-combo': {
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

        const today = new Date().toISOString().split('T')[0];
        
        let { data: combo } = await supabase
          .from('daily_combos')
          .select('*')
          .eq('date', today)
          .maybeSingle();

        // Auto-generate daily combo if none exists
        if (!combo) {
          const types = Object.keys(UPGRADE_CATALOG);
          const shuffled = types.sort(() => Math.random() - 0.5);
          const todayCombo = shuffled.slice(0, 3);

          const { data: newCombo } = await supabase
            .from('daily_combos')
            .insert({ date: today, combo: todayCombo })
            .select()
            .single();
          combo = newCombo;
        }

        if (!combo) {
          return new Response(
            JSON.stringify({ error: 'Failed to get combo' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if user already claimed
        const claimedBy = (combo.claimed_by as string[]) || [];
        const alreadyClaimed = claimedBy.includes(profile.id);

        // Get user's upgrades purchased today
        const { data: todayUpgrades } = await supabase
          .from('upgrades')
          .select('upgrade_type')
          .eq('profile_id', profile.id)
          .gte('purchased_at', `${today}T00:00:00Z`);

        const purchasedTypes = (todayUpgrades || []).map(u => u.upgrade_type);
        const comboTypes = combo.combo as string[];
        const matched = comboTypes.filter(t => purchasedTypes.includes(t));
        const isComplete = matched.length === 3 && !alreadyClaimed;

        // Auto-claim if complete
        if (isComplete) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('energy')
            .eq('id', profile.id)
            .single();

          if (userProfile) {
            await supabase
              .from('profiles')
              .update({ energy: userProfile.energy + 1000 })
              .eq('id', profile.id);

            await supabase
              .from('daily_combos')
              .update({ claimed_by: [...claimedBy, profile.id] })
              .eq('date', today);
          }
        }

        return new Response(
          JSON.stringify({
            combo: comboTypes,
            matched,
            isComplete,
            alreadyClaimed,
            reward: isComplete ? 1000 : 0,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'verify-mission': {
        const body = await req.json();
        const { missionId, verifyType } = body;

        if (!missionId || !verifyType) {
          return new Response(
            JSON.stringify({ error: 'Invalid request' }),
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

        if (verifyType === 'telegram_channel') {
          // Map mission IDs to chat IDs
          const channelMap: Record<string, string> = {
            'tg_channel': '@AlienFlow',
            'tg_group': '@AlienFlowChat',
          };
          
          const chatId = channelMap[missionId];
          if (!chatId) {
            return new Response(
              JSON.stringify({ verified: false, error: 'Unknown channel' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          try {
            const tgResponse = await fetch(
              `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${encodeURIComponent(chatId)}&user_id=${telegramUserId}`
            );
            const tgData = await tgResponse.json();

            if (tgData.ok) {
              const status = tgData.result?.status;
              const isMember = ['member', 'administrator', 'creator'].includes(status);
              
              if (isMember) {
                // Auto-complete the mission
                const now = new Date().toISOString();
                await supabase
                  .from('missions_completed')
                  .upsert({
                    profile_id: profile.id,
                    mission_id: missionId,
                    started_at: now,
                    completed_at: now,
                  }, { onConflict: 'profile_id,mission_id' });

                return new Response(
                  JSON.stringify({ verified: true }),
                  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
              } else {
                return new Response(
                  JSON.stringify({ verified: false, error: 'No eres miembro del canal. Únete primero.' }),
                  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
              }
            } else {
              console.error('Telegram API error:', tgData.description);
              return new Response(
                JSON.stringify({ verified: false, error: 'Error al verificar. Inténtalo de nuevo.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          } catch (err) {
            console.error('Telegram verify error:', err);
            return new Response(
              JSON.stringify({ verified: false, error: 'Error de conexión' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        if (verifyType === 'x_follow') {
          // X verification requires API keys - not yet configured
          // Fall through to time-based verification
          return new Response(
            JSON.stringify({ verified: false, error: 'Verificación de X próximamente. Usa verificación por tiempo.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ verified: false, error: 'Unknown verify type' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'spin-wheel': {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, energy, last_free_spin, total_spins, multiplier, multiplier_expires_at')
          .eq('telegram_id', telegramUserId)
          .single();

        if (!profile) {
          return new Response(
            JSON.stringify({ error: 'Profile not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check free spin eligibility
        const now = new Date();
        const lastSpin = profile.last_free_spin ? new Date(profile.last_free_spin) : null;
        const canSpinFree = !lastSpin || (now.getTime() - lastSpin.getTime()) > 24 * 60 * 60 * 1000;

        if (!canSpinFree) {
          return new Response(
            JSON.stringify({ error: 'No free spin available', canSpinFree: false }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Weighted random prize selection
        const PRIZES = [
          { label: '10', value: 10, type: 'energy', weight: 25 },
          { label: '25', value: 25, type: 'energy', weight: 20 },
          { label: '50', value: 50, type: 'energy', weight: 15 },
          { label: '100', value: 100, type: 'energy', weight: 12 },
          { label: '250', value: 250, type: 'energy', weight: 8 },
          { label: '2×', value: 2, type: 'boost', weight: 5 },
          { label: '500', value: 500, type: 'energy', weight: 4 },
          { label: '💀', value: 0, type: 'empty', weight: 11 },
        ];

        const totalWeight = PRIZES.reduce((sum, p) => sum + p.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedPrize = PRIZES[0];
        
        for (const prize of PRIZES) {
          random -= prize.weight;
          if (random <= 0) {
            selectedPrize = prize;
            break;
          }
        }

        // Apply prize
        const updates: Record<string, unknown> = {
          last_free_spin: now.toISOString(),
          total_spins: (profile.total_spins || 0) + 1,
        };

        if (selectedPrize.type === 'energy') {
          updates.energy = profile.energy + selectedPrize.value;
        } else if (selectedPrize.type === 'boost') {
          updates.multiplier = 2;
          updates.multiplier_expires_at = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1h
        }

        await supabase.from('profiles').update(updates).eq('id', profile.id);

        return new Response(
          JSON.stringify({
            success: true,
            prize: selectedPrize,
            canSpinFree: false,
            newEnergy: selectedPrize.type === 'energy' ? profile.energy + selectedPrize.value : profile.energy,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get-wheel-status': {
        const { data: profile } = await supabase
          .from('profiles')
          .select('last_free_spin, total_spins')
          .eq('telegram_id', telegramUserId)
          .single();

        if (!profile) {
          return new Response(
            JSON.stringify({ error: 'Profile not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const now = new Date();
        const lastSpin = profile.last_free_spin ? new Date(profile.last_free_spin) : null;
        const canSpinFree = !lastSpin || (now.getTime() - lastSpin.getTime()) > 24 * 60 * 60 * 1000;

        return new Response(
          JSON.stringify({ canSpinFree, totalSpins: profile.total_spins || 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get-friends': {
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

        const { data: friends } = await supabase
          .from('profiles')
          .select('username, energy, last_seen_at')
          .eq('referred_by', profile.id)
          .order('energy', { ascending: false })
          .limit(50);

        return new Response(
          JSON.stringify({ friends: friends || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'verify-payment': {
        // TON payment verification endpoint
        // Requires TON Center API to verify transaction
        // For now, return not implemented
        return new Response(
          JSON.stringify({ error: 'Payment verification not yet configured' }),
          { status: 501, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
