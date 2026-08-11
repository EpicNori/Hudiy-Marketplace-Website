import { createClient } from 'npm:@supabase/supabase-js@2';
import { BlobReader, BlobWriter, ZipReader } from 'npm:@zip.js/zip.js@2.7.57';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
};
const MAX_PACKAGE_BYTES = 50 * 1024 * 1024;
const MAX_UNCOMPRESSED_BYTES = 100 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['application', 'dashboard', 'dashboard-widget', 'overlay']);
const ALLOWED_EXTENSIONS = new Set(['html', 'htm', 'js', 'css', 'json', 'md', 'png', 'jpg', 'jpeg', 'svg', 'webp']);

const response = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), { status, headers: corsHeaders });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return response(405, { error: 'method_not_allowed' });
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return response(401, { error: 'missing_authentication' });
  const token = authorization.slice('Bearer '.length);
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceRoleKey) return response(500, { error: 'server_not_configured' });

  const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user) return response(401, { error: 'invalid_authentication' });
  const admin = createClient(supabaseUrl, serviceRoleKey);

  let pluginId = '';
  let version = '';
  let storagePath = '';
  let storageUploaded = false;
  let pluginWritten = false;
  let versionWritten = false;
  let uploadWritten = false;
  let previousPlugin: Record<string, unknown> | null = null;
  try {
    const form = await request.formData();
    const packageValue = form.get('package');
    const manifestValue = form.get('manifest');
    if (!(packageValue instanceof File) || !(manifestValue instanceof File)) return response(400, { error: 'manifest_and_package_required' });
    if (packageValue.size > MAX_PACKAGE_BYTES || !packageValue.name.toLowerCase().endsWith('.zip')) return response(422, { error: 'package_must_be_zip_under_50mb' });
    const manifest = JSON.parse(await manifestValue.text()) as Record<string, unknown>;
    validateManifest(manifest);
    pluginId = String(manifest.id);
    version = String(manifest.version);
    const checksum = await sha256(packageValue.arrayBuffer());
    if (String(manifest.checksum).toLowerCase() !== `sha256:${checksum}`) return response(422, { error: 'checksum_mismatch' });
    await validateZip(packageValue, manifest);

    storagePath = `${authData.user.id}/${pluginId}/${version}/package.zip`;
    const upload = await admin.storage.from('plugin-packages').upload(storagePath, packageValue, { contentType: 'application/zip', upsert: false });
    if (upload.error) throw upload.error;
    storageUploaded = true;
    const { data: existing, error: existingError } = await admin.from('plugins').select('*').eq('id', pluginId).maybeSingle();
    if (existingError) throw existingError;
    if (existing && existing.author_user_id !== authData.user.id) throw new Error('plugin_id_owned_by_another_author');
    previousPlugin = existing;

    const entryPath = (manifest.entry as Record<string, unknown> | undefined)?.path;
    const supportedHudiyVersion = String(manifest.supportedHudiyVersion ?? (manifest.supportedHudiy as Record<string, unknown>).minVersion);
    const entrypoints = manifest.entrypoints ?? (typeof entryPath === 'string' ? { [String(manifest.type)]: entryPath } : {});
    const pluginRow = {
      id: pluginId, name: String(manifest.name), description: String(manifest.description), author: String(manifest.author), author_user_id: authData.user.id,
      version, type: String(manifest.type), supported_hudiy_version: supportedHudiyVersion, permissions: Array.isArray(manifest.permissions) ? manifest.permissions : [],
      entrypoints, files: Array.isArray(manifest.files) ? manifest.files : [], checksum: String(manifest.checksum), status: 'pending_review',
    };
    const { error: pluginError } = await admin.from('plugins').upsert(pluginRow, { onConflict: 'id' });
    if (pluginError) throw pluginError;
    pluginWritten = true;
    const { error: versionError } = await admin.from('plugin_versions').insert({ plugin_id: pluginId, version, storage_path: storagePath, checksum: String(manifest.checksum), manifest, status: 'pending_review' });
    if (versionError) throw versionError;
    versionWritten = true;
    const { error: uploadError } = await admin.from('plugin_uploads').insert({ plugin_id: pluginId, version, uploader_user_id: authData.user.id, storage_path: storagePath, original_filename: packageValue.name, byte_size: packageValue.size, checksum: String(manifest.checksum), validation_status: 'pending_review', status: 'pending_review' });
    if (uploadError) throw uploadError;
    uploadWritten = true;
    return response(201, { ok: true, id: pluginId, version, status: 'pending_review' });
  } catch (error) {
    if (uploadWritten) await admin.from('plugin_uploads').delete().eq('plugin_id', pluginId).eq('version', version).eq('uploader_user_id', authData.user.id);
    if (versionWritten) await admin.from('plugin_versions').delete().eq('plugin_id', pluginId).eq('version', version);
    if (pluginWritten) {
      if (previousPlugin) await admin.from('plugins').update(previousPlugin).eq('id', pluginId);
      else await admin.from('plugins').delete().eq('id', pluginId);
    }
    if (storageUploaded && storagePath) await admin.storage.from('plugin-packages').remove([storagePath]);
    if (error instanceof SyntaxError) return response(422, { error: 'manifest_is_not_valid_json' });
    const message = error instanceof Error ? error.message : 'upload_failed';
    return response(422, { error: message.slice(0, 180) });
  }
});

function validateManifest(manifest: Record<string, unknown>) {
  for (const key of ['id', 'name', 'description', 'author', 'version', 'checksum']) {
    if (typeof manifest[key] !== 'string' || !manifest[key].trim()) throw new Error(`manifest_${key}_required`);
  }
  if (manifest.schemaVersion !== 1) throw new Error('manifest_schema_version_invalid');
  const supported = manifest.supportedHudiyVersion ?? (manifest.supportedHudiy as Record<string, unknown> | undefined)?.minVersion;
  if (typeof supported !== 'string' || !supported.trim()) throw new Error('manifest_supported_hudiy_required');
  if (!/^[a-z0-9][a-z0-9._-]{0,63}$/.test(String(manifest.id))) throw new Error('manifest_id_invalid');
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(String(manifest.version))) throw new Error('manifest_version_invalid');
  if (!ALLOWED_TYPES.has(String(manifest.type))) throw new Error('manifest_type_invalid');
  if (!/^sha256:[a-f0-9]{64}$/i.test(String(manifest.checksum))) throw new Error('manifest_checksum_invalid');
  const entryPath = (manifest.entry as Record<string, unknown> | undefined)?.path ?? (manifest.entrypoints as Record<string, unknown> | undefined)?.[String(manifest.type)];
  if (typeof entryPath !== 'string') throw new Error('manifest_entry_required');
  validatePath(entryPath);
}

async function validateZip(packageFile: File, manifest: Record<string, unknown>) {
  const reader = new ZipReader(new BlobReader(packageFile));
  let manifestInside: Record<string, unknown> | null = null;
  let total = 0;
  const names = new Set<string>();
  try {
    const entries = await reader.getEntries();
    if (!entries.length) throw new Error('package_empty');
    for (const entry of entries) {
      const path = entry.filename.replaceAll('\\', '/');
      if (entry.directory) continue;
      if (names.has(path)) throw new Error('package_duplicate_path');
      names.add(path);
      const externalAttributes = (entry as unknown as { externalFileAttributes?: number }).externalFileAttributes;
      if (typeof externalAttributes === 'number' && ((externalAttributes >>> 16) & 0xf000) === 0xa000) throw new Error('package_symlink_not_allowed');
      validatePath(path);
      const extension = path.split('.').pop()?.toLowerCase() ?? '';
      if (path !== 'manifest.json' && !ALLOWED_EXTENSIONS.has(extension)) throw new Error('package_file_type_not_allowed');
      const declaredSize = typeof entry.uncompressedSize === 'number' ? entry.uncompressedSize : 0;
      if (declaredSize > MAX_UNCOMPRESSED_BYTES || total + declaredSize > MAX_UNCOMPRESSED_BYTES) throw new Error('package_uncompressed_size_exceeded');
      const data = await entry.getData?.(new BlobWriter());
      const size = data instanceof Blob ? data.size : 0;
      total += size;
      if (total > MAX_UNCOMPRESSED_BYTES) throw new Error('package_uncompressed_size_exceeded');
      if (path === 'manifest.json' && data instanceof Blob) manifestInside = JSON.parse(await data.text());
    }
  } finally {
    await reader.close();
  }
  if (!manifestInside || manifestInside.id !== manifest.id || manifestInside.version !== manifest.version || manifestInside.checksum !== manifest.checksum) throw new Error('embedded_manifest_mismatch');
}

function validatePath(path: string) {
  if (!path || path.startsWith('/') || path.includes('..') || /^[A-Za-z]:/.test(path)) throw new Error('package_path_invalid');
  if (path.split('/').some((part) => !part || part === '.' || part === '..')) throw new Error('package_path_invalid');
}

async function sha256(data: ArrayBuffer) {
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
