import {cp,mkdir,readFile} from 'node:fs/promises';
import {resolve,join,relative,sep,isAbsolute} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {isDeepStrictEqual} from 'node:util';
import {buildRuntime} from './build.mjs';
import {fileVersion,readProjectFile,writeProjectFile} from './files.mjs';
import {check,checkService} from './check.mjs';
import {validPort,writeReadme} from '../server.mjs';

const sourceRoot = fileURLToPath(new URL('../../',import.meta.url));
export async function deploy(projectRoot,{sourceFile,outputDir = 'docs/archfiy',mode = 'service'} = {}) {
  if (!['local','service'].includes(mode)) throw new Error('Deployment mode must be  local  or  service。');
  projectRoot = resolve(projectRoot);
  const inside = (parent,child) => {const path = relative(parent,child); return path === '' || path !== '..' && !path.startsWith('..' + sep) && !isAbsolute(path);};
  if (typeof outputDir !== 'string' || !outputDir.trim() || isAbsolute(outputDir)) throw new Error('The deployment directory must be project-relative.');
  const targetRoot = resolve(projectRoot,outputDir), targetFile = join(targetRoot,'archify.json');
  if (targetRoot === projectRoot || !inside(projectRoot,targetRoot)) throw new Error('The deployment directory must be inside the target project and cannot be its root.');
  if (inside(sourceRoot,targetRoot) || inside(targetRoot,sourceRoot)) throw new Error('The deployment directory must not overlap the tool source.');
  const previousVersion = await fileVersion(targetFile);
  let project;
  if (previousVersion !== null) {
    project = (await readProjectFile(targetFile)).project;
    if (sourceFile && !isDeepStrictEqual(project,(await readProjectFile(resolve(sourceFile))).project)) throw new Error('The target project already has a different  archify.json was preserved. Confirm the data baseline before updating the configuration separately.');
  } else if (sourceFile) project = (await readProjectFile(resolve(sourceFile))).project;
  else {
    if (await fileVersion(join(targetRoot,'archify.js')) !== null) throw new Error('The target directory contains legacy  archify.js; first confirm the  JSON  data source first to avoid replacing existing architecture with an empty template.');
    // Use the shipped empty framework, but give every new project its own identity.
    project = (await readProjectFile(join(sourceRoot,'archify.json'))).project;
    project.id = globalThis.EasyCode.Model.createProject().id;
  }
  await mkdir(targetRoot,{recursive:true});
  if (mode === 'service') await cp(join(sourceRoot,'html'),join(targetRoot,'html'),{recursive:true,filter:path => !path.endsWith('.tmp')});
  await buildRuntime(join(targetRoot,'index.html'),undefined,{mode});
  if (previousVersion === null) await writeProjectFile(targetFile,project,{expectedVersion:null});
  const result = await check(join(targetRoot,'index.html'));
  return {projectRoot,targetRoot,projectFile:targetFile,dataPreserved:previousVersion !== null,...result};
}
async function runningService(targetRoot,port) {
  const candidates = new Set(port === undefined ? [] : [port]);
  try {
    const readme = await readFile(join(targetRoot,'ReadMe.md'),'utf8');
    const saved = Number(/http:\/\/127\.0\.0\.1:(\d{5})\//.exec(readme)?.[1]);
    if (validPort(saved)) candidates.add(saved);
  } catch (error) {if (error.code !== 'ENOENT') throw error;}
  for (const candidate of candidates) {
    const url = `http://127.0.0.1:${candidate}`;
    try {
      const response = await fetch(url + '/health',{signal:AbortSignal.timeout(1000)}), health = await response.json();
      if (response.ok && health.service === 'easycode-archify' && resolve(health.root) === resolve(targetRoot)) {
        if (port !== undefined && candidate !== port) throw Object.assign(new Error(`This directory already has a service at  ${url}/ . Stop that service before changing its port.`),{code:'PORT_CONFLICT'});
        return url;
      }
    } catch (error) {if (error.code === 'PORT_CONFLICT') throw error;}
  }
  return null;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const [projectRoot,...args] = process.argv.slice(2), options = {}; let start, port;
    if (!projectRoot) throw new Error('Usage: node html/scripts/deploy.mjs <target-project-root> [--output-dir <project-relative-directory>] [--source-file <archify.jsonPath>] [--no-start] [--port <five-digit-port>] [--mode service|local]');
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--start') start = true;
      else if (args[i] === '--no-start') start = false;
      else if (args[i] === '--mode' && args[i + 1] && !args[i + 1].startsWith('--')) options.mode = args[++i];
      else if (args[i] === '--output-dir' && args[i + 1] && !args[i + 1].startsWith('--')) options.outputDir = args[++i];
      else if (args[i] === '--source-file' && args[i + 1] && !args[i + 1].startsWith('--')) options.sourceFile = args[++i];
      else if (args[i] === '--port' && args[i + 1]) port = Number(args[++i]);
      else throw new Error(`Unsupported argument: ${args[i]}`);
    }
    start ??= options.mode !== 'local';
    if (start && options.mode === 'local') throw new Error('local  mode supports only manual loading of  JSON without starting a service.');
    if (port !== undefined && !start) throw new Error('--port  requires starting the service.');
    if (port !== undefined && !validPort(port)) throw new Error('The port must be  10000～65535 , a five-digit integer.');
    const result = await deploy(projectRoot,options);
    console.log(JSON.stringify(result,null,2));
    if (start) {
      const running = await runningService(result.targetRoot,port);
      if (running) {
        await writeReadme({root:result.targetRoot,url:running});
        await checkService(running);
        console.log(`Web service is already running: ${running}/\nAccess instructions: ${join(result.targetRoot,'ReadMe.md')}`);
      } else {
        const {startServer,keepRunning} = await import(pathToFileURL(join(result.targetRoot,'html','server.mjs')).href);
        const service = await startServer({port});
        try {await checkService(service.url);}
        catch (error) {await new Promise(done => service.server.close(done)); throw error;}
        keepRunning(service);
      }
    } else if (result.mode === 'local') console.log('This entry requires manually loading  archify.json; default deployment uses a  Node  web service.');
    else console.log(`The page was generated but not started. Start with: node "${join(result.targetRoot,'html','server.mjs')}"`);
  } catch (error) {console.error(error.message); process.exitCode = 1;}
}
