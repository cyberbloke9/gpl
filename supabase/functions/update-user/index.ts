import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { z } from 'https://esm.sh/zod@3.22.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validation schema
const updateUserSchema = z.object({
  user_id: z.string().uuid('Invalid user ID format'),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long')
    .optional(),
  full_name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name contains invalid characters')
    .optional(),
  employee_id: z.string()
    .trim()
    .max(20, 'Employee ID too long')
    .regex(/^[A-Z0-9-]*$/, 'Employee ID must contain only uppercase letters, numbers, and hyphens')
    .optional()
    .nullable(),
  shift: z.enum(['Day', 'Night', 'Rotating'], {
    errorMap: () => ({ message: 'Shift must be Day, Night, or Rotating' })
  })
    .optional()
    .nullable(),
  role: z.enum(['admin', 'operator'], {
    errorMap: () => ({ message: 'Role must be admin or operator' })
  })
    .optional()
});

// Audit logging helper
const logAdminAction = async (
  supabaseClient: any,
  adminId: string,
  action: string,
  details: any,
  req: Request,
  targetUserId?: string
) => {
  try {
    await supabaseClient.from('admin_audit_log').insert({
      admin_id: adminId,
      action,
      target_user_id: targetUserId || null,
      details,
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown'
    });
  } catch (error) {
    console.error('Audit log failed', { timestamp: Date.now() });
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('Update user request received', { timestamp: Date.now() });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the requesting user is an admin
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      console.error('Auth verification failed', { timestamp: Date.now() });
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || roleData?.role !== 'admin') {
      console.error('Admin check failed', { timestamp: Date.now() });
      return new Response(
        JSON.stringify({ error: 'Only admins can update users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse and validate request body
    const body = await req.text();
    
    // Request size validation
    if (body.length > 10000) {
      await logAdminAction(supabaseAdmin, user.id, 'update_user_failed', 
        { reason: 'request_too_large' }, req);
      return new Response(
        JSON.stringify({ error: 'Request too large' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let requestData;
    try {
      requestData = JSON.parse(body);
    } catch (e) {
      await logAdminAction(supabaseAdmin, user.id, 'update_user_failed', 
        { reason: 'invalid_json' }, req);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate with Zod
    let validatedData;
    try {
      validatedData = updateUserSchema.parse(requestData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        await logAdminAction(supabaseAdmin, user.id, 'update_user_failed', 
          { reason: 'validation_error', field: error.issues[0].path[0] }, req);
        return new Response(
          JSON.stringify({ 
            error: 'Validation failed',
            details: error.issues[0].message 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      throw error;
    }

    const { user_id, email, full_name, employee_id, shift, role } = validatedData;

    console.log('Updating user', { userId: user_id, timestamp: Date.now() })

    const updates: any = {};

    // Update email if provided
    if (email) {
      const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(
        user_id,
        { email }
      )
      
      if (emailError) {
        console.error('Email update failed', { timestamp: Date.now() })
        await logAdminAction(supabaseAdmin, user.id, 'update_user_failed', 
          { reason: 'email_error', userId: user_id }, req, user_id);
        return new Response(
          JSON.stringify({ error: 'Failed to update email' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      updates.email = email;
    }

    // Update profile if any profile fields provided
    if (full_name || employee_id !== undefined || shift !== undefined) {
      const profileUpdates: any = {};
      if (full_name) profileUpdates.full_name = full_name;
      if (employee_id !== undefined) profileUpdates.employee_id = employee_id;
      if (shift !== undefined) profileUpdates.shift = shift;

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user_id)

      if (profileError) {
        console.error('Profile update failed', { timestamp: Date.now() })
        await logAdminAction(supabaseAdmin, user.id, 'update_user_failed', 
          { reason: 'profile_error', userId: user_id }, req, user_id);
        return new Response(
          JSON.stringify({ error: 'Failed to update profile' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      Object.assign(updates, profileUpdates);
    }

    // Update role if provided
    if (role) {
      // Delete old role and insert new one
      const { error: deleteError } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', user_id)

      if (deleteError) {
        console.error('Role deletion failed', { timestamp: Date.now() })
        await logAdminAction(supabaseAdmin, user.id, 'update_user_failed', 
          { reason: 'role_delete_error', userId: user_id }, req, user_id);
        return new Response(
          JSON.stringify({ error: 'Failed to update role' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error: roleInsertError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: user_id,
          role: role
        })

      if (roleInsertError) {
        console.error('Role insertion failed', { timestamp: Date.now() })
        await logAdminAction(supabaseAdmin, user.id, 'update_user_failed', 
          { reason: 'role_insert_error', userId: user_id }, req, user_id);
        return new Response(
          JSON.stringify({ error: 'Failed to update role' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      updates.role = role;
    }

    // Log successful user update
    await logAdminAction(supabaseAdmin, user.id, 'update_user', 
      { userId: user_id, changes: Object.keys(updates) }, req, user_id);

    console.log('User updated successfully', { timestamp: Date.now() })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User updated successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error', { type: error instanceof Error ? error.name : 'unknown', timestamp: Date.now() })
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})