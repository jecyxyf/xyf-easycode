import {createServer} from 'node:http';
import {randomInt} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {readProjectFile,writeProjectFile,validateProject,writeAtomic,versionOf} from './scripts/files.mjs';
import './assets/serialization.js';

export const toolsRoot = fileURLToPath(new URL('../',import.meta.url));
export const validPort = port => Number.isInteger(port) && port >= 10000 && port <= 65535;

// Update only the generated section, preserving any notes added by the user.
export async function writeReadme({root,url}) {
  const file = join(root,'ReadMe.md');
  let previous = null;
  try {previous = await readFile(file,'utf8');} catch (error) {if (error.code !== 'ENOENT') throw error;}
  const start = '<!-- archify:deployment:start -->', end = '<!-- archify:deployment:end -->';
  const port = new URL(url).port;
  const section = [start,'# Archify Web access','',`Open: [${url}/](${url}/)`,`Port: ${port}`,
    '','Data file: `archify.json`. The page loads it automatically. Click Save configuration or press Ctrl+S to write back to the same file.',
    '','Start or restart from this directory:','','```sh','node html/server.mjs','```','',
    'An available random five-digit port is used. This address updates after startup. Press Ctrl+C to stop the service.',end].join('\n');
  let content;
  const first = previous?.indexOf(start) ?? -1, last = previous?.indexOf(end,first) ?? -1;
  if (first >= 0 && last >= first) content = previous.slice(0,first) + section + previous.slice(last + end.length);
  else content = (previous === null ? '' : previous.trimEnd() + '\n\n') + section + '\n';
  await writeAtomic(file,content,{expectedVersion:previous === null ? null : versionOf(previous)});
  return file;
}

export async function startServer({root = toolsRoot,port} = {}) {
  root = resolve(root);
  const projectFile = join(root,'archify.json');
  await readProjectFile(projectFile);
  const entry = await readFile(join(root,'index.html'),'utf8');
  let serviceEntry = false;
  try {globalThis.EasyCode.Serialization.readProject(entry);} catch (error) {serviceEntry = error.code === 'SERVICE_ENTRY';}
  if (!serviceEntry) throw new Error('index.html  is not a service entry. First run  html/scripts/build.mjs --runtime。');
  if (port !== undefined && !validPort(port)) throw new Error('The port must be  10000～65535 , a five-digit integer.');
  let writes = Promise.resolve();
  const server = createServer(async (req,res) => {
    const send = (status,type,body,headers = {}) => {
      res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers});
      res.end(body);
    };
    const json = (status,data,headers) => send(status,'application/json; charset=utf-8',JSON.stringify(data),headers);
    try {
      const localPort = server.address().port;
      const hosts = new Set([`127.0.0.1:${localPort}`,`localhost:${localPort}`]);
      if (!hosts.has(req.headers.host)) return json(403,{error:'Use the local service address.'});
      if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) return json(403,{error:'Request origin does not match.'});
      const path = new URL(req.url,`http://${req.headers.host}`).pathname;
      if (req.method === 'GET' && path === '/health') {
        await readProjectFile(projectFile);
        return json(200,{ok:true,service:'easycode-archify',root,projectFile,port:localPort,pid:process.pid});
      }
      if (req.method === 'GET' && (path === '/' || path === '/index.html')) {
        return send(200,'text/html; charset=utf-8',await readFile(join(root,'index.html'),'utf8'));
      }
      if (req.method === 'GET' && path === '/archify.json') {
        const current = await readProjectFile(projectFile);
        return send(200,'application/json; charset=utf-8',current.content,{ETag:current.version});
      }
      if (req.method === 'GET' && path === '/api/project') {
        const current = await readProjectFile(projectFile);
        if (req.headers['if-none-match'] === current.version) return send(304,'application/json','',{ETag:current.version});
        return json(200,current.project,{ETag:current.version});
      }
      if (req.method === 'PUT' && path === '/api/project') {
        if (req.headers['content-type']?.split(';')[0].trim() !== 'application/json') return json(415,{error:'Please send  JSON。'});
        const expectedVersion = req.headers['if-match'];
        if (!expectedVersion) return json(428,{error:'Read the current file version before saving.'});
        const chunks = []; let length = 0;
        for await (const chunk of req) {
          length += chunk.length;
          if (length > 32 * 1024 * 1024) return json(413,{error:'The project file exceeds  32 MB。'});
          chunks.push(chunk);
        }
        let project;
        try {project = JSON.parse(Buffer.concat(chunks).toString('utf8'));}
        catch {return json(422,{error:'The request is not valid  JSON。'});}
        validateProject(project);
        const operation = writes.then(() => writeProjectFile(projectFile,project,{expectedVersion}));
        writes = operation.catch(() => {});
        const saved = await operation;
        return json(200,{saved:true},{ETag:saved.version});
      }
      if (req.method !== 'GET') return json(405,{error:'Unsupported request method.'});
      if (path === '/favicon.ico') return send(204,'image/x-icon','');
      if (path === '/ReadMe.md') return send(200,'text/plain; charset=utf-8',await readFile(join(root,'ReadMe.md'),'utf8'));
      if (/^\/html\/(assets|templates)\/[a-zA-Z0-9_.-]+\.(js|css|html|json|jsonc)$/.test(path)) {
        const type = path.endsWith('.js') ? 'text/javascript' : path.endsWith('.css') ? 'text/css' : path.endsWith('.html') ? 'text/html' : 'application/json';
        return send(200,`${type}; charset=utf-8`,await readFile(join(root,path.slice(1)),'utf8'));
      }
      json(404,{error:'Page not found.'});
    } catch (error) {
      json(error.status || (error.code === 'ENOENT' ? 404 : 500),{error:error.message});
    }
  });
  server.requestTimeout = 30000;
  const listen = candidate => new Promise((done,fail) => {
    const onError = error => {server.off('listening',onListen); fail(error);};
    const onListen = () => {server.off('error',onError); done();};
    server.once('error',onError); server.once('listening',onListen); server.listen(candidate,'127.0.0.1');
  });
  for (let attempt = 0; ; attempt++) {
    try {await listen(port ?? randomInt(10000,65536)); break;}
    catch (error) {if (port !== undefined || error.code !== 'EADDRINUSE' || attempt >= 63) throw error;}
  }
  const url = `http://127.0.0.1:${server.address().port}`;
  let readmeFile;
  try {readmeFile = await writeReadme({root,url});}
  catch (error) {await new Promise(done => server.close(done)); throw error;}
  return {server,url,root,projectFile,readmeFile};
}

export function keepRunning({server,url,projectFile,readmeFile}) {
  console.log(`Web address: ${url}/\nProject data: ${projectFile}\nAccess instructions: ${readmeFile}\nPress Ctrl+C to stop the service.`);
  for (const signal of ['SIGINT','SIGTERM']) process.once(signal,() => {
    server.close(); server.closeIdleConnections();
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    if (args.length && (args.length !== 2 || args[0] !== '--port')) throw new Error('Usage: node html/server.mjs [--port <five-digit-port>]');
    keepRunning(await startServer({port:args.length ? Number(args[1]) : undefined}));
  } catch (error) {console.error(error.message); process.exitCode = 1;}
}
