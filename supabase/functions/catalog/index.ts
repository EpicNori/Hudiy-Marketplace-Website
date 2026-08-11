import { createClient } from 'npm:@supabase/supabase-js@2';

const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Content-Type': 'application/json; charset=utf-8' };
const reply = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), { status, headers });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers });
  if (request.method !== 'GET') return reply(405, { error: 'method_not_allowed' });
  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceRoleKey) return reply(500, { error: 'server_not_configured' });
  const admin = createClient(url, serviceRoleKey);
  const { data, error } = await admin.from('plugins').select('id,name,description,author,version,type,supported_hudiy_version,permissions,entrypoints,files,checksum,downloads,rating,updated_at,plugin_versions(version,storage_path,status)').eq('status', 'published').order('downloads', { ascending: false }).order('updated_at', { ascending: false });
  if (error) return reply(502, { error: 'catalog_unavailable', plugins: [] });
  const plugins = [];
  for (const row of data ?? []) {
    const version = (row.plugin_versions ?? []).find((item: { version: string; status: string }) => item.version === row.version && item.status === 'published');
    if (!version) continue;
    const signed = await admin.storage.from('plugin-packages').createSignedUrl(version.storage_path, 3600);
    if (signed.error || !signed.data?.signedUrl) continue;
    plugins.push({ ...row, supportedHudiyVersion: row.supported_hudiy_version, updatedAt: row.updated_at, packageUrl: signed.data.signedUrl });
  }
  return reply(200, { plugins, catalogConnected: true });
});
