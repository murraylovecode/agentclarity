import { supabase } from "@/lib/supabase/client";

export async function isLoggedIn() {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        return "true";
    }
    else {
        return false;
    }
}

export async function getUserId() {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.log(error)
  }

  if (!user) {
    return ""
  }

  return user.id
}
