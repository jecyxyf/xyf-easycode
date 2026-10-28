import {mkdtemp, mkdir, rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join, resolve, relative, isAbsolute, sep} from 'node:path';

export const runtime = fileURLToPath(new URL('./.runtime/', import.meta.url));
export async function workspace(t, prefix) {
  await mkdir(runtime, {recursive:true});
  const directory = await mkdtemp(join(runtime, prefix + '-'));
  t.after(async () => {
    const target = resolve(directory), child = relative(resolve(runtime), target);
    if (!child || isAbsolute(child) || child === '..' || child.startsWith('..' + sep)) throw new Error('Unsafe test cleanup path.');
    await rm(target, {recursive:true, force:true});
  });
  return directory;
}
