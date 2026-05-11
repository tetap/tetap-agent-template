import { readdirSync, readFileSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const schemaDir = new URL('../schema/', import.meta.url);
const prismaFiles = readdirSync(schemaDir)
  .filter(file => extname(file) === '.prisma')
  .sort();

const countModelBlocks = content => [...content.matchAll(/^\s*model\s+\w+\s*{/gm)].length;
const errors = [];

for (const file of prismaFiles) {
  const filePath = fileURLToPath(new URL(file, schemaDir));
  const content = readFileSync(filePath, 'utf8');
  const modelCount = countModelBlocks(content);

  if (file === 'schema.prisma' && modelCount > 0) {
    errors.push('schema.prisma must not contain model blocks. Put each model in its own *.prisma file.');
  }

  if (file !== 'schema.prisma' && modelCount > 1) {
    errors.push(`${basename(file)} must contain at most one model block.`);
  }
}

if (errors.length > 0) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}
