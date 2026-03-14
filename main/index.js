const { app, BrowserWindow } = require('electron');
const path = require('path');
const { registerIpcHandlers } = require('./handlers/ipcHandlers');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#111827',
  });

  const indexPath = path.join(__dirname, '..', 'renderer', 'dist', 'index.html');
  mainWindow.loadFile(indexPath).catch(() => {
    mainWindow.loadURL('data:text/html,<h1>Loading... Make sure to run npm run watch</h1>');
  });
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
