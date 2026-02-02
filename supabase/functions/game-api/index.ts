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
    
    // Sort parameters and create data check string
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Create secret key using HMAC-SHA256
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
    
    // Calculate hash
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
    
    // Parse user data
    const userStr = params.get('user');
    if (!userStr) return { valid: false };
    
    const user = JSON.parse(userStr);
    return { valid: true, user };
  } catch (error) {
    console.error('Telegram validation error:', error);
    return { valid: false };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
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

    // Get and validate Telegram init data
    const initData = req.headers.get('x-telegram-init-data');
    
    // Allow dev mode for testing (only in development)
    const isDev = initData === 'dev_mode';
    let telegramUserId: string;
    let telegramUsername: string | null = null;
    
    if (isDev) {
      // Development mode - use fixed test user
      telegramUserId = 'dev_user_123';
      telegramUsername = 'AlienDev';
    } else if (initData) {
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

    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();
    
    // Route handling
    switch (action) {
      case 'init-profile': {
        // Get or create profile
        let { data: profile, error } = await supabase
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
            })
            .select()
            .single();
          
          if (createError) throw createError;
          profile = newProfile;
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
        
        // Get completed missions
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
        // Get current profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, energy, stamina')
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
        
        // Atomic update
        const newEnergy = profile.energy + 1;
        const newStamina = profile.stamina - 1;
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            energy: newEnergy, 
            stamina: newStamina, 
            last_stamina_update: new Date().toISOString() 
          })
          .eq('id', profile.id)
          .eq('stamina', profile.stamina); // Optimistic lock
        
        if (updateError) {
          return new Response(
            JSON.stringify({ success: false, error: 'Update failed' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ success: true, energy: newEnergy, stamina: newStamina }),
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
        
        // Get mission status
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
        
        // Check 33 second requirement
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
        
        // Update mission and energy atomically
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
      
      default:
        return new Response(
          JSON.stringify({ error: 'Not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Game API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
