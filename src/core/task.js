const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const { Suite } = require('benchmark');

const projectBaseDir = 'projects';

global.assert = require('assert');
global.request = require('axios');
require('chai/register-assert');
require('chai/register-expect');
require('chai/register-should');

function clearRequireCache() {
  Object.keys(require.cache).forEach((key) => {
    delete require.cache[key];
  });
}

ipcMain.on('run-test', (event, arg) => {
  const Mocha = require('mocha');
  const suite = new Suite();
  const projectPath = path.join(projectBaseDir, arg.projectName);
  const specPath = path.join(projectPath, 'specs', `${arg.specName}.js`);
  const mocha = new Mocha();

  let totalTest = 0;
  const cases = [];
  const benchs = [];
  global.bench = addBench;
  global.readCSV = function (filePath) {
    return Papa.parse(fs.readFileSync(path.join(projectPath, 'datasets', filePath), 'utf8')).data;
  };

  mocha.addFile(specPath);
  suite.on('cycle', (e) => {
    benchs.push(String(e.target));
  });
  suite.on('complete', (e) => {
    event.sender.send('run-bench-resp', {
      benchs
    });
  });
  const runner = mocha.run((failed) => {
    event.sender.send('run-test-resp', {
      passed: totalTest - failed,
      failed,
      cases
    });
    clearRequireCache();
  });
  runner.on('test end', (test) => {
    totalTest += 1;
    const { state, title } = test;
    cases.push({ state, title, id: totalTest });
  });
  suite.run({
    async: true
  });

  function addBench(name, cb) {
    suite.add(name, cb);
  }
});
