# Two Steps Studio - Desktop Application Guide

Complete guide for building, releasing, and maintaining the Electron desktop application for Windows.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Development](#development)
6. [Building](#building)
7. [Release Process](#release-process)
8. [Auto-Updates](#auto-updates)
9. [File Structure](#file-structure)
10. [Configuration](#configuration)
11. [Troubleshooting](#troubleshooting)

## Overview

The Two Steps Studio desktop application is built using Electron, wrapping the existing Next.js web application. It provides:

- **Full offline support** for features that don't require server connectivity
- **Automatic updates** via electron-updater
- **Native Windows integration** (notifications, taskbar, shortcuts)
- **Session persistence** across app restarts
- **Professional installer** with NSIS
- **Portable version** for USB/external drive usage

## Architecture

### Technology Stack

- **Electron**: Desktop application framework
- **Next.js**: Web application framework (existing)
- **electron-builder**: Build and packaging tool
- **electron-updater**: Automatic update system
- **React**: UI framework (existing)
- **TypeScript**: Type safety (existing)

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   Desktop Application                     │
├─────────────────────────────────────────────────────────┤
│  Electron Main Process (Node.js)                        │
│  - Window management                                     │
│  - Auto-updater                                          │
│  - System notifications                                  │
│  - File system operations                                │
│  - Network connectivity checks                           │
└─────────────────────────────────────────────────────────┘
                          ↓ IPC
┌─────────────────────────────────────────────────────────┐
│  Preload Script (Security Bridge)                        │
│  - Expose safe APIs to renderer                          │
│  - Context isolation                                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Renderer Process (Next.js + React)                     │
│  - Web application UI                                    │
│  - Electron API hooks                                   │
│  - Offline support                                       │
│  - Update notifications                                  │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites

### Required Software

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: For version control
- **Windows 10/11**: For building Windows applications

### Required Node.js Packages

The following packages are included in `package.json`:

```json
{
  "electron": "^35.0.0",
  "electron-builder": "^26.8.1",
  "electron-updater": "^6.3.0",
  "sharp": "^0.33.5",
  "cross-env": "^7.0.3",
  "concurrently": "^9.1.0",
  "wait-on": "^8.0.5"
}
```

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd tss-website
```

### 2. Install Dependencies

```bash
npm install
```

This will automatically run the icon generation script via `postinstall`.

### 3. Generate Icons (if needed)

If the automatic icon generation fails:

```bash
npm run generate-icons
```

This converts the source logo to all required formats for Windows.

### 4. Verify Installation

```bash
npm run electron:dev
```

This should start the Electron app in development mode.

## Development

### Development Mode

Run the Electron app with hot-reload:

```bash
npm run electron:dev
```

This command:
1. Starts the Next.js development server
2. Waits for the server to be ready
3. Launches the Electron window
4. Opens DevTools for debugging

### Web Development Only

To work on the web version without Electron:

```bash
npm run dev
```

### Testing Electron APIs

The Electron APIs are available via the `window.electron` object. Test them in the browser console:

```javascript
// Check if running in Electron
window.electron?.isElectron // true/false

// Get app version
await window.electron.getAppVersion()

// Check network status
await window.electron.isOnline()
```

## Building

### Build for Windows

#### Full Build (NSIS Installer + Portable)

```bash
npm run electron:build:win
```

This generates:
- NSIS installer: `dist-electron/Two Steps Studio-1.0.0-x64.exe`
- Portable version: `dist-electron/Two Steps Studio-1.0.0-portable.exe`

#### NSIS Installer Only

```bash
npm run electron:build:win:nsis
```

#### Portable Version Only

```bash
npm run electron:build:win:portable
```

### Build Process

The build process:

1. **Next.js Build**: Compiles the Next.js application for production
2. **Electron Build**: Packages the application with electron-builder
3. **Code Signing**: (Optional) Signs the executable
4. **Installer Creation**: Creates NSIS installer with custom configuration
5. **Output**: Places files in `dist-electron/` directory

### Build Output

```
dist-electron/
├── Two Steps Studio-1.0.0-x64.exe          # NSIS installer
├── Two Steps Studio-1.0.0-portable.exe     # Portable version
├── builder-effective-config.yaml          # Build configuration
└── builder-debug.yml                       # Debug information
```

## Release Process

### 1. Update Version

Update the version in `package.json`:

```json
{
  "version": "1.0.1"
}
```

### 2. Update Changelog

Add release notes to the download page (`src/app/pobierz/page.tsx`).

### 3. Build Release

```bash
npm run electron:release:win
```

This builds and publishes the release to the configured update server.

### 4. Upload Files

Upload the generated files to your release server:

- `Two Steps Studio-1.0.1-x64.exe` → Main download
- `Two Steps Studio-1.0.1-portable.exe` → Portable download
- `latest.yml` → Auto-update metadata

### 5. Update Download Page

Update the download page with the new version information.

## Auto-Updates

### How Auto-Updates Work

1. **Check on Startup**: App checks for updates on launch
2. **Background Check**: Periodic checks every 24 hours
3. **Download**: Updates download in background
4. **Install**: Updates install on app restart
5. **Notification**: User is notified of available updates

### Update Server Configuration

The update server is configured in `package.json`:

```json
{
  "publish": {
    "provider": "generic",
    "url": "https://releases.twostepsstudio.com/updates"
  }
}
```

### Update Server Structure

```
https://releases.twostepsstudio.com/updates/
├── latest.yml                 # Update metadata
└── Two Steps Studio-1.0.1-x64.exe  # Latest installer
```

### Manual Update Check

Users can manually check for updates in the app settings.

## File Structure

```
tss-website/
├── electron/
│   ├── main.js                 # Electron main process
│   └── preload.js              # Preload script (security bridge)
├── electron-builder-resources/ # Build resources
│   ├── icon.ico                # Windows icon
│   ├── icon.png                # Linux icon
│   ├── icon-16.png             # Small icon
│   ├── icon-32.png             # Medium icon
│   ├── icon-48.png             # Large icon
│   ├── icon-64.png             # Extra large icon
│   ├── icon-128.png            # Extra extra large icon
│   ├── LICENSE.txt             # Installer license
│   └── README.md               # Resources documentation
├── scripts/
│   └── generate-icons.js       # Icon generation script
├── src/
│   ├── types/
│   │   └── electron.d.ts       # TypeScript definitions
│   ├── hooks/
│   │   └── useElectron.ts      # React hooks for Electron
│   ├── components/Electron/
│   │   ├── OfflineBanner.tsx   # Offline status banner
│   │   ├── UpdateNotification.tsx  # Update notification dialog
│   │   └── NotificationManager.tsx # System notification manager
│   └── lib/api/
│       └── electron-api-wrapper.ts  # API wrapper with offline support
└── package.json                # Project configuration
```

## Configuration

### Electron Builder Configuration

Located in `package.json` under the `build` key:

```json
{
  "build": {
    "appId": "com.twostepsstudio.app",
    "productName": "Two Steps Studio",
    "directories": {
      "output": "dist-electron",
      "buildResources": "electron-builder-resources"
    },
    "win": {
      "target": ["nsis", "portable"],
      "icon": "electron-builder-resources/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

### NSIS Installer Options

- **oneClick**: false - Shows full installation wizard
- **allowToChangeInstallationDirectory**: true - Users can choose install location
- **createDesktopShortcut**: true - Creates desktop shortcut
- **createStartMenuShortcut**: true - Creates Start Menu shortcut
- **runAfterFinish**: true - Launches app after installation

### Next.js Configuration

The `next.config.ts` includes Electron-specific settings:

```typescript
const isElectron = process.env.ELECTRON === 'true';

const nextConfig: NextConfig = {
  assetPrefix: isElectron ? './' : undefined,
  images: {
    unoptimized: isElectron,
  },
};
```

## Troubleshooting

### Build Issues

#### Icon Generation Fails

**Problem**: Icon generation script fails

**Solution**:
```bash
# Install sharp manually
npm install sharp --save-dev

# Run generation script
npm run generate-icons
```

#### Build Fails with ASAR Errors

**Problem**: ASAR packaging fails

**Solution**: The configuration already unpacks problematic modules:
```json
{
  "asarUnpack": [
    "electron/**/*",
    "node_modules/**/{better-auth,bcrypt}/**/*"
  ]
}
```

### Runtime Issues

#### App Won't Start

**Problem**: App crashes on startup

**Solution**:
1. Check if Next.js server is starting (in production mode)
2. Verify port 3000 is available
3. Check logs in `electron/main.js`

#### Updates Not Working

**Problem**: Auto-updates don't work

**Solution**:
1. Verify update server URL is correct
2. Check `latest.yml` exists on server
3. Ensure installer is accessible
4. Test with: `npm run electron:release:win`

#### Offline Mode Issues

**Problem**: App doesn't work offline

**Solution**:
1. Check network detection in `main.js`
2. Verify API wrapper is handling offline state
3. Test with: `await window.electron.isOnline()`

### Development Issues

#### Hot Reload Not Working

**Problem**: Changes don't appear in Electron

**Solution**:
1. Ensure you're using `npm run electron:dev`
2. Check Next.js dev server is running
3. Try restarting the Electron app

#### TypeScript Errors

**Problem**: TypeScript errors with Electron APIs

**Solution**:
1. Ensure `src/types/electron.d.ts` exists
2. Check TypeScript configuration includes the types
3. Restart TypeScript server in your IDE

## Security Considerations

### Context Isolation

The app uses context isolation to prevent renderer process access to Node.js APIs directly.

### IPC Communication

All communication between main and renderer processes uses secure IPC handlers.

### Session Management

User sessions are stored locally and encrypted. Sessions are cleared on logout.

### Code Signing

For production releases, consider code signing:

1. Obtain a code signing certificate
2. Configure in `package.json`:
```json
{
  "win": {
    "certificateFile": "path/to/certificate.pfx",
    "certificatePassword": "password"
  }
}
```

## Performance Optimization

### Startup Time

- Next.js server starts in production mode
- Lazy loading of heavy modules
- Optimized asset loading

### Memory Usage

- ASAR packaging reduces file count
- Unpacked only necessary native modules
- Efficient IPC communication

### Bundle Size

- Next.js production build optimization
- Tree shaking of unused code
- Image optimization disabled in Electron (uses local files)

## Future Enhancements

### Planned Features

- [ ] Code signing for Windows
- [ ] Windows Store submission
- [ ] Background sync for offline changes
- [ ] Custom protocol handlers (tss://)
- [ ] File association support
- [ ] System tray integration
- [ ] Crash reporting (Sentry)
- [ ] Analytics integration

### Cross-Platform Support

While currently Windows-only, the architecture supports future Mac and Linux builds with minimal changes.

## Support

For issues or questions:

- **Email**: support@twostepsstudio.com
- **Documentation**: This guide
- **Issues**: GitHub repository

## License

See `electron-builder-resources/LICENSE.txt` for the application license.
