import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {deploy} from '../tools/html/scripts/deploy.mjs';
import {build} from '../tools/html/scripts/build.mjs';
import {check,checkService} from '../tools/html/scripts/check.mjs';
import {readProjectFile,writeProjectFile} from '../tools/html/scripts/files.mjs';
import {startServer} from '../tools/html/server.mjs';
import '../tools/html/assets/service-storage.js';

async function close(server) {
  if (!server.listening) return;
  await new Promise((done,fail) => {
    server.close(error => error ? fail(error) : done());
    server.closeAllConnections();
  });
}

async function workspace(t) {
  const runtime = join(resolve(process.env.EASYCODE_TEST_ROOT || 'docs/archify/test'),'.runtime');
  await mkdir(runtime,{recursive:true});
  const directory = await mkdtemp(join(runtime,'editor-')), servers = [];
  t.after(async () => {
    for (const server of servers) await close(server);
    await rm(directory,{recursive:true,force:true});
  });
  const projectRoot = join(directory,'project'), deployment = await deploy(projectRoot);
  return {
    directory,projectRoot,...deployment,
    async start() {
      const service = await startServer({root:deployment.targetRoot});
      servers.push(service.server);
      return service;
    }
  };
}

const request = (url,options) => fetch(url,{...options,signal:AbortSignal.timeout(10000)});
async function load(url) {
  const response = await request(url + '/api/project');
  assert.equal(response.status,200);
  return {project:await response.json(),version:response.headers.get('ETag')};
}
const save = (url,project,version) => request(url + '/api/project',{
  method:'PUT',headers:{'Content-Type':'application/json','If-Match':version},body:JSON.stringify(project)
});

test('default deployment creates an independent project in docs/archify',async t => {
  const first = await workspace(t), second = await workspace(t);
  assert.equal(first.targetRoot,join(first.projectRoot,'docs/archify'));
  assert.equal(first.projectFile,join(first.targetRoot,'archify.json'));
  assert.equal(first.mode,'service');
  const a = (await readProjectFile(first.projectFile)).project;
  const b = (await readProjectFile(second.projectFile)).project;
  assert.notEqual(a.id,b.id);
  assert.deepEqual(a.modules,[]);
  const result = await check(join(first.targetRoot,'index.html'),first.projectFile);
  assert.equal(result.mode,'service');
  assert.deepEqual(result.errors,[]);
});

test('redeployment preserves exact configuration contents and rejects a conflicting source',async t => {
  const fixture = await workspace(t), current = await readProjectFile(fixture.projectFile);
  current.project.name = 'Existing architecture';
  const content = JSON.stringify(current.project,null,4) + '\n\n';
  await writeFile(fixture.projectFile,content);
  const result = await deploy(fixture.projectRoot);
  assert.equal(result.dataPreserved,true);
  assert.equal(await readFile(fixture.projectFile,'utf8'),content);
  const sourceFile = join(fixture.directory,'different.json');
  await writeProjectFile(sourceFile,{...current.project,name:'Different architecture'},{expectedVersion:null});
  await assert.rejects(deploy(fixture.projectRoot,{sourceFile}),/different/);
  assert.equal(await readFile(fixture.projectFile,'utf8'),content);
});

test('custom local deployment works and output cannot escape the project',async t => {
  const fixture = await workspace(t);
  const custom = await deploy(fixture.projectRoot,{outputDir:'design/architecture',mode:'local'});
  assert.equal(custom.targetRoot,join(fixture.projectRoot,'design/architecture'));
  assert.equal(custom.mode,'local');
  assert.deepEqual(custom.errors,[]);
  for (const outputDir of ['../outside','.',fixture.directory]) {
    await assert.rejects(deploy(fixture.projectRoot,{outputDir}));
  }
});

test('the service loads the deployed configuration and supports conditional reads',async t => {
  const fixture = await workspace(t), service = await fixture.start();
  const result = await checkService(service.url);
  assert.equal(result.projectFile,fixture.projectFile);
  assert.deepEqual(result.errors,[]);
  const current = await load(service.url), disk = await readProjectFile(fixture.projectFile);
  assert.deepEqual(current.project,disk.project);
  assert.equal(current.version,disk.version);
  const unchanged = await request(service.url + '/api/project',{headers:{'If-None-Match':current.version}});
  assert.equal(unchanged.status,304);
});

test('saving writes the same JSON and survives a service restart',async t => {
  const fixture = await workspace(t), service = await fixture.start(), current = await load(service.url);
  current.project.name = '保存后的架构';
  const response = await save(service.url,current.project,current.version);
  assert.equal(response.status,200);
  assert.deepEqual(await response.json(),{saved:true});
  const disk = await readProjectFile(fixture.projectFile);
  assert.deepEqual(disk.project,current.project);
  assert.equal(response.headers.get('ETag'),disk.version);
  assert.equal(disk.content,JSON.stringify(current.project,null,2) + '\n');
  await close(service.server);
  const restarted = await fixture.start();
  assert.deepEqual((await load(restarted.url)).project,current.project);
});

test('stale and unversioned writes cannot overwrite the latest configuration',async t => {
  const fixture = await workspace(t), service = await fixture.start(), current = await load(service.url);
  const latest = {...current.project,name:'First editor saved'};
  const first = await save(service.url,latest,current.version);
  assert.equal(first.status,200);
  await first.json();
  const stale = await save(service.url,{...current.project,name:'Stale edit'},current.version);
  assert.equal(stale.status,409);
  await stale.json();
  const unversioned = await request(service.url + '/api/project',{
    method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(current.project)
  });
  assert.equal(unversioned.status,428);
  await unversioned.json();
  assert.deepEqual((await readProjectFile(fixture.projectFile)).project,latest);
});

test('invalid data and foreign origins leave configuration contents intact',async t => {
  const fixture = await workspace(t), service = await fixture.start(), current = await load(service.url);
  const before = await readFile(fixture.projectFile,'utf8');
  for (const [contentType,body,status] of [
    ['text/plain','{}',415],
    ['application/json','{',422],
    ['application/json',JSON.stringify({...current.project,modules:null}),422]
  ]) {
    const response = await request(service.url + '/api/project',{
      method:'PUT',headers:{'Content-Type':contentType,'If-Match':current.version},body
    });
    assert.equal(response.status,status);
    await response.json();
  }
  const foreign = await request(service.url + '/api/project',{
    method:'PUT',headers:{'Content-Type':'application/json','If-Match':current.version,Origin:'https://example.invalid'},
    body:JSON.stringify({...current.project,name:'Foreign edit'})
  });
  assert.equal(foreign.status,403);
  await foreign.json();
  assert.equal(await readFile(fixture.projectFile,'utf8'),before);
});

test('the storage client saves, reloads clean pages and preserves unsaved edits on conflict',async t => {
  const fixture = await workspace(t), service = await fixture.start();
  const previousLocation = Object.getOwnPropertyDescriptor(globalThis,'location');
  Object.defineProperty(globalThis,'location',{configurable:true,value:new URL(service.url)});
  t.after(() => {
    if (previousLocation) Object.defineProperty(globalThis,'location',previousLocation);
    else delete globalThis.location;
  });
  const EC = globalThis.EasyCode, initial = await EC.ServiceStorage.load();
  let project = initial.project;
  const controller = EC.ServiceStorage.createController({
    version:initial.version,getProject:() => project,replaceProject:next => {project = next;},validate:EC.Model.validate
  });
  t.after(() => controller.destroy());
  project.name = 'Client saved';
  controller.markDirty();
  assert.equal(await controller.save(),true);
  assert.equal(controller.isDirty(),false);
  assert.deepEqual((await readProjectFile(fixture.projectFile)).project,project);
  let disk = await readProjectFile(fixture.projectFile);
  await writeProjectFile(fixture.projectFile,{...disk.project,name:'External edit'},{expectedVersion:disk.version});
  assert.equal(await controller.reload(),true);
  assert.equal(project.name,'External edit');
  project.name = 'Unsaved page edit';
  controller.markDirty();
  disk = await readProjectFile(fixture.projectFile);
  await writeProjectFile(fixture.projectFile,{...disk.project,name:'Newer external edit'},{expectedVersion:disk.version});
  assert.equal(await controller.reload(),false);
  await assert.rejects(controller.save(),{status:409});
  assert.equal(project.name,'Unsaved page edit');
  assert.equal(controller.isDirty(),true);
  assert.equal((await readProjectFile(fixture.projectFile)).project.name,'Newer external edit');
});

test('HTML snapshots contain the exact architecture configuration',async t => {
  const fixture = await workspace(t), current = await readProjectFile(fixture.projectFile);
  current.project.description = 'Quotes " and markup </script><script> must remain data.';
  await writeProjectFile(fixture.projectFile,current.project,{expectedVersion:current.version});
  const snapshot = join(fixture.directory,'architecture.html');
  await build(fixture.projectFile,snapshot);
  const result = await check(snapshot,fixture.projectFile);
  assert.equal(result.mode,'snapshot');
  assert.deepEqual(result.errors,[]);
});
