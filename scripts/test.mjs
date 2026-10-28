import {mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

const directory = fileURLToPath(new URL('../docs/archify/test/', import.meta.url));
const runtime = join(directory, '.runtime');
await mkdir(runtime, {recursive:true});
const child = spawn(process.execPath, ['--test', 'installer.test.mjs', 'editor.test.mjs'], {
  cwd:directory, stdio:'inherit', windowsHide:true,
  env:{...process.env, TMP:runtime, TEMP:runtime, TMPDIR:runtime}
});
child.once('error', error => {console.error(error.message); process.exitCode = 1;});
child.once('exit', code => {process.exitCode = code ?? 1;});
