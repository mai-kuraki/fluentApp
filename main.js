const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const path = require('path');
const url = require('url');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);
const jsmediatags = require('jsmediatags');
const fs = require('fs');
const _ = require('underscore');
const btoa = require('btoa');

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

let songItem = [];
const extItem = ['MP3', 'WAV', 'APE ', 'AAC', 'FLAC', 'OGG', 'WMA'];

let scanningDir = (path, callback) => {
    fs.readdir(path, (err, files) => {
        let count = 0;
        let checkend = () => {
            ++count == files.length && callback()
        };
        if (err) {
            console.log('error:\n' + err);
            return;
        }
        files.map((file) => {
            fs.stat(path + '/' + file, (err, stat) => {
                if (err) {
                    console.log(err);
                    return;
                }
                if (stat.isDirectory()) {
                    scanningDir(path + '/' + file, checkend);
                } else {
                    let tpArr = file.split('.');
                    let ext = tpArr[tpArr.length - 1].toLocaleUpperCase();
                    if (_.indexOf(extItem, ext) > -1) {
                        songItem.push(`${path}/${file}`);
                    }
                    checkend();
                }
            });
        });
        files.length === 0 && callback();
    });
};

let saveDB = (e, data) => {
    db.set('playlist', data).write();
    e.sender.send('scanningEnd', data);
};

let getFileName = (path) => {
    let arr = [], name = '';
    if(path.indexOf('/') > -1) {
        arr = path.split('/');
    }else if(path.indexOf('\\') > -1) {
        arr = path.split('\\');
    }
    if(arr.length > 1) {
        name = arr[arr.length - 1];
    }
    return name;
};

ipcMain.on('scanningDirDialog', (e) => {
    dialog.showOpenDialog({
        title: '选择添加目录',
        properties: ['openDirectory'],
    }, (files) => {
        e.sender.send('barLoadingOpen');
        setTimeout(() => {
        files.map((dir) => {
            scanningDir(dir, () => {
                let playlist = db.get('playlist').value();
                let listItem = [];
                let f = 0;
                songItem.map((data, k) => {
                    let name = getFileName(data);
                    jsmediatags.read(data, {
                        onSuccess: (tag) => {
                            let image = tag.tags.picture;
                            let base64String = "";
                            image.data.map((d, j) => {
                                base64String += String.fromCharCode(d);
                            });
                            listItem.push({
                                name: name,
                                url: data,
                                size: tag.size,
                                album: tag.tags.album,
                                artist: tag.tags.artist,
                                cover: `data:${image.format};base64,${btoa(base64String)}`
                            });
                            f ++;
                            if(f == songItem.length) {
                                saveDB(e, listItem);
                            }
                        },
                        onError: (error) => {
                            listItem.push({
                                name: name,
                                url: data,
                                size: '',
                                album: '',
                                artist: '',
                                cover: ''
                            });
                            f ++;
                            if(f == songItem.length) {
                                saveDB(e, listItem);
                            }
                        }
                    });
                });
            });
        })
        }, 1000)
    })
});