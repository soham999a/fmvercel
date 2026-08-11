// Fetch and parse a podcast RSS feed, return JSON.
// Public: no auth required (feeds themselves are public).
// deno-lint-ignore-file no-explicit-any

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function pick(xml: string, tag: string): string | null {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  if (!m) return null;
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function pickAttr(xml: string, tag: string, attr: string): string | null {
  const m = xml.match(new RegExp(`<${tag}[^>]*\\b${attr}="([^"]+)"[^>]*\\/?>`, 'i'));
  return m ? m[1] : null;
}

function parseFeed(xml: string) {
  const channelMatch = xml.match(/<channel[\s\S]*?>([\s\S]*?)<\/channel>/i);
  const channel = channelMatch ? channelMatch[1] : xml;

  const title = pick(channel, 'title') ?? 'Untitled';
  const description = pick(channel, 'description') ?? '';
  const image =
    pickAttr(channel, 'itunes:image', 'href') ??
    pick(channel, 'url') ??
    null;

  const items: any[] = [];
  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  const matches = channel.match(itemRegex) ?? [];
  for (const raw of matches.slice(0, 40)) {
    const guid = pick(raw, 'guid') ?? pick(raw, 'link') ?? crypto.randomUUID();
    const iTitle = pick(raw, 'title') ?? 'Episode';
    const pubDate = pick(raw, 'pubDate') ?? '';
    const duration = pick(raw, 'itunes:duration') ?? '';
    const desc = pick(raw, 'description') ?? '';
    const enclosureUrl = pickAttr(raw, 'enclosure', 'url');
    if (!enclosureUrl) continue;
    items.push({
      guid,
      title: iTitle,
      pubDate,
      duration,
      description: desc.replace(/<[^>]+>/g, '').slice(0, 400),
      audioUrl: enclosureUrl,
    });
  }

  return { title, description: description.replace(/<[^>]+>/g, '').slice(0, 400), image, episodes: items };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    let feed = url.searchParams.get('url');
    if (!feed && req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      feed = body.url;
    }
    if (!feed) {
      return new Response(JSON.stringify({ error: 'Missing url' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const res = await fetch(feed, {
      headers: { 'user-agent': 'HertzPodcasts/1.0' },
    });
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Feed fetch failed: ${res.status}` }), {
        status: 502,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }
    const xml = await res.text();
    const data = parseFeed(xml);

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'content-type': 'application/json',
        'cache-control': 'public, max-age=600',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  }
});
