import test from 'node:test';
import assert from 'node:assert/strict';
import {cp, mkdir, readFile, writeFile, stat, readdir, symlink, unlink} from 'node:fs/promises';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {installSkill, installationDirectory, inventory, parseArguments, sourceDirectory} from '../../../scripts/install.mjs';
import {workspace} from './helpers.mjs';

for (const agent of ['codex', 'claude-code', 'opencode']) {
  test(`${agent}: complete project installation, idempotence, and read-only verification`, async t => {
    const project = await workspace(t, agent);
    const first = await installSkill({agent, project});
    assert.equal(first.status, 'installed');
    assert.deepEqual(await inventory(first.destination), await inventory(sourceDirectory));
    assert.equal(first.destination, join(project, {codex:'.agents', 'claude-code':'.claude', opencode:'.opencode'}[agent], 'skills', 'xyf-easycode'));
    const file = join(first.destination, 'SKILL.md'), before = await stat(file);
    assert.equal((await installSkill({agent, project})).status, 'unchanged');
    assert.equal((await stat(file)).mtimeMs, before.mtimeMs);
    assert.equal((await installSkill({agent, project, check:true})).status, 'verified');
  });
}

test('all global targets and custom directories install without touching the real user home', async t => {
  const root = await workspace(t, 'global'), home = join(root, 'home'), configHome = join(root, 'xdg');
  for (const agent of ['codex', 'claude-code', 'opencode']) {
    const result = await installSkill({agent, global:true, home, configHome});
    const expected = agent === 'opencode' ? join(configHome, 'opencode', 'skills', 'xyf-easycode') : join(home, agent === 'codex' ? '.agents' : '.claude', 'skills', 'xyf-easycode');
    assert.equal(result.destination, expected);
    assert.deepEqual(await inventory(expected), await inventory(sourceDirectory));
  }
  const result = await installSkill({skillsDir:join(root, 'other-client', 'skills')});
  assert.equal(result.status, 'installed');
  assert.deepEqual(await inventory(result.destination), await inventory(sourceDirectory));
});

test('unmanaged conflicts and edited managed copies are preserved', async t => {
  const project = await workspace(t, 'conflicts');
  const destination = installationDirectory({agent:'codex', project});
  await mkdir(destination, {recursive:true});
  await writeFile(join(destination, 'SKILL.md'), 'User-owned content\n');
  await assert.rejects(installSkill({agent:'codex', project}), /preserved/);
  await assert.rejects(installSkill({agent:'codex', project, update:true}), /not managed/);
  assert.equal(await readFile(join(destination, 'SKILL.md'), 'utf8'), 'User-owned content\n');
  const managed = await installSkill({agent:'claude-code', project});
  await writeFile(join(managed.destination, 'user-notes.txt'), 'Keep this file.\n');
  await assert.rejects(installSkill({agent:'claude-code', project, update:true}), /local edits/);
  assert.equal(await readFile(join(managed.destination, 'user-notes.txt'), 'utf8'), 'Keep this file.\n');
});

test('explicit managed update replaces clean old files and retains a usable complete bundle', async t => {
  const root = await workspace(t, 'update'), project = join(root, 'project'), source = join(root, 'new-source');
  const installed = await installSkill({agent:'codex', project});
  await cp(sourceDirectory, source, {recursive:true});
  await writeFile(join(source, 'release-note.txt'), 'New bundle resource.\n');
  await assert.rejects(installSkill({agent:'codex', project, source}), /already exists/);
  const result = await installSkill({agent:'codex', project, source, update:true});
  assert.equal(result.status, 'updated');
  assert.deepEqual(await inventory(installed.destination), await inventory(source));
  assert.equal((await installSkill({agent:'codex', project, source, check:true})).status, 'verified');
  assert.deepEqual((await readdir(join(project, '.agents', 'skills'))).filter(x => x.startsWith('.xyf-')), []);
});

test('read-only checks, argument errors, source overlap and CLI invocation', async t => {
  const project = await workspace(t, 'cli');
  await assert.rejects(installSkill({agent:'codex', project, check:true}), /not installed/);
  assert.deepEqual(await readdir(project), []);
  assert.throws(() => parseArguments(['--agent']), /Expected one value/);
  assert.throws(() => parseArguments(['--check','--update']), /cannot be combined/);
  assert.throws(() => installationDirectory({agent:'codex', global:true, project}), /not both/);
  assert.throws(() => installationDirectory({agent:'unknown'}), /Choose/);
  await assert.rejects(installSkill({source:sourceDirectory, skillsDir:sourceDirectory}), /overlap/);
  const script = fileURLToPath(new URL('../../../scripts/install.mjs', import.meta.url));
  const result = spawnSync(process.execPath, [script, '--agent','codex','--project',join(project,'path with spaces')], {encoding:'utf8', cwd:project, windowsHide:true});
  assert.equal(result.status, 0, result.stderr);
  const installed = JSON.parse(result.stdout);
  assert.equal(installed.status, 'installed');
  const targetProject = join(project, 'path with spaces');
  const deployment = spawnSync(process.execPath, [join(installed.destination, 'tools/html/scripts/deploy.mjs'), targetProject, '--no-start'], {encoding:'utf8', cwd:project, windowsHide:true});
  assert.equal(deployment.status, 0, deployment.stderr);
  const configuration = JSON.parse(await readFile(join(targetProject, 'docs/archfiy/archify.json'), 'utf8'));
  assert.equal(configuration.formatVersion, 1);
  assert.deepEqual(configuration.modules, []);
});

test('linked installation paths cannot redirect writes outside the selected project', async t => {
  const root = await workspace(t, 'links'), project = join(root, 'project'), external = join(root, 'external');
  await mkdir(project); await mkdir(external);
  await symlink(external, join(project, '.agents'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(installSkill({agent:'codex', project}), /symbolic links/);
  assert.deepEqual(await readdir(external), []);
});

test('incomplete bundles are rejected before creating an installation', async t => {
  const root = await workspace(t, 'incomplete'), source = join(root, 'source'), project = join(root, 'project');
  await cp(sourceDirectory, source, {recursive:true});
  await unlink(join(source, 'tools/html/assets/canvas.js'));
  await assert.rejects(installSkill({source, agent:'codex', project}), /Incomplete skill bundle/);
  assert.equal(await stat(project).catch(() => null), null);
});
