
-- Atomic referral application
CREATE OR REPLACE FUNCTION public.apply_referral_atomic(
  p_telegram_id text,
  p_referral_code text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile profiles%ROWTYPE;
  v_referrer profiles%ROWTYPE;
  v_updated_id uuid;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE telegram_id = p_telegram_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Profile not found', 'status', 404);
  END IF;

  IF v_profile.referral_code = p_referral_code THEN
    RETURN jsonb_build_object('error', 'Cannot use your own code', 'status', 400);
  END IF;

  SELECT * INTO v_referrer FROM profiles WHERE referral_code = p_referral_code;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Referral code not found', 'status', 404);
  END IF;

  -- Atomic update guarded by referred_by IS NULL
  UPDATE profiles
  SET referred_by = v_referrer.id,
      energy = energy + 50
  WHERE id = v_profile.id AND referred_by IS NULL
  RETURNING id INTO v_updated_id;

  IF v_updated_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Already used a referral code', 'status', 400);
  END IF;

  UPDATE profiles
  SET energy = energy + 100,
      referral_count = referral_count + 1
  WHERE id = v_referrer.id;

  RETURN jsonb_build_object('success', true, 'energyGained', 50, 'profileId', v_profile.id);
END;
$$;

-- Atomic daily reward claim
CREATE OR REPLACE FUNCTION public.claim_daily_atomic(
  p_telegram_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile profiles%ROWTYPE;
  v_new_streak int;
  v_reward int;
  v_updated_id uuid;
  v_now timestamptz := now();
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE telegram_id = p_telegram_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Profile not found', 'status', 404);
  END IF;

  v_new_streak := 1;
  IF v_profile.last_daily_claim IS NOT NULL THEN
    IF v_now - v_profile.last_daily_claim < interval '24 hours' THEN
      RETURN jsonb_build_object('error', 'Already claimed today', 'streak', v_profile.daily_streak, 'status', 400);
    END IF;
    IF v_now - v_profile.last_daily_claim < interval '48 hours' THEN
      v_new_streak := LEAST(v_profile.daily_streak + 1, 10);
    END IF;
  END IF;

  v_reward := LEAST(v_new_streak * 10, 100);

  -- Atomic update guarded by last_daily_claim
  UPDATE profiles
  SET energy = energy + v_reward,
      last_daily_claim = v_now,
      daily_streak = v_new_streak
  WHERE id = v_profile.id
    AND (last_daily_claim IS NULL OR v_now - last_daily_claim >= interval '24 hours')
  RETURNING id INTO v_updated_id;

  IF v_updated_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Already claimed today', 'streak', v_profile.daily_streak, 'status', 400);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'reward', v_reward,
    'streak', v_new_streak,
    'energy', v_profile.energy + v_reward,
    'profileId', v_profile.id
  );
END;
$$;

-- Atomic daily combo claim
CREATE OR REPLACE FUNCTION public.claim_daily_combo_atomic(
  p_profile_id uuid,
  p_date date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated_date date;
BEGIN
  -- Atomic claim: only succeeds if profile id not already in claimed_by array
  UPDATE daily_combos
  SET claimed_by = claimed_by || to_jsonb(p_profile_id)
  WHERE date = p_date
    AND NOT (claimed_by @> to_jsonb(ARRAY[p_profile_id]))
  RETURNING date INTO v_updated_date;

  IF v_updated_date IS NULL THEN
    RETURN jsonb_build_object('claimed', false);
  END IF;

  UPDATE profiles
  SET energy = energy + 1000
  WHERE id = p_profile_id;

  RETURN jsonb_build_object('claimed', true, 'reward', 1000);
END;
$$;
