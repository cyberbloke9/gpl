import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Audit logging helper
const logAdminAction = async (
  supabaseClient: any,
  adminId: string,
  action: string,
  details: any,
  req: Request
) => {
  try {
    await supabaseClient.from('admin_audit_log').insert({
      admin_id: adminId,
      action,
      target_user_id: null,
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

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify the request has a valid auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the user from the auth token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || roleData?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body for pagination and search parameters
    let page = 1;
    let per_page = 50;
    let search = '';

    try {
      const body = await req.json().catch(() => ({}));
      page = body.page || 1;
      per_page = Math.min(body.per_page || 50, 100); // Max 100 per page
      search = body.search || '';
    } catch (e) {
      // Use defaults if parsing fails
    }

    console.log('Fetching users', { page, per_page, hasSearch: !!search, timestamp: Date.now() });

    // Fetch all users with their auth data
    const { data: authUsers, error: authError } = await supabaseClient.auth.admin.listUsers();

    if (authError) {
      throw authError;
    }

    // Fetch profiles and roles
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, full_name, employee_id, shift, created_at');

    if (profilesError) {
      throw profilesError;
    }

    const { data: roles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) {
      throw rolesError;
    }

    // Combine all data
    let usersWithDetails = authUsers.users.map(authUser => {
      const profile = profiles?.find(p => p.id === authUser.id);
      const role = roles?.find(r => r.user_id === authUser.id);

      return {
        id: authUser.id,
        email: authUser.email,
        full_name: profile?.full_name || 'N/A',
        employee_id: profile?.employee_id || null,
        shift: profile?.shift || null,
        role: role?.role || 'operator',
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
      };
    });

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      usersWithDetails = usersWithDetails.filter(u =>
        u.email?.toLowerCase().includes(searchLower) ||
        u.full_name?.toLowerCase().includes(searchLower) ||
        u.employee_id?.toLowerCase().includes(searchLower)
      );
    }

    const totalCount = usersWithDetails.length;
    const totalPages = Math.ceil(totalCount / per_page);
    const offset = (page - 1) * per_page;

    // Paginate results
    const paginatedUsers = usersWithDetails.slice(offset, offset + per_page);

    // Log the user listing action
    await logAdminAction(supabaseClient, user.id, 'list_users', 
      { 
        page, 
        per_page, 
        search: search || null,
        resultCount: paginatedUsers.length,
        totalCount 
      }, req);

    console.log('Users fetched', { count: paginatedUsers.length, total: totalCount, timestamp: Date.now() });

    return new Response(
      JSON.stringify({ 
        users: paginatedUsers,
        pagination: {
          page,
          per_page,
          total_count: totalCount,
          total_pages: totalPages
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching users', { type: error instanceof Error ? error.name : 'unknown', timestamp: Date.now() });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});