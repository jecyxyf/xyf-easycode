import {readFile, readdir, stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join, dirname, resolve, extname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {validateBundle, sourceDirectory} from './install.mjs';
import {check} from '../.agents/skills/xyf-easycode/tools/html/scripts/check.mjs';
import {loadBundle} from '../.agents/skills/xyf-easycode/tools/html/scripts/build.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const files = [];
async function walk(directory) {
  for (const entry of await readdir(directory, {withFileTypes:true})) {
    if (['.git', 'node_modules', '.runtime'].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else files.push(path);
  }
}

try {
  await validateBundle(sourceDirectory);
  await walk(root);
  let scripts = 0, links = 0, skills = 0;
  for (const path of files) {
    if (['.js', '.mjs', '.cjs'].includes(extname(path))) {
      const result = spawnSync(process.execPath, ['--check', path], {encoding:'utf8', windowsHide:true});
      if (result.status !== 0) throw new Error(result.stderr || result.error?.message || `Syntax check failed: ${path}`);
      scripts++;
    }
    if (extname(path) !== '.md') continue;
    const text = await readFile(path, 'utf8');
    if (path.endsWith('SKILL.md')) {
      const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text)?.[1];
      const name = /^name:\s*(.+)$/m.exec(frontmatter || '')?.[1].trim();
      const description = /^description:\s*(.+)$/m.exec(frontmatter || '')?.[1].trim();
      if (!name || name !== dirname(path).split(/[\\/]/).at(-1) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) throw new Error(`Invalid skill name: ${path}`);
      if (!description || description.length > 1024) throw new Error(`Invalid skill description: ${path}`);
      skills++;
    }
    // Check actual Markdown links, excluding remote URLs and local anchors.
    for (const match of text.matchAll(/\[[^\]\n]*\]\(([^)\s]+)\)/g)) {
      const target = match[1];
      if (/^[a-z]+:|^#/i.test(target)) continue;
      const local = decodeURIComponent(target.split('#')[0]);
      if (!await stat(resolve(dirname(path), local)).catch(() => null)) throw new Error(`Broken local link in ${path}: ${target}`);
      links++;
    }
  }
  const entry = join(sourceDirectory, 'tools/index.html');
  const result = await check(entry);
  if (result.errors.length) throw new Error(JSON.stringify(result.errors));
  const expected = globalThis.EasyCode.Serialization.buildDocument(await loadBundle(), globalThis.EasyCode.Model.createProject(), {service:true});
  if (await readFile(entry, 'utf8') !== expected) throw new Error('The bundled editor is stale. Run npm run build.');
  console.log(JSON.stringify({ok:true, skills, scripts, localLinks:links, editorMode:result.mode}, null, 2));
} catch (error) {console.error(error.message); process.exitCode = 1;}
