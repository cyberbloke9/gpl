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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = await req.json().catch(() => ({}));
    const daysInRange = body.days || 30;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysInRange);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`Analyzing ${daysInRange} days from ${startDateStr} to ${endDateStr}`);

    const [transformerRes, generatorRes, issuesRes] = await Promise.all([
      supabase.from('transformer_logs').select('*').gte('date', startDateStr).lte('date', endDateStr).order('date', { ascending: true }),
      supabase.from('generator_logs').select('*').gte('date', startDateStr).lte('date', endDateStr).order('date', { ascending: true }),
      supabase.from('flagged_issues').select('*').gte('reported_at', `${startDateStr}T00:00:00`).lte('reported_at', `${endDateStr}T23:59:59`)
    ]);

    const transformerLogs = transformerRes.data || [];
    const generatorLogs = generatorRes.data || [];
    const issues = issuesRes.data || [];

    console.log(`Analyzing ${transformerLogs.length} transformer logs, ${generatorLogs.length} generator logs, ${issues.length} issues`);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${lovableApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: `Analyze this ${daysInRange}-day hydroelectric plant data and provide JSON with healthScores, maintenanceAlerts, complianceWarnings, optimizationSuggestions. Data: ${transformerLogs.length} transformer logs, ${generatorLogs.length} generator logs, ${issues.length} issues.`
        }]
      })
    });

    if (!aiResponse.ok) throw new Error(`AI API error: ${aiResponse.status}`);

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0].message.content;
    let structured = null;
    
    try {
      const jsonMatch = analysis.match(/```json\n([\s\S]*?)\n```/) || analysis.match(/{[\s\S]*}/);
      if (jsonMatch) structured = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } catch (e) {
      console.error('Parse error:', e);
    }

    return new Response(JSON.stringify({ analysis, structured }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
