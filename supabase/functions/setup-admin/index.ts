import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const adminEmail = "murray.newlands@gmail.com";
    const adminPassword = "admin";

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === adminEmail);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      console.log("User already exists:", userId);
    } else {
      // Create the admin user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
      });

      if (createError) {
        throw createError;
      }

      userId = newUser.user.id;
      console.log("Created new user:", userId);

      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: userId,
          email: adminEmail,
          full_name: "Murray Newlands",
        });

      if (profileError) {
        console.log("Profile error (may already exist):", profileError.message);
      }
    }

    // Ensure super_admin role exists
    const { data: existingRole } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingRole) {
      // Update to super_admin
      await supabaseAdmin
        .from("user_roles")
        .update({ role: "super_admin" })
        .eq("user_id", userId);
    } else {
      // Insert super_admin role
      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: userId, role: "super_admin" });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Admin user created/updated successfully",
        userId 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
