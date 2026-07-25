import jwt from "jsonwebtoken";
import { getProjectRole, resolveProjectIdForDoc, roleRank } from "./db";

interface SupabaseJwtPayload {
  sub: string;
  email?: string;
}

export class AuthenticationError extends Error {}

/**
 * Verifies the Supabase-issued access token and confirms the connecting
 * user has at least viewer access to the project that owns this document.
 * This is the one place in the architecture where an application-layer
 * permission check is load-bearing rather than a Postgres RLS policy,
 * because this WebSocket server sits outside PostgREST/RLS entirely.
 */
export async function authenticateConnection(token: string | undefined, documentName: string) {
  if (!token) throw new AuthenticationError("missing token");

  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) throw new Error("SUPABASE_JWT_SECRET is not configured");

  let payload: SupabaseJwtPayload;
  try {
    payload = jwt.verify(token, secret, { algorithms: ["HS256"] }) as SupabaseJwtPayload;
  } catch {
    throw new AuthenticationError("invalid or expired token");
  }

  const projectId = await resolveProjectIdForDoc(documentName);
  if (!projectId) throw new AuthenticationError(`unknown document: ${documentName}`);

  const role = await getProjectRole(projectId, payload.sub);
  if (roleRank(role) < roleRank("viewer")) {
    throw new AuthenticationError("insufficient project role");
  }

  return { userId: payload.sub, projectId, role, readOnly: roleRank(role) < roleRank("editor") };
}
