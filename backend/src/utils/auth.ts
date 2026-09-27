import type { Request } from "express";

import { supabase } from "../config/supabase.js";

export async function getAuthenticatedUserId(
  req: Request
): Promise<string | null> {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice(7);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user.id;
}