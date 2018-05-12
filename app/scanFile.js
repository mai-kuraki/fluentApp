const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const adapter = new FileAsync('db.json');
const db = low(adapter);
const jsmediatags = require('jsmediatags');
const fs = require('fs');
const _ = require('underscore');
const btoa = require('btoa');
const path = require('path');

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
    db.then(db => {
        let playList = db.get('playList').value();
        let newList = [];
        playList.map((d, k) => {
           if(d.from != 'local') {
               newList.push(d);
           }
        });
        db.set('playList', newList).write();
        db.set('localPlayList', data).write().then(() => {
            process.send('');
        })
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

let createRandomId = () => {
    return (Math.random()*10000000).toString(16).substr(0,4)+'-'+(new Date()).getTime()+'-'+Math.random().toString().substr(2,5);
};

let getUniqueId = () => {
    return Math.random().toString(36).substr(3);
};

let done = (f, obj, listItem) => {
    listItem.push(obj);
    if(f == songItem.length) {
        saveDB(listItem);
    }
};

process.on('message', (dirs) => {
    db.then(db => {
        db.set('addedDir', dirs).write();
    });
    if(dirs.length == 0) {
        process.send('');
        return;
    }
    let len = 0, hasChecked = false;

    if(!fs.existsSync('cache')) {
        fs.mkdirSync('cache');
    }
    if(!fs.existsSync('cache/albumCover')) {
        fs.mkdirSync('cache/albumCover');
    }else {
        let covers = fs.readdirSync('cache/albumCover');
        covers.forEach(function(file) {
            let curPath = `cache/albumCover/${file}`;
            fs.unlinkSync(curPath);
        });
    }
    let listItem = [];
    dirs.map((dir) => {
        if(dir.checked) {
            hasChecked = true;
            len ++;
            scanningDir(dir.path, () => {
                let f = 0;
                len --;
                if(len == 0) {
                    songItem.map((data, k) => {
                        let name = getFileName(data);
                        jsmediatags.read(data, {
                            onSuccess: (tag) => {
                                let image = tag.tags.picture;
                                f ++;
                                if(typeof image === 'object') {
                                    let filename = `cache/albumCover/${createRandomId()}.jpeg`;
                                    let base64String = "";
                                    image.data.map((d, j) => {
                                        base64String += String.fromCharCode(d);
                                    });
                                    let dataBuffer = new Buffer(btoa(base64String), 'base64');
                                    fs.writeFile(filename, dataBuffer, (err) => {
                                        if(err) {
                                            filename = '';
                                        }
                                        done(f, {
                                            id: getUniqueId(),
                                            name: name,
                                            url: data,
                                            size: tag.size,
                                            album: tag.tags.album,
                                            artist: tag.tags.artist,
                                            cover: `./${filename}`
                                            // cover: path.join(__dirname, filename),
                                        }, listItem);
                                    });
                                }else {
                                    done(f, {
                                        id: getUniqueId(),
                                        name: name,
                                        url: data,
                                        size: tag.size,
                                        album: tag.tags.album,
                                        artist: tag.tags.artist,
                                        cover: ``
                                    }, listItem);
                                }
                            },
                            onError: (error) => {
                                f ++;
                                done(f, {
                                    id: getUniqueId(),
                                    name: name,
                                    url: data,
                                    size: '',
                                    album: '',
                                    artist: '',
                                    cover: ''
                                }, listItem);
                            }
                        });
                    });
                }
            });
        }
    });
    if(!hasChecked) {
        saveDB(listItem);
    }
});