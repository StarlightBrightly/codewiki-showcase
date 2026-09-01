import fs from 'node:fs';
import path from 'node:path';
import { storagePut } from './server/storage';

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
  const mapping: Record<string, string> = {};

  for (const filename of FILES_TO_MIGRATE) {
    const filePath = path.join(ASSETS_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      continue;
    }

    try {
      const data = fs.readFileSync(filePath);
      const ext = path.extname(filename).toLowerCase();
      const contentType = ext === '.png' ? 'image/png' : 
                          ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                          ext === '.gif' ? 'image/gif' : 'application/octet-stream';
      
      const { url } = await storagePut(filename, data, contentType);
      mapping[filename] = url;
      console.log(`Migrated ${filename} -> ${url}`);
    } catch (error) {
      console.error(`Failed to migrate ${filename}:`, error);
    }
  }

  fs.writeFileSync('asset-mapping.json', JSON.stringify(mapping, null, 2));
  console.log('Migration complete. Mapping saved to asset-mapping.json');
}

migrate().catch(console.error);
