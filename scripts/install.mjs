#!/usr/bin/env node
import {cp, mkdir, readFile, readdir, lstat, realpath, rename, rm, writeFile} from 'node:fs/promises';
import {createHash, randomUUID} from 'node:crypto';
import {homedir} from 'node:os';
import {resolve, join, dirname, relative, isAbsolute, sep} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

export const skillName = 'xyf-easycode';
export const sourceDirectory = fileURLToPath(new URL('../.agents/skills/xyf-easycode/', import.meta.url));
const manifestName = '.easycode-install.json';
const digest = value => createHash('sha256').update(value).digest('hex');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const inside = (parent, child) => {
  const value = relative(parent, child);
  return value === '' || !isAbsolute(value) && value !== '..' && !value.startsWith('..' + sep);
};

async function exists(path) {
  try {return await lstat(path);} catch (error) {if (error.code === 'ENOENT') return null; throw error;}
}

// Links are rejected so a project installation cannot escape through one.
async function assertOrdinaryPath(path) {
  for (let current = resolve(path); ; current = dirname(current)) {
    const entry = await exists(current);
    if (entry?.isSymbolicLink()) throw new Error(`Installation paths must not contain symbolic links: ${current}`);
    if (entry && !entry.isDirectory()) throw new Error(`Expected a directory: ${current}`);
    if (dirname(current) === current) break;
  }
}

export function installationDirectory({agent, project, global:globalInstall = false, skillsDir, home = homedir(), configHome = process.env.XDG_CONFIG_HOME} = {}) {
  if (skillsDir) {
    if (agent || project || globalInstall) throw new Error('--skills-dir cannot be combined with --agent, --project, or --global.');
    return join(resolve(skillsDir), skillName);
  }
  if (!['codex', 'claude-code', 'opencode'].includes(agent)) throw new Error('Choose --agent codex, claude-code, or opencode; or supply --skills-dir.');
  if (globalInstall && project) throw new Error('Choose --project or --global, not both.');
  if (globalInstall) {
    if (agent === 'opencode') {
      if (configHome && !isAbsolute(configHome)) throw new Error('XDG_CONFIG_HOME must be an absolute path.');
      return join(configHome || join(home, '.config'), 'opencode', 'skills', skillName);
    }
    return join(home, agent === 'codex' ? '.agents' : '.claude', 'skills', skillName);
  }
  return join(resolve(project || process.cwd()), {codex:'.agents', 'claude-code':'.claude', opencode:'.opencode'}[agent], 'skills', skillName);
}

export async function inventory(directory) {
  const files = {};
  async function walk(current) {
    const entries = await readdir(current, {withFileTypes:true});
    for (const entry of entries.sort((a,b) => a.name.localeCompare(b.name, 'en'))) {
      const file = join(current, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Skill bundles must contain regular files, not symbolic links: ${file}`);
      if (entry.isDirectory()) await walk(file);
      else if (entry.isFile()) {
        const key = relative(directory, file).split(sep).join('/');
        if (key !== manifestName) files[key] = digest(await readFile(file));
      } else throw new Error(`Unsupported bundle entry: ${file}`);
    }
  }
  await walk(directory);
  return Object.fromEntries(Object.entries(files).sort(([a],[b]) => a.localeCompare(b, 'en')));
}

export async function validateBundle(directory) {
  const entry = await readFile(join(directory, 'SKILL.md'), 'utf8');
  if (!/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.test(entry) || !/^name:\s*xyf-easycode\s*$/m.test(entry)) throw new Error('The source is not the xyf-easycode skill.');
  const required = [
    'subskills/xyf-archify/SKILL.md', 'subskills/xyf-code/SKILL.md',
    'subskills/xyf-archifycheck/SKILL.md', 'subskills/review-agent/SKILL.md', 'subskills/xyf-web-language/SKILL.md',
    'tools/index.html', 'tools/archify.json', 'tools/html/server.mjs',
    ...['deploy', 'build', 'check', 'files'].map(name => `tools/html/scripts/${name}.mjs`),
    ...['model', 'project-file', 'serialization', 'storage', 'project-storage', 'service-storage', 'feedback', 'icons', 'translation', 'nodes', 'annotations', 'canvas', 'module-editor', 'dialogs', 'app'].map(name => `tools/html/assets/${name}.js`),
    'tools/html/assets/editor.css',
    ...['canvas', 'module-node', 'group-layer'].map(name => `tools/html/templates/${name}.html`),
    'tools/html/templates/archifytemplate.template.jsonc'
  ];
  const files = await inventory(directory);
  for (const file of required) if (!files[file]) throw new Error(`Incomplete skill bundle: ${file}`);
  return files;
}

export async function installSkill(options = {}) {
  if (Number(process.versions.node.split('.')[0]) < 22) throw new Error('Node.js 22 or later is required.');
  const source = resolve(options.source || sourceDirectory), destination = installationDirectory(options);
  await assertOrdinaryPath(source);
  await assertOrdinaryPath(destination);
  const expected = await validateBundle(source);
  const sourceReal = await realpath(source);
  const targetEntry = await exists(destination);
  let original;
  if (targetEntry) {
    original = await inventory(destination);
    if (same(original, expected)) return {status:options.check ? 'verified' : 'unchanged', destination, files:Object.keys(expected).length};
    if (options.check) throw new Error(`Installed files differ from the source: ${destination}`);
    if (!options.update) throw new Error(`A different skill already exists at ${destination}. Its files were preserved. Use --update only for an unedited installer-managed copy.`);
    let manifest;
    try {manifest = JSON.parse(await readFile(join(destination, manifestName), 'utf8'));}
    catch {throw new Error(`Existing skill is not managed by this installer; preserved: ${destination}`);}
    if (manifest.name !== skillName || !same(original, manifest.files)) throw new Error(`Existing skill has local edits or an invalid manifest; preserved: ${destination}`);
  } else if (options.check) throw new Error(`Skill is not installed: ${destination}`);
  if (inside(sourceReal, destination) || inside(destination, sourceReal)) throw new Error('Source and destination must not overlap.');
  const parent = dirname(destination);
  await mkdir(parent, {recursive:true});
  await assertOrdinaryPath(parent);
  const stage = join(parent, `.xyf-easycode-stage-${randomUUID()}`);
  const backup = join(parent, `.xyf-easycode-backup-${randomUUID()}`);
  let movedOld = false, installed = false;
  async function cleanup(path, prefix) {
    if (dirname(path) !== parent || !path.startsWith(join(parent, prefix))) throw new Error('Unsafe cleanup path.');
    await rm(path, {recursive:true, force:true});
  }
  try {
    await cp(source, stage, {recursive:true, errorOnExist:true, force:false});
    if (!same(await inventory(stage), expected) || !same(await inventory(source), expected)) throw new Error('The source changed during installation; retry from a stable checkout.');
    await writeFile(join(stage, manifestName), JSON.stringify({name:skillName, formatVersion:1, files:expected}, null, 2) + '\n', 'utf8');
    if (targetEntry) {
      if (!same(await inventory(destination), original)) throw new Error('The destination changed during installation; its files were preserved.');
      await rename(destination, backup); movedOld = true;
    } else if (await exists(destination)) throw new Error('The destination appeared during installation; its files were preserved.');
    await rename(stage, destination); installed = true;
    if (!same(await inventory(destination), expected)) throw new Error('Installed file verification failed.');
    if (movedOld) await cleanup(backup, '.xyf-easycode-backup-');
    return {status:targetEntry ? 'updated' : 'installed', destination, files:Object.keys(expected).length};
  } catch (error) {
    if (installed && movedOld) await cleanup(destination, skillName);
    if (movedOld && !await exists(destination)) await rename(backup, destination);
    throw error;
  } finally {
    await cleanup(stage, '.xyf-easycode-stage-');
  }
}

export function parseArguments(args) {
  const options = {};
  const valueOptions = new Map([['--agent','agent'], ['--project','project'], ['--skills-dir','skillsDir']]);
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    if (valueOptions.has(flag)) {
      const key = valueOptions.get(flag), value = args[++index];
      if (options[key] !== undefined || !value || value.startsWith('--')) throw new Error(`Expected one value for ${flag}.`);
      options[key] = value;
    } else if (['--global','--check','--update','--help'].includes(flag)) options[flag.slice(2)] = true;
    else throw new Error(`Unknown argument: ${flag}`);
  }
  if (options.check && options.update) throw new Error('--check and --update cannot be combined.');
  return options;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const options = parseArguments(process.argv.slice(2));
    if (options.help) console.log('Usage: node scripts/install.mjs --agent codex|claude-code|opencode [--project <path> | --global] [--check | --update]\nOr: node scripts/install.mjs --skills-dir <path> [--check | --update]\nRequires Node.js 22+. Project installation is the default.');
    else console.log(JSON.stringify(await installSkill(options), null, 2));
  } catch (error) {console.error(error.message); process.exitCode = 1;}
}
