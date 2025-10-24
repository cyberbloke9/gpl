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

    // Fetch historical data (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [transformerRes, generatorRes, issuesRes] = await Promise.all([
      supabase.from('transformer_logs').select('*').gte('date', thirtyDaysAgo).order('date', { ascending: true }),
      supabase.from('generator_logs').select('*').gte('date', thirtyDaysAgo).order('date', { ascending: true }),
      supabase.from('flagged_issues').select('*').gte('reported_at', `${thirtyDaysAgo}T00:00:00`).order('reported_at', { ascending: true }),
    ]);

    const transformerLogs = transformerRes.data || [];
    const generatorLogs = generatorRes.data || [];
    const issues = issuesRes.data || [];

    console.log(`Analyzing ${transformerLogs.length} transformer logs, ${generatorLogs.length} generator logs, ${issues.length} issues`);

    // Calculate transformer statistics by transformer number
    const transformerAnalysis: Record<number, any> = {};
    transformerLogs.forEach(log => {
      const tNum = log.transformer_number;
      if (!transformerAnalysis[tNum]) {
        transformerAnalysis[tNum] = {
          oilTemps: [],
          windingTemps: [],
          voltages: [],
          currents: [],
          issues: [],
        };
      }
      if (log.oil_temperature) transformerAnalysis[tNum].oilTemps.push(log.oil_temperature);
      if (log.winding_temperature) transformerAnalysis[tNum].windingTemps.push(log.winding_temperature);
      if (log.voltage_ry) transformerAnalysis[tNum].voltages.push(log.voltage_ry);
      if (log.current_r) transformerAnalysis[tNum].currents.push(log.current_r);
    });

    // Calculate generator statistics
    const generatorAnalysis = {
      powers: generatorLogs.map(l => l.gen_kw).filter(Boolean) as number[],
      frequencies: generatorLogs.map(l => l.gen_frequency).filter(Boolean) as number[],
      bearingTemps: generatorLogs.map(l => l.bearing_g_de_brg_main_ch7).filter(Boolean) as number[],
      windingTemps: generatorLogs.map(l => l.winding_temp_r1).filter(Boolean) as number[],
    };

    // Analyze issues patterns
    const issuesByEquipment = issues.reduce((acc, issue) => {
      const key = issue.section || 'Unknown';
      if (!acc[key]) acc[key] = [];
      acc[key].push(issue);
      return acc;
    }, {} as Record<string, any[]>);

    // Prepare data for AI analysis
    const analyticsContext = `
TRANSFORMER ANALYSIS (Last 30 Days):
${Object.entries(transformerAnalysis).map(([num, data]) => `
Transformer ${num}:
- Oil Temperature: Avg ${data.oilTemps.length > 0 ? (data.oilTemps.reduce((a: number, b: number) => a + b, 0) / data.oilTemps.length).toFixed(2) : 'N/A'}°C, Min ${Math.min(...data.oilTemps).toFixed(2)}°C, Max ${Math.max(...data.oilTemps).toFixed(2)}°C
- Winding Temperature: Avg ${data.windingTemps.length > 0 ? (data.windingTemps.reduce((a: number, b: number) => a + b, 0) / data.windingTemps.length).toFixed(2) : 'N/A'}°C
- Voltage Avg: ${data.voltages.length > 0 ? (data.voltages.reduce((a: number, b: number) => a + b, 0) / data.voltages.length).toFixed(2) : 'N/A'} V
- Current Avg: ${data.currents.length > 0 ? (data.currents.reduce((a: number, b: number) => a + b, 0) / data.currents.length).toFixed(2) : 'N/A'} A
`).join('\n')}

GENERATOR ANALYSIS (Last 30 Days):
- Power Output: Avg ${generatorAnalysis.powers.length > 0 ? (generatorAnalysis.powers.reduce((a, b) => a + b, 0) / generatorAnalysis.powers.length).toFixed(2) : 'N/A'} kW, Min ${Math.min(...generatorAnalysis.powers).toFixed(2)} kW, Max ${Math.max(...generatorAnalysis.powers).toFixed(2)} kW
- Frequency: Avg ${generatorAnalysis.frequencies.length > 0 ? (generatorAnalysis.frequencies.reduce((a, b) => a + b, 0) / generatorAnalysis.frequencies.length).toFixed(2) : 'N/A'} Hz, Std Dev ${generatorAnalysis.frequencies.length > 0 ? Math.sqrt(generatorAnalysis.frequencies.reduce((sum, val) => sum + Math.pow(val - (generatorAnalysis.frequencies.reduce((a, b) => a + b, 0) / generatorAnalysis.frequencies.length), 2), 0) / generatorAnalysis.frequencies.length).toFixed(2) : 'N/A'} Hz
- Bearing Temperatures: Avg ${generatorAnalysis.bearingTemps.length > 0 ? (generatorAnalysis.bearingTemps.reduce((a, b) => a + b, 0) / generatorAnalysis.bearingTemps.length).toFixed(2) : 'N/A'}°C
- Winding Temperatures: Avg ${generatorAnalysis.windingTemps.length > 0 ? (generatorAnalysis.windingTemps.reduce((a, b) => a + b, 0) / generatorAnalysis.windingTemps.length).toFixed(2) : 'N/A'}°C

ISSUE PATTERNS:
${Object.entries(issuesByEquipment).map(([section, iss]) => {
  const issues = iss as any[];
  return `
${section}: ${issues.length} issues
- Critical: ${issues.filter((i: any) => i.severity === 'critical').length}
- Common descriptions: ${issues.slice(0, 3).map((i: any) => i.description).join('; ')}
`;
}).join('\n')}

STANDARD OPERATIONAL THRESHOLDS:
- Transformer Oil Temperature: Normal <75°C, Warning 75-85°C, Critical >85°C
- Generator Frequency: Normal 49.5-50.5 Hz, Warning 49-51 Hz, Critical <49 or >51 Hz
- Generator Power Factor: Optimal >0.85
- Bearing Temperature: Normal <70°C, Warning 70-80°C, Critical >80°C
`;

    console.log('Sending data to AI for predictive analysis');

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
            content: `You are an AI predictive maintenance specialist for hydroelectric power plants. Analyze equipment health data and provide:

1. EQUIPMENT HEALTH SCORES (0-100 scale):
   - Individual scores for each transformer
   - Generator health score
   - Brief explanation of each score

2. PREDICTIVE MAINTENANCE ALERTS:
   - Identify equipment showing degradation trends
   - Estimate time until maintenance needed
   - Prioritize by urgency

3. COMPLIANCE MONITORING:
   - Flag readings approaching unsafe thresholds
   - Identify patterns that could lead to violations

4. EFFICIENCY OPTIMIZATION:
   - Suggest operational improvements
   - Identify energy waste patterns
   - Recommend proactive measures

Format your response in clear JSON structure with sections: healthScores, maintenanceAlerts, complianceWarnings, optimizationSuggestions. Each should be an array of actionable items.`
          },
          {
            role: 'user',
            content: `Analyze this equipment data and provide predictive insights:\n\n${analyticsContext}`
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
    const analysis = aiData.choices[0].message.content;

    console.log('Generated predictive analysis:', analysis);

    // Try to parse JSON if AI returned structured data
    let structuredAnalysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = analysis.match(/```json\s*([\s\S]*?)\s*```/) || analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        structuredAnalysis = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
    } catch (e) {
      console.log('AI response not in JSON format, returning as text');
      structuredAnalysis = null;
    }

    return new Response(
      JSON.stringify({
        analysis,
        structured: structuredAnalysis,
        rawData: {
          transformers: Object.keys(transformerAnalysis).length,
          generatorLogs: generatorLogs.length,
          issuesTracked: issues.length,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating predictive analytics:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});