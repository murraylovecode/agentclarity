import { supabase } from "@/lib/supabase/client";
import { setSeconds } from "date-fns";

export async function isLoggedIn() {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        return "true";
    }
    else {
        return false;
    }
}

export async function getSessionAccessToken() {
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.log(error)
    return ""
  }

  if (!session) {
    return ""
  }
  else {
    return session.access_token
  }
}

export async function getUserId() {
  const { data: { user }, error } = await supabase.auth.getUser()

  const { data: { session } } = await supabase.auth.getSession()

  console.log(session)

  if (error) {
    console.log(error)
  }

  if (!user) {
    return ""
  }

  return user.id
}
