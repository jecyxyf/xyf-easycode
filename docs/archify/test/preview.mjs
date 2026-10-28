// Isolated browser acceptance fixture. This is not a project's formal architecture.
import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {deploy} from '../../../.agents/skills/xyf-easycode/tools/html/scripts/deploy.mjs';
import {startServer, keepRunning} from '../../../.agents/skills/xyf-easycode/tools/html/server.mjs';
import {writeProjectFile, fileVersion} from '../../../.agents/skills/xyf-easycode/tools/html/scripts/files.mjs';

const root = fileURLToPath(new URL('./.runtime/browser-preview/', import.meta.url));
await mkdir(root, {recursive:true});
const model = globalThis.EasyCode.Model;
const project = model.createProject('EasyCode editor verification');
project.englishName = 'easycode-editor-verification';
project.description = 'An isolated browser fixture for architecture, interfaces and saving.';
project.repository.revision = '0.0.1';
project.groups = [
  {id:'group-ui', name:'User interface', englishName:'UserInterface', color:'#ffffff', backgroundColor:'#81b3e9', x:70, y:80},
  {id:'group-storage', name:'Storage', englishName:'Storage', color:'#ffffff', backgroundColor:'#90b6a0', x:70, y:860}
];
const board = model.createModule({name:'Task board', purpose:'Display tasks and request a save.', x:120, y:160, groupId:'group-ui'});
board.englishName = 'TaskBoard'; board.language = 'JavaScript'; board.requirements = ['Reject empty task titles.', 'Show the saved task.']; board.dependencies = ['TaskStorage'];
const save = model.createInterface();
Object.assign(save, {name:'Save task', englishName:'saveTask', purpose:'Validate and save the current task.', flow:'Validate the title\nSave the task\nReturn the result', errors:'Report an empty title or storage error', inputsConfirmed:true, outputsConfirmed:true});
const input = model.createParameter(); Object.assign(input, {name:'Task title', englishName:'title', type:'string', description:'Title of the task to save.', required:true});
const output = model.createParameter(); Object.assign(output, {name:'Saved task', englishName:'task', type:'Task', description:'The stored task.'});
save.inputs.push(input); save.outputs.push(output); board.interfaces.push(save);
const storage = model.createModule({name:'Task storage', purpose:'Store and retrieve task records.', x:120, y:960, groupId:'group-storage'});
storage.englishName = 'TaskStorage'; storage.language = 'JavaScript';
project.modules.push(board, storage);
model.addRelation(project, {from:board.id, to:storage.id, label:'Save task', fromPort:'bottom', toPort:'top'});
const source = join(root, 'fixture.json');
await writeProjectFile(source, project, {expectedVersion:await fileVersion(source)});
const target = await deploy(root, {sourceFile:source});
keepRunning(await startServer({root:target.targetRoot}));
