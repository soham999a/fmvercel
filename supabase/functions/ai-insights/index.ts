// AI-powered listening insights + recommendations via Lovable AI Gateway.
// Reads the authenticated user's listening_history (RLS-scoped) and asks the model
// for either (a) station recommendations or (b) a weekly narrative summary.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

interface Body { mode: 'recommendations' | 'weekly' }

async function callAI(system: string, user: string): Promise<string> {
  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`AI Gateway ${res.status}: ${txt}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { mode }: Body = await req.json();

    const since = new Date();
    since.setDate(since.getDate() - 30);
    const { data: history } = await supabase
      .from('listening_history')
      .select('station_name, seconds_listened, started_at')
      .gte('started_at', since.toISOString())
      .order('started_at', { ascending: false })
      .limit(200);

    const rows = history ?? [];

    // Aggregate top stations + minutes per day
    const stationMap = new Map<string, number>();
    const dayMap = new Map<string, number>();
    let totalSeconds = 0;
    for (const r of rows) {
      const name = r.station_name ?? 'Unknown';
      const secs = r.seconds_listened ?? 0;
      stationMap.set(name, (stationMap.get(name) ?? 0) + secs);
      totalSeconds += secs;
      const day = new Date(r.started_at).toISOString().slice(0, 10);
      dayMap.set(day, (dayMap.get(day) ?? 0) + secs);
    }
    const topStations = [...stationMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, seconds]) => ({ name, minutes: Math.round(seconds / 60) }));

    if (mode === 'recommendations') {
      if (topStations.length === 0) {
        return new Response(JSON.stringify({
          recommendations: [],
          message: 'Listen to a few stations to unlock personalised recommendations.',
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const prompt = `Based on this listening history, recommend 6 radio stations the user is likely to love.
For each, return: name (real, well-known internet radio station), country, genre, and a one-line reason.
Return STRICT JSON array only, no prose: [{"name":"...","country":"...","genre":"...","reason":"..."}]

Top stations:
${topStations.map(s => `- ${s.name} (${s.minutes}m)`).join('\n')}`;

      const content = await callAI(
        'You are a global radio curator. You only recommend real, existing stations. Respond with valid JSON only.',
        prompt,
      );
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      return new Response(JSON.stringify({ recommendations }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Weekly insights
    const weekSince = new Date();
    weekSince.setDate(weekSince.getDate() - 7);
    const weekRows = rows.filter(r => new Date(r.started_at) >= weekSince);
    let weekSeconds = 0;
    const weekDayMap = new Map<string, number>();
    const weekStationMap = new Map<string, number>();
    for (const r of weekRows) {
      const secs = r.seconds_listened ?? 0;
      weekSeconds += secs;
      const day = new Date(r.started_at).toISOString().slice(0, 10);
      weekDayMap.set(day, (weekDayMap.get(day) ?? 0) + secs);
      const name = r.station_name ?? 'Unknown';
      weekStationMap.set(name, (weekStationMap.get(name) ?? 0) + secs);
    }
    const perDay: { day: string; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      perDay.push({ day: key, minutes: Math.round((weekDayMap.get(key) ?? 0) / 60) });
    }
    const weekTop = [...weekStationMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, seconds]) => ({ name, minutes: Math.round(seconds / 60) }));

    let narrative = '';
    if (weekRows.length > 0) {
      narrative = await callAI(
        'You are a warm, insightful listening companion. Write 2–3 short paragraphs. No headings, no lists, no markdown.',
        `Write a personalised weekly listening report. Data:
- Total minutes this week: ${Math.round(weekSeconds / 60)}
- Active days: ${[...weekDayMap.keys()].length}
- Top stations: ${weekTop.map(s => `${s.name} (${s.minutes}m)`).join(', ') || 'none'}
- Daily minutes: ${perDay.map(d => `${d.day}: ${d.minutes}`).join(', ')}

Highlight their taste, patterns, and one gentle suggestion.`,
      );
    } else {
      narrative = 'No listening this week yet. Tune into a station to unlock your first insights report.';
    }

    return new Response(JSON.stringify({
      totalMinutes: Math.round(weekSeconds / 60),
      totalMinutesMonth: Math.round(totalSeconds / 60),
      activeDays: [...weekDayMap.keys()].length,
      perDay,
      topStations: weekTop,
      narrative,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
