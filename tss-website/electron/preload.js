const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  isElectron: true,
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  openExternal: (url) => {
    ipcRenderer.send('open-external', url);
  },
});
