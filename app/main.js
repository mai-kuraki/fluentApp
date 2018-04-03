const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const path = require('path');
const url = require('url');
const child_process = require('child_process');

let win;

function createWindow () {
    win = new BrowserWindow({
        frame: false,
        width: 800,
        height: 670,
        transparent: true,
        resizable: false,
        maximizable: false,
        backgroundColor: '#00FFFFFF',
        webPreferences: {
            nodeIntegrationInWorker: true
        }
    });

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'app.html'),
        protocol: 'file:',
        slashes: true
    }));

    win.webContents.openDevTools();

    win.on('closed', () => {
        win = null;
    });

    win.on('ready-to-show',function() {
        win.show();
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
});

ipcMain.on('scanningDir', (e, dirs) => {
    const cp = child_process.fork('app/scanFile.js');
    cp.on('message', () => {
        e.sender.send('scanningEnd');
        cp.disconnect();
    });
    cp.send(dirs);
});