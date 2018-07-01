const { app, BrowserWindow } = require('electron');
require('electron-reload')(__dirname);
require('./core/task');
require('./core/project');
require('./core/dataset');

let mainWindow = null;

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 768,
    minWidth: 1080,
    minHeight: 768,
    acceptFirstMouse: true,
    titleBarStyle: 'hidden',
    maximizable: false
  });
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});
