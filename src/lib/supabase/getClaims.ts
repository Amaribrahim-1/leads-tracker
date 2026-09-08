import { createClient } from "./server";

/**
 * Asks: "does this request have a real login token?"
 *
 * Claims = facts packed inside that token (user id, email).
 * This checks the token is genuine. It does not load the full user profile.
 *
 * https://supabase.com/docs/reference/javascript/auth-getclaims
 */
export async function getClaims() {
  const supabase = await createClient();
  // Verify the cookie token. `claims` is the payload if valid, otherwise null.
  const { data } = await supabase.auth.getClaims();

  return data?.claims ?? null;
}
