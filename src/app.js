const { app, BrowserWindow } = require('electron');
require('electron-reload')(__dirname);
require('./core/task');
require('./core/project');
require('./core/dataset');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 768,
    minWidth: 1080,
    minHeight: 768,
    acceptFirstMouse: true,
    titleBarStyle: 'hidden',
    frame: false,
  });
  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});
