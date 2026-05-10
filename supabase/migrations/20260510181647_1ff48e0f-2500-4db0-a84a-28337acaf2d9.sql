
REVOKE EXECUTE ON FUNCTION public.apply_referral_atomic(text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_daily_atomic(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_daily_combo_atomic(uuid, date) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.apply_referral_atomic(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_daily_atomic(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_daily_combo_atomic(uuid, date) TO service_role;
