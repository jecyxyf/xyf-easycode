(function (root) {
  'use strict';
  const EC = root.EasyCode ||= {};
  function validate(project) {
    // Configuration contains data only, including when imported from a browser.
    function visit(value) {
      if (!value || typeof value !== 'object') return;
      if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) throw new Error('Configuration may contain only plain data objects.');
      if (Object.hasOwn(value,'__proto__')) throw new Error('Configuration must not contain  __proto__  field.');
      Object.values(value).forEach(visit);
    }
    visit(project);
    const result = EC.Model.validate(project);
    if (result.errors.length) throw new Error(result.errors.map(item => `${item.path}: ${item.message}`).join('\n'));
    return project;
  }
  function parse(content) {
    if (typeof content !== 'string') throw new Error('Configuration content must be text.');
    let project;
    try {project = JSON.parse(content.replace(/^\uFEFF/,''));}
    catch {throw new Error('archify.json  is not valid  JSON. Check quotes, commas and brackets.');}
    return validate(project);
  }
  function stringify(project) {
    validate(project);
    return JSON.stringify(project,null,2) + '\n';
  }
  EC.ProjectFile = {parse,stringify,validate};
})(globalThis);
