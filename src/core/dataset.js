const { ipcMain } = require('electron');
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');

const baseDir = 'projects';

ipcMain.on('add-dataset', (event, arg) => {
  const { projectName, filePath } = arg;
  const datasetDir = path.join(baseDir, projectName, 'datasets');
  if (!fs.existsSync(datasetDir)) {
    fs.mkdirSync(datasetDir);
  }
  fs.createReadStream(filePath).pipe(
    fs.createWriteStream(path.join(datasetDir, path.basename(filePath)))
  );
});
