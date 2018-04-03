const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);
const jsmediatags = require('jsmediatags');
const fs = require('fs');
const _ = require('underscore');
const btoa = require('btoa');

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

let saveDB = (data) => {
    db.set('playlist', data).write().then(() => {
        songItem = [];
        process.send('');
    });
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

process.on('message', (dirs) => {
    db.set('addedDir', dirs).write();
    if(dirs.length == 0) {
        process.send('');
        return;
    }
    let len = 0, hasChecked = false;
    dirs.map((dir) => {
        if(dir.checked) {
            hasChecked = true;
            len ++;
            scanningDir(dir.path, () => {
                let f = 0;
                len --;
                if(len == 0) {
                    let listItem = [];
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
                                    saveDB(listItem);
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
                                    saveDB(listItem);
                                }
                            }
                        });
                    });
                }
            });
        }
    });
    if(!hasChecked) {
        process.send('');
    }
});