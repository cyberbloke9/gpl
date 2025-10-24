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

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get today's date in IST
    const today = new Date().toISOString().split('T')[0];

    // Fetch today's data from all tables
    const [checklistsRes, transformerRes, generatorRes, issuesRes] = await Promise.all([
      supabase.from('checklists').select('*').eq('date', today),
      supabase.from('transformer_logs').select('*').eq('date', today),
      supabase.from('generator_logs').select('*').eq('date', today),
      supabase.from('flagged_issues').select('*').gte('reported_at', `${today}T00:00:00`),
    ]);

    const checklists = checklistsRes.data || [];
    const transformerLogs = transformerRes.data || [];
    const generatorLogs = generatorRes.data || [];
    const issues = issuesRes.data || [];

    // Calculate key metrics
    const checklistsCompleted = checklists.filter(c => c.submitted).length;
    const checklistsCompletion = checklists.length > 0 
      ? Math.round((checklistsCompleted / checklists.length) * 100) 
      : 0;
    
    const transformerHours = new Set(transformerLogs.map(l => `${l.transformer_number}-${l.hour}`)).size;
    const generatorHours = new Set(generatorLogs.map(l => l.hour)).size;
    
    const openIssues = issues.filter(i => i.status === 'reported').length;
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;

    // Calculate averages for anomaly detection
    const avgGenPower = generatorLogs.length > 0
      ? generatorLogs.reduce((sum, l) => sum + (l.gen_kw || 0), 0) / generatorLogs.length
      : 0;
    
    const avgGenFreq = generatorLogs.length > 0
      ? generatorLogs.reduce((sum, l) => sum + (l.gen_frequency || 0), 0) / generatorLogs.length
      : 0;

    // Prepare context for AI
    const dataContext = `
Date: ${today}

OPERATIONAL METRICS:
- Checklists: ${checklists.length} started, ${checklistsCompleted} completed (${checklistsCompletion}% completion rate)
- Transformer Logs: ${transformerHours} hours logged across all transformers
- Generator Logs: ${generatorHours} hours logged (out of 24 hours)
- Average Generator Power: ${avgGenPower.toFixed(2)} kW
- Average Generator Frequency: ${avgGenFreq.toFixed(2)} Hz

ISSUES:
- Total Issues Reported Today: ${issues.length}
- Open Issues: ${openIssues}
- Critical Issues: ${criticalIssues}
${issues.length > 0 ? `- Recent Issues: ${issues.slice(0, 5).map(i => `${i.severity}: ${i.description}`).join('; ')}` : ''}

ANOMALIES TO CHECK:
- Generator frequency deviation from 50 Hz: ${Math.abs(50 - avgGenFreq).toFixed(2)} Hz
- Checklist completion rate ${checklistsCompletion < 80 ? 'below target (80%)' : 'on target'}
- Generator hours logged ${generatorHours < 20 ? 'below expected (24 hours)' : 'complete'}
`;

    console.log('Sending data to AI:', dataContext);

    // Call Lovable AI for summary generation
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
            content: `You are an AI assistant for a hydroelectric power plant operations management system. Generate concise, actionable daily executive summaries. Focus on:
1. Overall operational status (completion rates, coverage)
2. Key performance indicators (power output, frequency stability)
3. Critical issues requiring immediate attention
4. Notable anomalies or deviations from normal operations
5. Actionable recommendations for management

Keep the summary concise (200-300 words), professional, and action-oriented. Use bullet points for clarity.`
          },
          {
            role: 'user',
            content: `Generate a daily executive summary for the following operational data:\n\n${dataContext}`
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
    const summary = aiData.choices[0].message.content;

    console.log('Generated summary:', summary);

    return new Response(
      JSON.stringify({
        summary,
        metrics: {
          checklists: { total: checklists.length, completed: checklistsCompleted, completionRate: checklistsCompletion },
          transformer: { hoursLogged: transformerHours },
          generator: { hoursLogged: generatorHours, avgPower: avgGenPower, avgFrequency: avgGenFreq },
          issues: { total: issues.length, open: openIssues, critical: criticalIssues }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating daily summary:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});