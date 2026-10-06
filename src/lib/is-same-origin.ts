/** Check a browser Origin header against the deployment's configured public origin. */
export function isSameOriginRequest(
  originHeader: string | null,
  trustedSiteUrl: string | undefined,
): boolean {
  // 1: Fail closed when either the browser origin or deployment origin is unavailable.
  if (!originHeader || !trustedSiteUrl) return false;

  // 2: Compare normalized origins and reject malformed URLs.
  try {
    return new URL(originHeader).origin === new URL(trustedSiteUrl).origin;
  } catch {
    return false;
  }
}
