import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    // Verify authentication and admin role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
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
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { query } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processing query:', query);

    // Fetch recent data to provide context for AI
    const today = new Date().toISOString().split('T')[0];
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [checklistsRes, transformerRes, generatorRes, issuesRes] = await Promise.all([
      supabase.from('checklists').select('*').gte('date', lastWeek).order('date', { ascending: false }),
      supabase.from('transformer_logs').select('*').gte('date', lastWeek).order('date', { ascending: false }),
      supabase.from('generator_logs').select('*').gte('date', lastWeek).order('date', { ascending: false }),
      supabase.from('flagged_issues').select('*').gte('reported_at', `${lastWeek}T00:00:00`).order('reported_at', { ascending: false }),
    ]);

    const checklists = checklistsRes.data || [];
    const transformerLogs = transformerRes.data || [];
    const generatorLogs = generatorRes.data || [];
    const issues = issuesRes.data || [];

    // Prepare aggregated statistics for AI context
    const checklistStats = {
      total: checklists.length,
      completed: checklists.filter(c => c.submitted).length,
      avgCompletion: checklists.length > 0 
        ? Math.round(checklists.reduce((sum, c) => sum + (c.completion_percentage || 0), 0) / checklists.length)
        : 0,
    };

    const transformerStats = {
      totalLogs: transformerLogs.length,
      uniqueDays: new Set(transformerLogs.map(l => l.date)).size,
      avgOilTemp: transformerLogs.length > 0
        ? transformerLogs.reduce((sum, l) => sum + (l.oil_temperature || 0), 0) / transformerLogs.length
        : 0,
    };

    const generatorStats = {
      totalLogs: generatorLogs.length,
      uniqueDays: new Set(generatorLogs.map(l => l.date)).size,
      avgPower: generatorLogs.length > 0
        ? generatorLogs.reduce((sum, l) => sum + (l.gen_kw || 0), 0) / generatorLogs.length
        : 0,
      avgFrequency: generatorLogs.length > 0
        ? generatorLogs.reduce((sum, l) => sum + (l.gen_frequency || 0), 0) / generatorLogs.length
        : 0,
    };

    const issueStats = {
      total: issues.length,
      open: issues.filter(i => i.status === 'reported').length,
      resolved: issues.filter(i => i.status === 'resolved').length,
      critical: issues.filter(i => i.severity === 'critical').length,
      bySeverity: {
        critical: issues.filter(i => i.severity === 'critical').length,
        high: issues.filter(i => i.severity === 'high').length,
        medium: issues.filter(i => i.severity === 'medium').length,
        low: issues.filter(i => i.severity === 'low').length,
      }
    };

    const dataContext = `
AVAILABLE DATA (Last 7 Days):

CHECKLISTS:
- Total: ${checklistStats.total}
- Completed: ${checklistStats.completed}
- Average Completion: ${checklistStats.avgCompletion}%

TRANSFORMER LOGS:
- Total Logs: ${transformerStats.totalLogs}
- Days Covered: ${transformerStats.uniqueDays}
- Average Oil Temperature: ${transformerStats.avgOilTemp.toFixed(2)}°C

GENERATOR LOGS:
- Total Logs: ${generatorStats.totalLogs}
- Days Covered: ${generatorStats.uniqueDays}
- Average Power Output: ${generatorStats.avgPower.toFixed(2)} kW
- Average Frequency: ${generatorStats.avgFrequency.toFixed(2)} Hz

ISSUES:
- Total: ${issueStats.total}
- Open: ${issueStats.open}
- Resolved: ${issueStats.resolved}
- Critical: ${issueStats.critical}
- By Severity: Critical=${issueStats.bySeverity.critical}, High=${issueStats.bySeverity.high}, Medium=${issueStats.bySeverity.medium}, Low=${issueStats.bySeverity.low}
`;

    console.log('Sending query to AI with context');

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant for a hydroelectric power plant operations management system. Answer questions about operational data with precise, actionable insights. Use the provided data to give accurate answers. If you don't have enough data to answer accurately, say so. Format your response with clear sections and bullet points. Include specific numbers and percentages when relevant.`
          },
          {
            role: 'user',
            content: `DATA CONTEXT:\n${dataContext}\n\nQUESTION: ${query}\n\nProvide a detailed, data-driven answer.`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service requires payment. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const answer = aiData.choices[0].message.content;

    console.log('Generated answer:', answer);

    return new Response(
      JSON.stringify({
        query,
        answer,
        dataContext: {
          checklists: checklistStats,
          transformer: transformerStats,
          generator: generatorStats,
          issues: issueStats,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing query:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});