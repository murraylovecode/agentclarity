import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface AdminActionRequest {
  action: "reset_password" | "create_user" | "delete_user" | "update_user";
  userId?: string;
  email?: string;
  password?: string;
  fullName?: string;
  role?: "user" | "admin" | "super_admin";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: requestingUser }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !requestingUser) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if requesting user is admin
    const { data: roles } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id);

    const isAdmin = roles?.some(r => r.role === "admin" || r.role === "super_admin");
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const body: AdminActionRequest = await req.json();
    console.log("Admin action requested:", body.action);

    switch (body.action) {
      case "reset_password": {
        if (!body.userId || !body.password) {
          return new Response(
            JSON.stringify({ error: "userId and password are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabaseAdmin.auth.admin.updateUserById(body.userId, {
          password: body.password,
        });

        if (error) throw error;

        // Log the action
        await supabaseAdmin.from("admin_audit_logs").insert({
          admin_user_id: requestingUser.id,
          action: "reset_password",
          target_table: "auth.users",
          target_id: body.userId,
        });

        return new Response(
          JSON.stringify({ success: true, message: "Password reset successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "create_user": {
        if (!body.email || !body.password) {
          return new Response(
            JSON.stringify({ error: "email and password are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: body.email,
          password: body.password,
          email_confirm: true,
          user_metadata: { full_name: body.fullName },
        });

        if (createError) throw createError;

        // Create profile
        await supabaseAdmin.from("profiles").insert({
          id: newUser.user.id,
          email: body.email,
          full_name: body.fullName || null,
        });

        // Create role
        await supabaseAdmin.from("user_roles").insert({
          user_id: newUser.user.id,
          role: body.role || "user",
        });

        // Log the action
        await supabaseAdmin.from("admin_audit_logs").insert({
          admin_user_id: requestingUser.id,
          action: "create_user",
          target_table: "auth.users",
          target_id: newUser.user.id,
          new_values: { email: body.email, role: body.role || "user" },
        });

        return new Response(
          JSON.stringify({ success: true, message: "User created successfully", userId: newUser.user.id }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "delete_user": {
        if (!body.userId) {
          return new Response(
            JSON.stringify({ error: "userId is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Prevent deleting yourself
        if (body.userId === requestingUser.id) {
          return new Response(
            JSON.stringify({ error: "Cannot delete your own account" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get user info before deletion for audit
        const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(body.userId);

        const { error } = await supabaseAdmin.auth.admin.deleteUser(body.userId);
        if (error) throw error;

        // Log the action
        await supabaseAdmin.from("admin_audit_logs").insert({
          admin_user_id: requestingUser.id,
          action: "delete_user",
          target_table: "auth.users",
          target_id: body.userId,
          old_values: { email: targetUser?.user?.email },
        });

        return new Response(
          JSON.stringify({ success: true, message: "User deleted successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "update_user": {
        if (!body.userId) {
          return new Response(
            JSON.stringify({ error: "userId is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const updates: Record<string, unknown> = {};
        if (body.email) updates.email = body.email;
        if (body.password) updates.password = body.password;

        if (Object.keys(updates).length > 0) {
          const { error } = await supabaseAdmin.auth.admin.updateUserById(body.userId, updates);
          if (error) throw error;
        }

        // Log the action
        await supabaseAdmin.from("admin_audit_logs").insert({
          admin_user_id: requestingUser.id,
          action: "update_user",
          target_table: "auth.users",
          target_id: body.userId,
          new_values: updates,
        });

        return new Response(
          JSON.stringify({ success: true, message: "User updated successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Admin action error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
