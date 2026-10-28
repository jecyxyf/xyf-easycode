(function (root) {
  'use strict';
  const namespace = root.EasyCode ||= {};

  function createController({getProject,buildDocument,readProject,validate,pickExisting,pickNew,replaceProject,prepareSave = () => {},onSaved = () => {},confirmImport = () => false,onState = () => {}}) {
    // Capture before Canvas.fit() or edits can change the live project.
    const initialProject = structuredClone(getProject());
    let initialData = JSON.stringify(initialProject);
    let handle = null, lastContent = null, inFlight = null, importing = false;
    let editVersion = 0, savedVersion = 0, unconfirmed = false;
    const isDirty = () => unconfirmed || editVersion !== savedVersion;
    const getFileName = () => handle?.name || '';
    function state(status,message) {
      onState({status,message,fileName:getFileName(),dirty:isDirty()});
    }
    function check(project) {
      const result = validate(project);
      if (result.errors.length) throw new Error(result.errors.map(item => `${item.path}: ${item.message}`).join('\n'));
    }
    const read = async target => (await target.getFile()).text();

    async function persist(target,html,snapshot,snapshotVersion,saveAs) {
      let writable, closed = false;
      try {
        const before = await read(target);
        const sameTarget = target === handle || (handle?.isSameEntry && await handle.isSameEntry(target));
        if (sameTarget) {
          if (before !== lastContent) throw new Error('The file changed externally. Reopen it or save a copy.');
        } else if (!saveAs) {
          const diskProject = readProject(before);
          check(diskProject);
          if (diskProject.id !== snapshot.id) throw new Error('The selected file belongs to another project');
          if (JSON.stringify(diskProject) !== initialData) throw new Error('The file changed externally after this page opened. Reopen it or save a copy.');
        }
        writable = await target.createWritable();
        await writable.write(html);
        await writable.close();
        closed = true;
        const readBack = await read(target);
        if (JSON.stringify(readProject(readBack)) !== JSON.stringify(snapshot)) throw new Error('Post-save verification failed');
        // The target becomes current only after the disk contents have been verified.
        handle = target;
        lastContent = readBack;
        savedVersion = snapshotVersion;
        unconfirmed = false;
        if (editVersion === snapshotVersion) onSaved(snapshot);
        state(isDirty() ? 'unsaved' : 'saved',isDirty() ? 'Newer changes have not been saved' : 'Saved');
        return true;
      } catch (error) {
        if (writable && !closed) {
          try {await writable.abort();} catch { /* Preserve the original write failure. */ }
        }
        if (closed) {
          unconfirmed = true;
          throw new Error(`The file may have been written, but post-save verification failed: ${error.message}`,{cause:error});
        }
        throw error;
      }
    }

    // Deliberately not async: the picker runs in the click's call stack, and
    // every repeated click receives exactly the same Promise while busy.
    function start(saveAs) {
      if (importing) return Promise.reject(new Error('Importing; save or export again later'));
      if (inFlight) return inFlight;
      let resolve, reject;
      const pending = new Promise((done,fail) => {resolve = done; reject = fail;});
      inFlight = pending;
      function finish(error,result) {
        inFlight = null;
        if (error) {
          state(error.name === 'AbortError' ? 'unsaved' : 'error',error.name === 'AbortError' ? 'Save cancelled' : error.message);
          reject(error);
        } else resolve(result);
      }
      try {
        const snapshotVersion = editVersion;
        const snapshot = structuredClone(getProject());
        check(snapshot);
        prepareSave(snapshot);
        check(snapshot);
        const html = buildDocument(snapshot);
        // Do not move this into a .then(), await, or a queued operation.
        const selection = saveAs ? pickNew(getFileName() || 'project.html') : (handle || pickExisting());
        state('saving','Saving');
        Promise.resolve(selection).then(target => persist(target,html,snapshot,snapshotVersion,saveAs))
          .then(result => finish(null,result),error => finish(error));
      } catch (error) {finish(error);}
      return pending;
    }

    function importFile() {
      if (inFlight) return Promise.reject(new Error('A file operation is still running. Import again later.'));
      if (typeof replaceProject !== 'function') return Promise.reject(new Error('No import handler was configured'));
      let resolve, reject;
      const pending = new Promise((done,fail) => {resolve = done; reject = fail;});
      inFlight = pending; importing = true;
      function finish(error) {
        inFlight = null; importing = false;
        if (error) {
          state(error.name === 'AbortError' ? (isDirty() || !handle ? 'unsaved' : 'saved') : 'error',error.name === 'AbortError' ? 'Import cancelled' : error.message);
          reject(error);
        } else resolve(true);
      }
      try {
        // Open on the button's click stack; validate data without executing the HTML.
        const selection = pickExisting();
        state('loading','Importing');
        Promise.resolve(selection).then(async target => {
          const content = await read(target), project = readProject(content);
          check(project);
          const baseline = JSON.stringify(project);
          // Check at replacement time, including edits made while the file was loading.
          if (isDirty() && !await confirmImport()) throw Object.assign(new Error('Import cancelled'),{name:'AbortError'});
          replaceProject(project);
          initialData = baseline; handle = target; lastContent = content;
          editVersion = 0; savedVersion = 0; unconfirmed = false;
          state('saved','Imported');
        }).then(() => finish(),finish);
      } catch (error) {finish(error);}
      return pending;
    }

    state('unsaved','No save file has been selected');
    return {
      save: () => start(false),
      saveAs: () => start(true),
      importFile,
      markDirty() {editVersion++; state(importing ? 'loading' : inFlight ? 'saving' : 'unsaved',importing ? 'Importing; the current page has changes' : inFlight ? 'Saving; newer changes exist' : 'Unsaved changes');},
      isDirty,
      getFileName
    };
  }
  namespace.Storage = {createController};
})(globalThis);
