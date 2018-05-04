const {app, BrowserWindow, ipcMain, Tray, Menu} = require('electron');
const path = require('path');
const url = require('url');
const child_process = require('child_process');

let win;

function createWindow() {
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
        },
        icon: path.join(__dirname, 'icon.ico')
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

    win.on('ready-to-show', function () {
        win.show();
    });

    win.setThumbarButtons([
        {
            tooltip: '上一曲',
            icon: path.join(__dirname, 'prev.png'),
            flags: [
                'nobackground'
            ],
            click: () => {
                win.webContents.send('pre');
            }
        },
        {
            tooltip: '播放',
            icon: path.join(__dirname, 'play.png'),
            flags: [
                'nobackground'
            ],
            click: () => {
                win.webContents.send('switch');
            }
        },
        {
            tooltip: '下一曲',
            icon: path.join(__dirname, 'next.png'),
            flags: [
                'nobackground'
            ],
            click: () => {
                win.webContents.send('next');
            }
        }
    ]);

    let tray = new Tray(path.join(__dirname, 'icon.ico'));
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Item1', type: 'radio'},
        {label: 'Item2', type: 'radio'},
        {label: 'Item3', type: 'radio', checked: true},
        {label: 'Item4', type: 'radio'}
    ]);
    tray.setToolTip('This is my application.');
    tray.setContextMenu(contextMenu);
}

app.setName('fluentApp');

const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
    if (win) {
        if (win.isMinimized()) win.restore();
        win.focus()
    }
});

if (isSecondInstance) {
    app.quit()
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('before-quit', () => {

});

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
});

ipcMain.on('scanningDir', (e, dirs) => {
    const cp = child_process.fork('./scanFile.js');
    cp.on('message', () => {
        e.sender.send('scanningEnd');
        cp.disconnect();
    });
    cp.send(dirs);
});

ipcMain.on('playSwitch', (e, state) => {
    console.log(state)
});


let handleStartupEvent = () => {
    let install = () => {
        let updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
        let target = path.basename(process.execPath);
        let child = child_process.spawn(updateDotExe, ["--createShortcut", target], {detached: true});
        child.on('close', (code) => {
            app.quit();
        });
    };
    let uninstall = () => {
        let updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
        let target = path.basename(process.execPath);
        let child = child_process.spawn(updateDotExe, ["--removeShortcut", target], {detached: true});
        child.on('close', (code) => {
            app.quit();
        });
    };

    if (process.platform !== 'win32') {
        return false;
    }

    let squirrelCommand = process.argv[1];

    switch (squirrelCommand) {
        case '--squirrel-install':
        case '--squirrel-updated':
            install();
            return true;
        case '--squirrel-uninstall':
            uninstall();
            app.quit();
            return true;
        case '--squirrel-obsolete':
            app.quit();
            return true;
    };

};

if (handleStartupEvent()) {
    return;
}