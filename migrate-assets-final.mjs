import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Mock storagePut logic because we can't easily import from the project
// when it has TS errors and ESM/CJS mix.
// We'll use the environment variables directly.

const ENV = {
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL || '',
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY || '',
};

async function storagePut(relKey, data, contentType = 'application/octet-stream') {
  const forgeUrl = ENV.forgeApiUrl.replace(/\/+$/, "");
  const forgeKey = ENV.forgeApiKey;
  
  const hash = Math.random().toString(36).substring(2, 10);
  const lastDot = relKey.lastIndexOf(".");
  const key = lastDot === -1 ? `${relKey}_${hash}` : `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;

  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl.searchParams.set("path", key);

  const presignResp = await fetch(presignUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` },
  });

  const { url: s3Url } = await presignResp.json();
  
  await fetch(s3Url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: data,
  });

  return { key, url: `/manus-storage/${key}` };
}

const ASSETS_DIR = '/home/ubuntu/webdev-static-assets';
const FILES_TO_MIGRATE = [
  'codewiki-comparison-atlas.jpg',
  'codewiki-hero-graph.jpg',
  'codewiki-mark.png',
  'grok-wiki-fieldnotes.jpg',
  'grok-wiki-interface.png',
  'openwiki-visualizer.gif',
  'codewiki-docs-interface.png',
  'grok-wiki-official-demo.png',
  'deepwiki-official-ui.png'
];

async function migrate() {
  console.log('Starting asset migration to S3...');
  const mapping = {};

  for (const filename of FILES_TO_MIGRATE) {
    const filePath = path.join(ASSETS_DIR, filename);
    if (!fs.existsSync(filePath)) continue;

    const data = fs.readFileSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : 
                        ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                        ext === '.gif' ? 'image/gif' : 'application/octet-stream';
    
    const { url } = await storagePut(filename, data, contentType);
    mapping[filename] = url;
    console.log(`Migrated ${filename} -> ${url}`);
  }

  fs.writeFileSync('asset-mapping.json', JSON.stringify(mapping, null, 2));
}

migrate().catch(console.error);
