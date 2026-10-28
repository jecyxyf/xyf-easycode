import test from 'node:test';
import assert from 'node:assert/strict';
import {access,appendFile,cp,mkdir,mkdtemp,readFile,readdir,rm,stat,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {installationDirectory,installSkill,inventory,sourceDirectory} from '../install.mjs';

async function workspace(t) {
  const runtime = join(resolve(process.env.EASYCODE_TEST_ROOT || 'docs/archify/test'),'.runtime');
  await mkdir(runtime,{recursive:true});
  const directory = await mkdtemp(join(runtime,'installer-'));
  t.after(() => rm(directory,{recursive:true,force:true}));
  return directory;
}

test('installation destinations support project, global and custom skill directories',() => {
  const project = resolve('sample-project'), home = resolve('sample-home');
  for (const [agent,folder] of [['codex','.agents'],['claude-code','.claude'],['opencode','.opencode']]) {
    assert.equal(installationDirectory({agent,project}),join(project,folder,'skills','xyf-easycode'));
  }
  assert.equal(installationDirectory({agent:'codex',global:true,home}),join(home,'.agents/skills/xyf-easycode'));
  assert.equal(installationDirectory({agent:'claude-code',global:true,home}),join(home,'.claude/skills/xyf-easycode'));
  assert.equal(installationDirectory({agent:'opencode',global:true,home,configHome:''}),join(home,'.config/opencode/skills/xyf-easycode'));
  const configHome = join(home,'settings');
  assert.equal(installationDirectory({agent:'opencode',global:true,home,configHome}),join(configHome,'opencode/skills/xyf-easycode'));
  assert.equal(installationDirectory({skillsDir:join(project,'skills')}),join(project,'skills/xyf-easycode'));
  assert.throws(() => installationDirectory({agent:'codex',project,global:true}));
  assert.throws(() => installationDirectory({agent:'codex',skillsDir:project}));
});

test('installation copies the entire bundle and identical installation preserves existing files',async t => {
  const project = await workspace(t);
  const options = {agent:'codex',project};
  const result = await installSkill(options);
  assert.equal(result.status,'installed');
  const expected = await inventory(sourceDirectory);
  assert.deepEqual(await inventory(result.destination),expected);
  await access(join(result.destination,'tests/editor.test.mjs'));
  const manifestFile = join(result.destination,'.easycode-install.json');
  const manifest = JSON.parse(await readFile(manifestFile,'utf8'));
  assert.deepEqual(manifest.files,expected);
  const modified = (await stat(manifestFile)).mtimeMs;
  assert.equal((await installSkill(options)).status,'unchanged');
  assert.equal((await stat(manifestFile)).mtimeMs,modified);
  assert.equal((await installSkill({...options,check:true})).status,'verified');
});

test('verification of a missing installation fails without creating a destination',async t => {
  const directory = await workspace(t), project = join(directory,'missing-project');
  await assert.rejects(installSkill({agent:'codex',project,check:true}),/not installed/);
  await assert.rejects(access(project),{code:'ENOENT'});
});

test('an unmanaged installation is preserved even when update is requested',async t => {
  const directory = await workspace(t), skillsDir = join(directory,'skills');
  const destination = join(skillsDir,'xyf-easycode');
  await mkdir(destination,{recursive:true});
  await writeFile(join(destination,'SKILL.md'),'User-maintained skill\n');
  const before = await inventory(destination);
  await assert.rejects(installSkill({skillsDir}),/different skill/);
  await assert.rejects(installSkill({skillsDir,update:true}),/not managed/);
  assert.deepEqual(await inventory(destination),before);
});

test('a managed update installs changed files and removes staging and backup directories',async t => {
  const directory = await workspace(t), source = join(directory,'source'), skillsDir = join(directory,'skills');
  await cp(sourceDirectory,source,{recursive:true});
  const options = {source,skillsDir};
  const installed = await installSkill(options);
  await appendFile(join(source,'tools/README.md'),'\nUpdated tool documentation.\n');
  await assert.rejects(installSkill({...options,check:true}),/differ/);
  const updated = await installSkill({...options,update:true});
  assert.equal(updated.status,'updated');
  assert.equal(updated.destination,installed.destination);
  assert.deepEqual(await inventory(updated.destination),await inventory(source));
  assert.deepEqual(await readdir(skillsDir),['xyf-easycode']);
});

test('updating a locally edited managed installation preserves the user changes',async t => {
  const directory = await workspace(t), source = join(directory,'source'), skillsDir = join(directory,'skills');
  await cp(sourceDirectory,source,{recursive:true});
  const options = {source,skillsDir};
  const installed = await installSkill(options);
  await appendFile(join(installed.destination,'tools/README.md'),'\nUser notes.\n');
  await appendFile(join(source,'tools/README.md'),'\nUpstream changes.\n');
  const before = await inventory(installed.destination);
  await assert.rejects(installSkill({...options,update:true}),/local edits/);
  assert.deepEqual(await inventory(installed.destination),before);
});

test('an incomplete source bundle cannot replace an existing installation',async t => {
  const directory = await workspace(t), source = join(directory,'source'), skillsDir = join(directory,'skills');
  await cp(sourceDirectory,source,{recursive:true});
  const options = {source,skillsDir};
  const installed = await installSkill(options), before = await inventory(installed.destination);
  await rm(join(source,'tools/html/assets/model.js'));
  await assert.rejects(installSkill({...options,update:true}),/Incomplete skill bundle/);
  assert.deepEqual(await inventory(installed.destination),before);
});
