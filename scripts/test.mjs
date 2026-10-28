import {access,mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

const directory = fileURLToPath(new URL('../docs/archify/test/', import.meta.url));
const runtime = join(directory, '.runtime');
const tests = [
  fileURLToPath(new URL('./tests/installer.test.mjs', import.meta.url)),
  fileURLToPath(new URL('../.agents/skills/xyf-easycode/tests/editor.test.mjs', import.meta.url))
];
for (const file of tests) await access(file);
await mkdir(runtime, {recursive:true});
const child = spawn(process.execPath, ['--test', ...tests], {
  cwd:directory, stdio:'inherit', windowsHide:true,
  env:{...process.env, EASYCODE_TEST_ROOT:directory, TMP:runtime, TEMP:runtime, TMPDIR:runtime}
});
child.once('error', error => {console.error(error.message); process.exitCode = 1;});
child.once('exit', code => {process.exitCode = code ?? 1;});
