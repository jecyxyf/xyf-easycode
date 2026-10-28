(function (root) {
  'use strict';
  const EC = root.EasyCode ||= {};
  // Presentation only: Model.validate remains the source of validation rules.
  function formatWarnings(project, warnings) {
    const named = (kind,index,item) => `${kind} ${index + 1}: ${EC.Model.displayName(item,'Unnamed')}`;
    function location(path) {
      if (path === 'name' || path === 'description') return `Project / ${path === 'name' ? 'Project name' : 'Project purpose'}`;
      let match = /^groups\[(\d+)\]\.name$/.exec(path);
      if (match) return `${named('Group',Number(match[1]),project.groups[match[1]])} / Group name`;
      match = /^modules\[(\d+)\](.*)$/.exec(path);
      if (!match) return path;
      let item = project.modules[match[1]], rest = match[2], kind = 'Module';
      const parts = [named(kind,Number(match[1]),item)], groups = {interfaces:'Method',inputs:'Input parameters',outputs:'Return values',parameters:'Parameter',structures:'Data structures',fields:'Field',events:'Event',tests:'Tests'};
      while ((match = /^\.(interfaces|inputs|outputs|parameters|structures|fields|events|tests)\[(\d+)\]/.exec(rest))) {
        kind = groups[match[1]]; item = item?.[match[1]]?.[match[2]];
        parts.push(named(kind,Number(match[2]),item)); rest = rest.slice(match[0].length);
      }
      const labels = {name:`${kind} name`,englishName:`${kind} code name`,purpose:kind === 'Module' ? 'Module purpose' : 'Method purpose',type:kind === 'Field' ? 'Data type' : 'Parameter type',description:kind === 'Field' ? 'Purpose' : kind === 'Event' ? 'Describe the event' : 'Parameter description',steps:'Test steps',expected:'Expected result'};
      const field = rest.slice(1);
      if (!Object.hasOwn(labels,field)) return path;
      parts.push(labels[field]); return parts.join(' / ');
    }
    return warnings.length ? `The draft has  ${warnings.length}  incomplete items (saving is allowed): \n${warnings.map(item => `${location(item.path)}: ${item.message}`).join('\n')}` : '';
  }
  function createWarningNotice({show,hide,schedule = callback => root.setTimeout(callback,5000),cancel = timer => root.clearTimeout(timer)}) {
    let timer = null, lastMessage = '', lastScope;
    function dismiss() {if (timer !== null) cancel(timer); timer = null; hide();}
    return {
      update(message,scope) {
        if (scope === lastScope && message === lastMessage) return;
        dismiss(); lastScope = scope; lastMessage = message;
        if (!message) return;
        show(message); timer = schedule(dismiss);
      },
      dismiss
    };
  }
  EC.Feedback = {formatWarnings,createWarningNotice};
})(globalThis);
