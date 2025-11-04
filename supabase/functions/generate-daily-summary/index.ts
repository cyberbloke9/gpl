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
    
    // Parse request body for date parameters
    const body = await req.json().catch(() => ({}));
    const { date, startDate, endDate } = body;
    
    let queryStartDate: string;
    let queryEndDate: string;
    let periodDescription: string;
    
    if (startDate && endDate) {
      // Date range mode
      queryStartDate = startDate;
      queryEndDate = endDate;
      periodDescription = `${startDate} to ${endDate}`;
    } else if (date) {
      // Single date mode
      queryStartDate = date;
      queryEndDate = date;
      periodDescription = date;
    } else {
      // Default to today
      const today = new Date().toISOString().split('T')[0];
      queryStartDate = today;
      queryEndDate = today;
      periodDescription = today;
    }

    console.log('Analyzing operational data', { period: periodDescription, timestamp: Date.now() });

    // Fetch data for the specified period
    const [checklistsRes, transformerRes, generatorRes, issuesRes] = await Promise.all([
      supabase.from('checklists').select('*')
        .gte('date', queryStartDate)
        .lte('date', queryEndDate),
      supabase.from('transformer_logs').select('*')
        .gte('date', queryStartDate)
        .lte('date', queryEndDate),
      supabase.from('generator_logs').select('*')
        .gte('date', queryStartDate)
        .lte('date', queryEndDate),
      supabase.from('flagged_issues').select('*')
        .gte('reported_at', `${queryStartDate}T00:00:00`)
        .lte('reported_at', `${queryEndDate}T23:59:59`),
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
    
    const transformerHours = transformerLogs.length;
    const generatorHours = generatorLogs.length;
    
    const openIssues = issues.filter(i => i.status === 'reported').length;
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;

    // Calculate averages for anomaly detection
    const avgGenPower = generatorLogs.length > 0
      ? generatorLogs.reduce((sum, l) => sum + (l.gen_kw || 0), 0) / generatorLogs.length
      : 0;
    
    const avgGenFreq = generatorLogs.length > 0
      ? generatorLogs.reduce((sum, l) => sum + (l.gen_frequency || 0), 0) / generatorLogs.length
      : 0;

    // Calculate expected data points
    const daysDiff = Math.ceil((new Date(queryEndDate).getTime() - new Date(queryStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const expectedTransformerHours = daysDiff * 24 * 2; // 2 transformers
    const expectedGeneratorHours = daysDiff * 24;
    const expectedChecklists = daysDiff;

    const dataCompleteness = {
      transformer: ((transformerHours / expectedTransformerHours) * 100).toFixed(1),
      generator: ((generatorHours / expectedGeneratorHours) * 100).toFixed(1),
      checklist: ((checklists.length / expectedChecklists) * 100).toFixed(1),
    };

    // Prepare context for AI
    const dataContext = `
Analysis Period: ${periodDescription} (${daysDiff} day${daysDiff > 1 ? 's' : ''})

DATA COMPLETENESS:
- Transformer Logs: ${transformerHours}/${expectedTransformerHours} hours (${dataCompleteness.transformer}%)
- Generator Logs: ${generatorHours}/${expectedGeneratorHours} hours (${dataCompleteness.generator}%)
- Checklists: ${checklists.length}/${expectedChecklists} expected (${dataCompleteness.checklist}%)

OPERATIONAL METRICS:
- Checklists: ${checklists.length} started, ${checklistsCompleted} completed (${checklistsCompletion}% completion rate)
- Transformer Hours Logged: ${transformerHours} (expected ${expectedTransformerHours})
- Generator Hours Logged: ${generatorHours} (expected ${expectedGeneratorHours})
- Average Generator Power: ${avgGenPower.toFixed(2)} kW
- Average Generator Frequency: ${avgGenFreq.toFixed(2)} Hz

ISSUES:
- Total Issues Reported: ${issues.length}
- Open Issues: ${openIssues}
- Critical Issues: ${criticalIssues}
${issues.length > 0 ? `- Recent Issues: ${issues.slice(0, 5).map(i => `${i.severity}: ${i.description}`).join('; ')}` : ''}

ALERTS:
- Generator frequency deviation from 50 Hz: ${Math.abs(50 - avgGenFreq).toFixed(2)} Hz
- Checklist completion rate ${checklistsCompletion < 80 ? 'below target (80%)' : 'on target'}
- Data completeness ${Math.min(parseFloat(dataCompleteness.transformer), parseFloat(dataCompleteness.generator)) < 70 ? 'CONCERNING - significant gaps detected' : 'acceptable'}
`;

    console.log('Generating AI summary', { recordCount: checklists.length + transformerLogs.length + generatorLogs.length, timestamp: Date.now() });

    // Log summary generation action
    try {
      await supabase.from('admin_audit_log').insert({
        admin_id: user.id,
        action: 'generate_summary',
        details: { period: periodDescription, dataRecords: checklists.length + transformerLogs.length + generatorLogs.length },
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent')
      });
    } catch (e) {
      console.error('Audit log failed', { timestamp: Date.now() });
    }

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
            content: `You are an AI assistant for a hydroelectric power plant operations management system. Generate concise, actionable executive summaries. Focus on:
1. Data completeness and quality (flag if < 70%)
2. Overall operational status (completion rates, coverage)
3. Key performance indicators (power output, frequency stability)
4. Critical issues requiring immediate attention
5. Notable anomalies or deviations from normal operations
6. Actionable recommendations for management

If data completeness is below 70%, PRIORITIZE this in your summary and recommend immediate action to fill gaps.

Keep the summary concise (250-350 words), professional, and action-oriented. Use bullet points for clarity.`
          },
          {
            role: 'user',
            content: `Generate an executive summary for the following operational data:\n\n${dataContext}`
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

    console.log('Summary generated successfully', { timestamp: Date.now() });

    return new Response(
      JSON.stringify({
        summary,
        period: periodDescription,
        metrics: {
          checklists: { total: checklists.length, completed: checklistsCompleted, completionRate: checklistsCompletion },
          transformer: { hoursLogged: transformerHours, completeness: parseFloat(dataCompleteness.transformer) },
          generator: { hoursLogged: generatorHours, avgPower: avgGenPower, avgFrequency: avgGenFreq, completeness: parseFloat(dataCompleteness.generator) },
          issues: { total: issues.length, open: openIssues, critical: criticalIssues }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Summary generation error', { type: error instanceof Error ? error.name : 'unknown', timestamp: Date.now() });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
