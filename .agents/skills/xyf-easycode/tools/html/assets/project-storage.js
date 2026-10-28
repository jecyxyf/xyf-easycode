(function (root) {
  'use strict';
  const EC = root.EasyCode ||= {};
  function createController({initialProject = null,getProject,replaceProject,validate,pickExisting,pickNew,prepareSave = () => {},onSaved = () => {},
    isBusy = () => false,confirmImport = () => false,confirmReload = () => false,onState = () => {},onExternal = () => {}}) {
    let handle = null, baseline = null, loaded = initialProject !== null, editVersion = 0, savedVersion = 0, unconfirmed = false;
    let initialData = initialProject === null ? null : JSON.stringify(initialProject);
    let inFlight = null, checking = false, timer, stopped = false;
    const isDirty = () => unconfirmed || editVersion !== savedVersion;
    const getFileName = () => handle?.name || (loaded ? 'archify.json' : '');
    const state = (status,message) => onState({status,message,dirty:isDirty(),fileName:getFileName()});
    const read = async target => (await target.getFile()).text();
    const checkFile = target => {if (!/\.json$/i.test(target.name || '')) throw new Error('Choose  .json  architecture configuration file.');};
    function check(project) {
      const result = validate(project);
      if (result.errors.length) throw new Error(result.errors.map(item => `${item.path}: ${item.message}`).join('\n'));
      return project;
    }
    const parse = content => check(EC.ProjectFile.parse(content));
    const cancelled = () => Object.assign(new Error('Operation cancelled'),{name:'AbortError'});
    const conflict = () => {
      onExternal('The configuration changed elsewhere. Your edits are preserved. Save a copy before reloading the original file.',Boolean(handle));
      return new Error('The configuration does not match or changed elsewhere. The original file was preserved.');
    };
    function ready() {
      if (!loaded) throw new Error('First load archify.json.');
      if (isBusy()) throw new Error('Finish or cancel the current edit before file operations.');
    }
    // Invoke action synchronously: native pickers and permission requests need the user's click.
    function operation(action) {
      if (inFlight) return inFlight;
      let resolve, reject;
      const pending = new Promise((done,fail) => {resolve = done; reject = fail;});
      inFlight = pending;
      const finish = (error,result) => {
        inFlight = null;
        if (error) {
          state(error.name === 'AbortError' ? (isDirty() ? 'unsaved' : loaded ? 'loaded' : 'idle') : 'error',error.name === 'AbortError' ? 'Operation cancelled; current content is preserved' : error.message);
          reject(error);
        } else resolve(result);
      };
      try {Promise.resolve(action()).then(result => finish(null,result),error => finish(error));}
      catch (error) {finish(error);}
      return pending;
    }
    function open() {
      return operation(async () => {
        if (isBusy()) throw new Error('Finish or cancel the current edit before opening a file.');
        const selection = pickExisting(handle);
        state('loading','Loading configuration');
        const target = await selection; checkFile(target);
        const content = await read(target), next = parse(content);
        if (isBusy()) throw new Error('Finish or cancel the current edit before opening a file.');
        if (isDirty() && !await confirmImport()) throw cancelled();
        if (isBusy()) throw new Error('The current edit has not been finished.');
        replaceProject(next);
        handle = target; baseline = content; initialData = JSON.stringify(next); loaded = true; editVersion = savedVersion = 0; unconfirmed = false;
        onExternal('',false); state('loaded','Opened');
        return true;
      });
    }
    function save(asNew = false) {
      return operation(async () => {
        ready();
        const snapshotVersion = editVersion, snapshot = structuredClone(getProject());
        check(snapshot); prepareSave(snapshot); check(snapshot);
        const content = EC.ProjectFile.stringify(snapshot);
        // Request permission before reading the disk or waiting on anything else.
        const selection = asNew ? pickNew(getFileName() || 'archify.json',handle) : handle || pickExisting();
        const permission = !asNew && handle?.requestPermission ? handle.requestPermission({mode:'readwrite'}) : 'granted';
        state('saving',handle || asNew ? 'Saving configuration' : 'Choose the file associated with this page:  archify.json');
        if (await permission !== 'granted') throw new Error('Write permission was not granted. Your edits are preserved. Click Save again and allow writing.');
        const target = await selection;
        checkFile(target);
        if (target !== handle && target.requestPermission && await target.requestPermission({mode:'readwrite'}) !== 'granted') throw new Error('Write permission was not granted. Your edits are preserved.');
        const same = target === handle || (handle?.isSameEntry && await handle.isSameEntry(target));
        const before = await read(target);
        if (same && before !== baseline) throw conflict();
        if (!asNew && !handle && JSON.stringify(parse(before)) !== initialData) throw conflict();
        let writable, closed = false;
        try {
          writable = await target.createWritable();
          // Catch changes made while the browser was opening the write stream.
          if (await read(target) !== before) throw conflict();
          await writable.write(content);
          await writable.close(); closed = true;
          const readBack = await read(target);
          if (readBack !== content) throw new Error('Saved file content differs from these changes');
          parse(readBack);
          handle = target; baseline = readBack; initialData = JSON.stringify(snapshot); savedVersion = snapshotVersion; unconfirmed = false;
          if (editVersion === snapshotVersion) onSaved(snapshot);
          onExternal('',false);
          state(isDirty() ? 'unsaved' : 'saved',isDirty() ? 'Newer changes have not been saved' : 'Saved to the configuration file');
          return true;
        } catch (error) {
          if (writable && !closed) {try {await writable.abort();} catch { /* Keep the write error. */ }}
          if (closed) {
            unconfirmed = true;
            throw new Error(`The file may have been written, but readback verification failed: ${error.message}. Your current edits are preserved.`,{cause:error});
          }
          throw error;
        }
      });
    }
    async function refresh(force = false) {
      if (!handle || inFlight || checking || stopped) return false;
      checking = true;
      const target = handle, previous = baseline, requestedEdit = editVersion;
      const outdated = () => stopped || inFlight || target !== handle || previous !== baseline || requestedEdit !== editVersion;
      try {
        let content = await read(target);
        if (outdated()) return false;
        if (content === baseline) {onExternal('',false); return false;}
        let next = parse(content);
        if (isBusy()) {onExternal('The configuration was updated. Finish the current edit before loading the latest version.',true); return false;}
        if (isDirty()) {
          onExternal('The configuration was updated. Your edits are preserved. Save a copy before reloading the original.',true);
          if (!force || !await confirmReload()) return false;
          if (outdated() || isBusy()) return false;
          // The disk may change again while the confirmation is open.
          content = await read(target); next = parse(content);
        }
        if (outdated() || isBusy()) return false;
        replaceProject(next); baseline = content; initialData = JSON.stringify(next); savedVersion = editVersion; unconfirmed = false;
        onExternal('',false); state('loaded','Loaded the latest configuration');
        return true;
      } catch (error) {
        if (!outdated()) onExternal(`Cannot read the configuration right now: ${error.message}. Current content is preserved; you can reload the file.`,false);
        if (force) throw error;
        return false;
      } finally {checking = false;}
    }
    async function poll() {
      if (stopped) return;
      await refresh();
      if (!stopped) timer = setTimeout(poll,2000);
    }
    state(loaded ? 'loaded' : 'idle',loaded ? 'Loaded; choose the original file on the first save' : 'Please load  archify.json');
    return {
      importFile:open,save:() => save(),saveAs:() => save(true),reload:() => refresh(true),refresh,
      startSync() {stopped = false; clearTimeout(timer); timer = setTimeout(poll,2000);},
      destroy() {stopped = true; clearTimeout(timer);},
      markDirty() {editVersion++; state('unsaved','Unsaved changes');},
      isDirty,getFileName
    };
  }
  EC.ProjectStorage = {createController};
})(globalThis);
