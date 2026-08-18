/**
 * Who the assistant is talking to.
 *
 * The backend records a conversation against a user when the request carries
 * `X-User-Token`, and reads it back the same way. Both halves — POST /api/chat
 * and GET /api/chat/history — need to agree on where that token comes from and
 * what shape it is in, and an auth-header parse copied into two routes is
 * exactly the sort of thing that drifts apart the first time one is touched.
 */

/**
 * The signed-in visitor's token, or null for a guest.
 *
 * This is the JWT access token — the same one every other user-scoped route
 * forwards as `Authorization: Bearer`, not a separate credential. It is read
 * from the Authorization header for that reason (see pages/api/profile.js): the
 * widget sends it exactly as it would to any of them, and only the header it
 * ends up in differs.
 *
 * Note it is rotated every ten minutes by the auth context, so callers must
 * treat an expired token as routine rather than exceptional.
 *
 * The `Bearer` prefix is stripped. The backend wants the bare token in
 * X-User-Token — that header is not an Authorization header and does not carry
 * a scheme. Sending "Bearer eyJ…" there would be read as the token itself and
 * simply not match anyone.
 */
export function userTokenOf(request) {
  const raw = request?.headers?.get?.("authorization") || "";
  const token = raw.replace(/^Bearer\s+/i, "").trim();
  return token || null;
}
