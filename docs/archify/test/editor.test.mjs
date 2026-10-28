import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {deploy} from '../../../.agents/skills/xyf-easycode/tools/html/scripts/deploy.mjs';
import {writeProjectFile, readProjectFile} from '../../../.agents/skills/xyf-easycode/tools/html/scripts/files.mjs';
import {checkService} from '../../../.agents/skills/xyf-easycode/tools/html/scripts/check.mjs';
import {workspace} from './helpers.mjs';
import '../../../.agents/skills/xyf-easycode/tools/html/assets/translation.js';

test('English code names format offline; Chinese names use the explicit translation service', async () => {
  let requests = 0;
  const translate = globalThis.EasyCode.Translation.createClient({fetch:async () => {
    requests++;
    return {ok:true, status:200, json:async () => ({responseStatus:200, responseData:{translatedText:'task storage'}})};
  }});
  assert.equal(await translate('Task Storage', 'module'), 'TaskStorage');
  assert.equal(await translate('save task', 'method'), 'saveTask');
  assert.equal(requests, 0);
  assert.equal(await translate('\u4efb\u52a1\u5b58\u50a8', 'module'), 'TaskStorage');
  assert.equal(requests, 1);
});

test('editor deploys, saves with version checks, rejects bad writes, and restarts with the same data', async t => {
  const project = await workspace(t, 'editor');
  const initial = globalThis.EasyCode.Model.createProject('Acceptance project');
  initial.description = 'An isolated editor acceptance fixture.';
  const source = join(project, 'input.json');
  await writeProjectFile(source, initial, {expectedVersion:null});
  const deployed = await deploy(project, {sourceFile:source});
  assert.equal(deployed.mode, 'service');
  const {startServer} = await import(pathToFileURL(join(deployed.targetRoot, 'html/server.mjs')).href);
  let service = await startServer();
  t.after(async () => {if (service.server.listening) await new Promise(done => {service.server.close(done); service.server.closeAllConnections();});});
  assert.match(new URL(service.url).port, /^\d{5}$/);
  assert.equal((await checkService(service.url)).modules, 0);
  const html = await (await fetch(service.url)).text();
  assert.match(html, /<html lang="en">/);
  assert.match(html, /Save configuration/);
  const loaded = await fetch(service.url + '/api/project');
  const version = loaded.headers.get('etag');
  assert.deepEqual(await loaded.json(), initial);
  const changed = structuredClone(initial); changed.description = 'Saved through the HTTP service.';
  const put = (body, headers = {}) => fetch(service.url + '/api/project', {method:'PUT', headers:{'Content-Type':'application/json', ...headers}, body:JSON.stringify(body)});
  assert.equal((await put(changed)).status, 428);
  const saved = await put(changed, {'If-Match':version});
  assert.equal(saved.status, 200);
  assert.notEqual(saved.headers.get('etag'), version);
  assert.deepEqual((await readProjectFile(deployed.projectFile)).project, changed);
  assert.equal((await put(initial, {'If-Match':version})).status, 409);
  assert.equal((await put({invalid:true}, {'If-Match':saved.headers.get('etag')})).status, 422);
  assert.deepEqual((await readProjectFile(deployed.projectFile)).project, changed);
  assert.equal((await fetch(service.url + '/api/project', {headers:{Origin:'https://example.com'}})).status, 403);
  await deploy(project); // Existing JSON is retained when regenerating deployment files.
  assert.deepEqual((await readProjectFile(deployed.projectFile)).project, changed);
  await assert.rejects(deploy(project, {sourceFile:source}), /already has a different/);
  const notes = '\nUser deployment notes.\n';
  await writeFile(service.readmeFile, await readFile(service.readmeFile, 'utf8') + notes);
  await new Promise(done => {service.server.close(done); service.server.closeAllConnections();});
  service = await startServer();
  assert.deepEqual(await (await fetch(service.url + '/api/project')).json(), changed);
  const readme = await readFile(service.readmeFile, 'utf8');
  assert.ok(readme.includes(service.url + '/'));
  assert.ok(readme.includes(notes));
  assert.equal((await checkService(service.url)).mode, 'service');
});
