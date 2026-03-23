const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;
let nextServer = null;

function startNextServer() {
  if (isDev) return;
  
  const nextPath = path.join(__dirname, '../node_modules/.bin/next');
  const serverPath = path.join(__dirname, '..');
  
  nextServer = spawn('node', [nextPath, 'start'], {
    cwd: serverPath,
    env: { 
      ...process.env, 
      PORT: '3000',
      NODE_ENV: 'production',
      ELECTRON: 'true'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  nextServer.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`Next.js: ${output}`);
    if (output.includes('Ready') || output.includes('started server')) {
      console.log('Next.js server is ready!');
    }
  });

  nextServer.stderr.on('data', (data) => {
    console.error(`Next.js error: ${data}`);
  });

  nextServer.on('error', (error) => {
    console.error('Failed to start Next.js server:', error);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#000000',
    titleBarStyle: 'hiddenInset',
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      sandbox: false,
      experimentalFeatures: false,
    },
    icon: path.join(__dirname, '../public/assets/Logo/Glowne/Two Steps Studio Bez Tła.png'),
    show: false,
  });

  const startUrl = 'http://localhost:3000';

  const loadApp = () => {
    mainWindow.loadURL(startUrl).catch((err) => {
      console.error('Failed to load URL:', err);
      if (!isDev) {
        setTimeout(loadApp, 1000);
      }
    });
  };

  if (!isDev) {
    startNextServer();
    setTimeout(() => {
      loadApp();
    }, 5000);
  } else {
    loadApp();
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    try {
      const parsedUrl = new URL(navigationUrl);
      const startUrlParsed = new URL(startUrl);
      
      if (parsedUrl.origin !== startUrlParsed.origin) {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      }
    } catch (e) {
      console.error('Navigation error:', e);
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (nextServer) {
    nextServer.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (nextServer) {
    nextServer.kill();
  }
});

app.on('web-contents-created', (_, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('is-electron', () => {
  return true;
});

ipcMain.on('open-external', (_, url) => {
  shell.openExternal(url);
});
