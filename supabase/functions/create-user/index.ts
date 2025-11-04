import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { z } from 'https://esm.sh/zod@3.22.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validation schema
const createUserSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long'),
  password: z.string()
    .min(8, 'Minimum 8 characters required')
    .max(100, 'Maximum 100 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  full_name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name contains invalid characters'),
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Create user request received', { timestamp: Date.now() });

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
        JSON.stringify({ error: 'Only admins can create users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse and validate request body
    const body = await req.text();
    
    // Request size validation
    if (body.length > 10000) {
      await logAdminAction(supabaseAdmin, user.id, 'create_user_failed', 
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
      await logAdminAction(supabaseAdmin, user.id, 'create_user_failed', 
        { reason: 'invalid_json' }, req);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate with Zod
    let validatedData;
    try {
      validatedData = createUserSchema.parse(requestData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        await logAdminAction(supabaseAdmin, user.id, 'create_user_failed', 
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

    console.log('Creating user', { email: validatedData.email, timestamp: Date.now() })

    // Create user using admin API (bypasses email confirmation)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: validatedData.full_name,
        employee_id: validatedData.employee_id
      }
    })

    if (createError) {
      console.error('User creation failed', { timestamp: Date.now() })
      await logAdminAction(supabaseAdmin, user.id, 'create_user_failed', 
        { reason: 'auth_error', email: validatedData.email }, req);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User created', { userId: newUser.user.id, timestamp: Date.now() })

    // Insert profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUser.user.id,
        full_name: validatedData.full_name,
        employee_id: validatedData.employee_id || null,
        shift: validatedData.shift || null
      })

    if (profileError) {
      console.error('Profile creation failed', { timestamp: Date.now() })
      // Delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      await logAdminAction(supabaseAdmin, user.id, 'create_user_failed', 
        { reason: 'profile_error', email: validatedData.email }, req);
      return new Response(
        JSON.stringify({ error: 'Failed to create user profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert role
    const { error: roleInsertError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: validatedData.role
      })

    if (roleInsertError) {
      console.error('Role assignment failed', { timestamp: Date.now() })
      // Clean up profile and auth user
      await supabaseAdmin.from('profiles').delete().eq('id', newUser.user.id)
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      await logAdminAction(supabaseAdmin, user.id, 'create_user_failed', 
        { reason: 'role_error', email: validatedData.email }, req);
      return new Response(
        JSON.stringify({ error: 'Failed to assign user role' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log successful user creation
    await logAdminAction(supabaseAdmin, user.id, 'create_user', 
      { 
        email: validatedData.email, 
        role: validatedData.role,
        employee_id: validatedData.employee_id 
      }, req, newUser.user.id);

    console.log('User setup completed', { timestamp: Date.now() })

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          full_name: validatedData.full_name,
          employee_id: validatedData.employee_id,
          role: validatedData.role
        }
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