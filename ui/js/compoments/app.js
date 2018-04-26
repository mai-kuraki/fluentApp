/**
 * Created by maikuraki on 2017/11/4.
 */
import React from 'react';
import {BrowserRouter as Router, Route, Switch, Link, Redirect} from 'react-router-dom';
import {remote} from 'electron';
import eventEmitter from '../lib/eventEmitter';
import * as constStr from '../lib/const';
import * as Actions from '../actions';
import Home from './home';
import PlayDetail from './playDetail';
import ListDetail from './listDetail';
import AlbumDetail from './albumDetail';
import store from "../store";
import RingLoading from './ringLoading';
import Search from './search';
import Progressbar from "progressbar.js";
import shuffleArray from 'shuffle-array';

import db from './db';

const playOrderMap = [
    {icon: 'icon-list-loop',name: '列表循环'},
    {icon: 'icon-single-loop',name: '单曲循环'},
    {icon: 'icon-bofangye-caozuolan-suijibofang',name: '随机播放'}];
export default class App extends React.Component {
    constructor() {
        super();
        this.state = {
            loading: false,
            snackbar: false,
            playListState: false,
            snackbarText: '',
            playPercent: 0,
            audioDuration: 0,
            audioCurDuration: 0,
        };
    }

    snackbarOpen(text, dur) {
        clearTimeout(this.snackbarTimer);
        this.setState({
            snackbar: true,
            snackbarText: text,
        });
        this.snackbarTimer = setTimeout(() => {
            this.snackbarClose();
        }, dur || 2000)
    }

    snackbarClose() {
        this.setState({
            snackbar: false,
        });
    }

    loadingOpen() {
        this.setState({
            loading: true,
        });
    }

    loadingClose() {
        this.setState({
            loading: false,
        });
    }

    componentWillMount() {
        let volume = db.get('volume').value();
        let playOrder = db.get('playOrder').value() || 0;
        let playlist = db.get('playList').value() || [];
        let localPlayList = db.get('localPlayList').value() || [];
        if(volume) {
            volume = parseFloat(volume);
        }else {
            volume = 0.5;
        }
        store.dispatch(Actions.setVolume(volume));
        store.dispatch(Actions.setPlayOrder(playOrder));
        store.dispatch(Actions.setPlayList(playlist));
        store.dispatch(Actions.setLocalPlayList(localPlayList));
        if(playOrder == 2) {
            this.createShuffeList();
        }
    }

    componentDidMount() {
        this.audio = document.getElementById('audio');
        this.audio.addEventListener('durationchange', () => {
            this.durationchange();
        });
        this.audio.addEventListener('timeupdate', () => {
            this.timeupdate();
        });
        this.audio.addEventListener('ended', () => {
            this.playNext(1);
        });
        eventEmitter.on(constStr.NEXT, (type) => {
            this.playNext(type)
        });
        eventEmitter.on(constStr.BATCHADD, (item) => {
            this.batchAddToPlayList(item);
        });
        eventEmitter.on(constStr.INITAUDIO, (restore) => {
            this.initAudio(restore);
        });
        eventEmitter.on(constStr.INITLOCALAUDIO, (data) => {
            this.initLocalAudio(data);
        });
        eventEmitter.on(constStr.SNACKBAROPEN, (text, dur) => {
           this.snackbarOpen(text, dur);
        });
        eventEmitter.on(constStr.SWITCHPLAY, (state) => {
            this.switchPlay(state);
        });
        eventEmitter.on(constStr.RINGLOADING, (state) => {
            if(state) {
                this.loadingOpen();
            }else {
                this.loadingClose();
            }
        });
        eventEmitter.on(constStr.CREATESHUFFLE, () => {
           this.createShuffeList();
        });
        this.progress = new Progressbar.Circle('#progress', {
            strokeWidth: 2,
            trailWidth: 2,
            trailColor: 'rgba(102,102,102,0.2)',
            color: 'rgba(102,102,102, 1)',
        });
        let currentSongId = db.get('currentSongId').value();
        if(currentSongId) {
            this.restore(currentSongId);
        }
    }

    createShuffeList() {
        let playlist = db.get('playList').value() || [];
        let shuffleList = shuffleArray(playlist, {copy: true });
        store.dispatch(Actions.setShuffleList(shuffleList));
    }

    insertSongToShuffleList(item) {
        if(!item) return;
        let shuffleList = store.getState().main.shuffleList;
        let len = shuffleList.length;
        item.map((data, k) => {
            let insertPosition = Math.floor(len * Math.random());
            shuffleList = shuffleList.splice(insertPosition, 0, data);
        });
        store.dispatch(Actions.setShuffleList(shuffleList));
    }

    id2Song(id, restore) {
        eventEmitter.emit(constStr.RINGLOADING, true);
        fetch(`${__REQUESTHOST}/api/music/url?id=${id}`, {
            method: 'GET',
        }).then((res) => {
            return res.json();
        }).then(data => {
            if(data.code == 200) {
                if(data.data.length > 0) {
                    store.dispatch(Actions.setCurrentSong(data.data[0]));
                    eventEmitter.emit(constStr.INITAUDIO, restore);
                }
            }
            eventEmitter.emit(constStr.RINGLOADING, false);
        })
    }

    restore(id) {
        let playList = store.getState().main.playList;
        let curSong = {};
        playList.map((data, k) => {
            if(data.id == id) {
                curSong = data;
            }
        });
        if(curSong.from == 'online') {
            this.id2Song(curSong.id, true);
        }else if(curSong.from == 'local') {
            let localPlayList = store.getState().main.localPlayList || [];
            localPlayList.map((data, k) => {
                if(data.id == curSong.id) {
                    this.initLocalAudio(data, true);
                }
            })
        }
        let currentTime = db.get('currentTime').value() || 0;
        if(currentTime > 0) {
            this.audio.currentTime = currentTime;
            this.timeupdate();
        }
    }

    playNext(type) {
        let storeMain = store.getState().main;
        let playOrder = storeMain.playOrder,
            playList = storeMain.playList,
            shuffleList = storeMain.shuffleList,
            currentSong = storeMain.currentSong,
            nextIndex = 0,
            curIndex = 0,
            nextSong;
        if(playList.length == 0) {
            this.resetPlayer();
            return;
        }
        if(playOrder < 2) {
            playList.map((data, k) => {
                if(data.id == currentSong.id) {
                    curIndex = k;
                }
            });
        }else {
            shuffleList.map((data, k) => {
                if(data.id == currentSong.id) {
                    curIndex = k;
                }
            });
        }

        if(playOrder == 0 || playOrder == 2) {
            nextIndex = curIndex + type;
            if(nextIndex < 0) {
                nextIndex = playList.length - 1;
            }else if(nextIndex == playList.length) {
                nextIndex = 0;
            }
        }else if(playOrder == 1) {
            nextIndex = curIndex;
        }
        if(playOrder < 2) {
            nextSong = playList[nextIndex];
        }else {
            nextSong = shuffleList[nextIndex];
        }
        if(nextSong.from == 'online') {
            this.id2Song(nextSong.id);
        }else if(nextSong.from == 'local') {
            let localPlayList = store.getState().main.localPlayList || [];
            localPlayList.map((data, k) => {
                if(data.id == nextSong.id) {
                    this.initLocalAudio(data);
                }
            })
        }
    }

    resetPlayer() {
        store.dispatch(Actions.setCurrentSong({}));
        store.dispatch(Actions.setSongInfo({}));
        store.dispatch(Actions.setPlayState(false));
        this.audio.src = 'null';
    }

    durationchange() {
        let audioDuration = this.audio.duration;
        this.setState({
            audioDuration: audioDuration,
        });
    }

    timeupdate() {
        let currentTime = this.audio.currentTime;
        let audioDuration = this.state.audioDuration;
        let playPercent = currentTime / audioDuration;
        this.setState({
            playPercent: playPercent,
            audioCurDuration: currentTime,
        });
        this.progress.animate(playPercent);
        if(store.getState().main.UIPage) {
            eventEmitter.emit(constStr.PLAYPERCENT);
        }
    }

    batchAddToPlayList(item) {
        let playList = store.getState().main.playList || [];
        let addItem = [];
        item.map((data, k) => {
            let repeat = false;
            playList.map((d, j) => {
                if(data.id == d.id) {
                    repeat = true;
                }
            });
            if(!repeat) {
                addItem.push(data);
            }
        });
        playList = addItem.concat(playList);
        store.dispatch(Actions.setPlayList(playList));
        setTimeout(() => {
            this.savePlayList();
            eventEmitter.emit(constStr.RINGLOADING, false);
            eventEmitter.emit(constStr.SNACKBAROPEN, '添加成功!');
            if(store.getState().main.shuffleList.length > 0) {
                this.insertSongToShuffleList(addItem)
            }else {
                this.createShuffeList();
            }
        });
    }

    savePlayList() {
        let playList = store.getState().main.playList || [];
        db.set('playList', playList).write();
    }

    getSongInfo(id) {
        fetch(`${__REQUESTHOST}/api/song/detail?ids=${id}`, {
            method: 'GET',
        }).then((res) => {
            return res.json();
        }).then(data => {
            if(data.code == 200) {
                let songData = {};
                if(data.songs.length > 0) {
                    songData = data.songs[0];
                    store.dispatch(Actions.setSongInfo(songData));
                    if(songData.name && songData.ar[0].name) {
                        let playList = store.getState().main.playList || [];
                        let songObj = {
                            id: id,
                            name: songData.name || '',
                            ar: songData.ar[0].name || '',
                            from: 'online',
                        };
                        let hasRepeat = false;
                        playList.map((d,k) => {
                            if(d.id && d.id == songObj.id) {
                                hasRepeat = true;
                            }
                        });
                        if(!hasRepeat) {
                            playList.unshift(songObj);
                            store.dispatch(Actions.setPlayList(playList));
                            setTimeout(() => {
                                this.savePlayList();
                                if(store.getState().main.shuffleList.length > 0) {
                                    this.insertSongToShuffleList(songObj)
                                }
                            })
                        }
                    }
                }
            }
        })
    }

    initAudio(restore) {
        let currentSong = store.getState().main.currentSong;
        let url = currentSong.url;
        if(!url){
            this.snackbarOpen('获取资源失败', 2000);
            return;
        }
        this.getSongInfo(currentSong.id);
        url = url.replace('http://m10.music.126.net', `${__REQUESTHOST}/proxy`);
        this.audio.crossOrigin = 'anonymous';
        this.audio.src = url;
        if(!restore) {
            this.audio.currentTime = 0;
            this.audio.play();
            store.dispatch(Actions.setPlayState(true));
        }
    }

    initLocalAudio(data, restore) {
        let url = data.url;
        this.audio.src = url;
        let o = {
            id: data.id,
            name: data.name,
            al: {picUrl: data.cover},
            ar: [{name: data.artist}],
        };
        store.dispatch(Actions.setSongInfo(o));
        store.dispatch(Actions.setCurrentSong(o));
        if(!restore) {
            this.audio.currentTime = 0;
            this.audio.play();
            store.dispatch(Actions.setPlayState(true));
            let playList = store.getState().main.playList || [];
            let songObj = {
                id: data.id,
                name: data.name || '',
                ar: data.artist || '',
                from: 'local',
            };
            let hasRepeat = false;
            playList.map((d,k) => {
                if(d.id && d.id == songObj.id) {
                    hasRepeat = true;
                }
            });
            if(!hasRepeat) {
                playList.unshift(songObj);
                store.dispatch(Actions.setPlayList(playList));
                setTimeout(() => {
                    this.savePlayList();
                    if(store.getState().main.shuffleList.length > 0) {
                        this.insertSongToShuffleList(songObj)
                    }
                })
            }
        }
    }

    switchPlay(state) {
        if(this.audio && this.audio.src && this.audio.src.indexOf('/null') == -1) {
            if(state) {
                this.audio.play();
            }else {
                this.audio.pause();
            }
            store.dispatch(Actions.setPlayState(state));
        }
    }

    toUIPage() {
        store.dispatch(Actions.setPlayUiPage(true));
        setTimeout(() => {
            eventEmitter.emit(constStr.UPDATETIMEPERCENT);
            eventEmitter.emit(constStr.PLAYANIMATE);
        })
    }

    targetingCur() {
        let curPlayRow = document.getElementsByClassName('row-playing');
        if(curPlayRow.length > 0) {
            curPlayRow = curPlayRow[0];
            let top = curPlayRow.offsetTop - 40 * 5;
            if(top < 0) {
                top = 0;
            }
            this.refs.songListItem.scrollTop = top;
        }
    }

    listToPlay(data) {
        if(data.from == 'local') {
            let localPlayList = store.getState().main.localPlayList || [];
            localPlayList.map((song, k) => {
                if(data.id == song.id) {
                    this.initLocalAudio(song);
                }
            })
        }else if(data.from == 'online') {
            this.id2Song(data.id);
        }
    }

    delList(id, key) {
        let playList = store.getState().main.playList || [];
        if(id === 'all') {
            playList = [];
        }else {
            if(playList[key].id == id) {
                playList.splice(key, 1);
            }
        }
        store.dispatch(Actions.setPlayList(playList));
        setTimeout(() => {
            this.savePlayList();
            this.playNext(1);
        });
    }

    render() {
        let state = this.state;
        let storeMain = store.getState().main;
        let songInfo = storeMain.songInfo;
        if(!songInfo.hasOwnProperty('al')) {
            songInfo.al = {};
        }
        if(!songInfo.hasOwnProperty('ar')) {
            songInfo.ar = [{}];
        }
        return (
            <Router>
                <div className="player-wrap">
                    {
                        state.loading?
                            <div className="ringLoadinf-wrap">
                                <RingLoading/>
                            </div>:null
                    }
                    <PlayDetail/>
                    {
                        this.state.snackbar?
                            <div className="snackbar">{this.state.snackbarText}</div>:null
                    }
                    <div className={`play-list-dialog ${state.playListState?'play-list-dialog-active':''}`}>
                        <div className={`mask ${state.playListState?'mask-active':''}`} onClick={() => {
                            this.setState({
                                playListState: false,
                            })
                        }}></div>
                        <div className={`list-wrap ${state.playListState?'list-wrap-active':''}`}>
                            <div className="list-wrap-head">
                                <div className="label" onClick={() => {eventEmitter.emit(constStr.SWITCHORDER)}}><i className={`iconfont ${playOrderMap[storeMain.playOrder].icon}`}></i>{playOrderMap[storeMain.playOrder].name} ({storeMain.playList.length || 0})</div>
                                <div className="clear iconfont icon-shanchu" onClick={this.delList.bind(this, 'all')}></div>
                            </div>
                            <div className="list-item" ref="songListItem">
                                {
                                    storeMain.playList.map((data, k) => {
                                        return (
                                            <div className={`${storeMain.currentSong.id == data.id?'row-playing':''} row`} key={k} onDoubleClick={this.listToPlay.bind(this, data)}>
                                                <div className="info">{data.name}<span> - {data.ar}</span></div>
                                                <span className="del iconfont icon-guanbi" onClick={this.delList.bind(this, data.id, k)}></span>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                    <div className={`fix-control ${storeMain.UIPage?'':'fix-control-active'}`}>
                        {
                            1 === 2?
                                <div className="play-bar">
                                    <div className="curBar" style={{width: state.playPercent * 100 + '%'}}></div>
                                </div>:null
                        }
                        <div className="cover" onClick={this.toUIPage.bind(this)}>
                            <img src={songInfo.al.picUrl || __REQUESTHOST + '/defaultCover.png'}/>
                        </div>
                        <div className="info" onClick={this.toUIPage.bind(this)}>
                            <div className="name">{songInfo.name || ''}</div>
                            <div className="singer">{songInfo.ar[0].name || ''}</div>
                        </div>
                        <div className={`play-icon`} onClick={(e) => {
                            this.switchPlay(!storeMain.playState);
                        }}>
                            <div className={`icon iconfont ${storeMain.playState?'icon-weibiaoti519':'icon-bofang2'}`}></div>
                            <div className="progress" id="progress"></div>
                        </div>
                        <div className="play-list iconfont icon-liebiao" onClick={() => {
                            this.targetingCur();
                            this.setState({
                                playListState: true,
                            })
                        }}></div>
                    </div>
                    <audio id="audio"></audio>
                    <Switch>
                        {
                            1 === 1?
                                <React.Fragment>
                                    <Route path="/search" component={Search}/>
                                    <Route path="/listDetail/:id" component={ListDetail}/>
                                    <Route path="/albumDetail/:id" component={AlbumDetail}/>
                                    <Route path="/home" component={Home}/>
                                    <Route path="/" component={Home}/>
                                </React.Fragment>:<React.Fragment>
                                    <Route path="/" component={Search}/>
                                </React.Fragment>
                        }
                    </Switch>
                </div>
            </Router>
        )
    }
}