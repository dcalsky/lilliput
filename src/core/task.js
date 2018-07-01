const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const request = require('request');

const projectBaseDir = 'projects';

global.assert = require('assert');
global.request = requrie('request')

function clearRequireCache() {
  Object.keys(require.cache).forEach((key) => {
    delete require.cache[key];
  });
}

ipcMain.on('run-test', (event, arg) => {
  const Mocha = require('mocha');
  const projectPath = path.join(projectBaseDir, arg.projectName);
  const specPath = path.join(projectPath, 'specs', `${arg.specName}.js`);
  const mocha = new Mocha();

  let totalTest = 0;
  const cases = [];

  global.readCSV = function (filePath) {
    return Papa.parse(fs.readFileSync(path.join(projectPath, 'datasets', filePath), 'utf8')).data;
  };



  mocha.addFile(specPath);

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
    cases.push({ state, title });
  });
});
