/**
 * Created by maikuraki on 2017/11/4.
 */
import React from 'react';
import {BrowserRouter as Router, Route, Switch, Link} from 'react-router-dom';
// import {remote} from 'electron';
import eventEmitter from '../lib/eventEmitter';
import * as constStr from '../lib/const';
import * as Actions from '../actions';
import Home from './home';
import PlayDetail from './playDetail';
import ListDetail from './listDetail';
import AlbumDetail from './albumDetail';
import store from "../store";


export default class App extends React.Component {
    constructor() {
        super();
        this.state = {
            snackbar: false,
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

    componentDidMount() {
        this.audio = document.getElementById('audio');
        this.audio.addEventListener('durationchange', () => {
            this.durationchange();
        });
        this.audio.addEventListener('timeupdate', () => {
            this.timeupdate();
        });
        this.audio.addEventListener('ended', () => {
            // this.handlePlay();
            // this.handleNext();
        });
        eventEmitter.on(constStr.INITAUDIO, () => {
            this.initAudio();
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
        if(store.getState().main.UIPage) {
            eventEmitter.emit(constStr.PLAYPERCENT, playPercent);
        }
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
                    store.dispatch(Actions.setSongInfo(songData))
                }
            }
        })
    }

    initAudio() {
        let currentSong = store.getState().main.currentSong;
        this.getSongInfo(currentSong.id);
        let url = currentSong.url;
        if(!url){
            this.snackbarOpen('获取资源失败', 2000);
            return;
        }
        url = url.replace('http://m10.music.126.net', `${__REQUESTHOST}/proxy`);
        this.audio.crossOrigin = 'anonymous';
        this.audio.src = url;
        this.audio.play();
        store.dispatch(Actions.setPlayState(true));
    }

    initLocalAudio(data) {
        let url = data.url;
        this.audio.src = url;
        this.audio.play();
        store.dispatch(Actions.setSongInfo({
            name: data.name,
            al: {picUrl: data.cover},
            ar: [{name: data.artist}],
        }));
        store.dispatch(Actions.setPlayState(true));
    }

    switchPlay(state) {
        if(state) {
            this.audio.play();
        }else {
            this.audio.pause();
        }
        store.dispatch(Actions.setPlayState(state));
    }

    toUIPage() {
        store.dispatch(Actions.setPlayUiPage(true));
        setTimeout(() => {
            eventEmitter.emit(constStr.PLAYANIMATE);
        })
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
                    <PlayDetail/>
                    {
                        this.state.snackbar?
                            <div className="snackbar">{this.state.snackbarText}</div>:null
                    }
                    {
                        storeMain.UIPage?null:
                            <div className="fix-control">
                                <div className="play-bar">
                                    <div className="curBar" style={{width: state.playPercent * 100 + '%'}}></div>
                                </div>
                                <div className="cover" onClick={this.toUIPage.bind(this)}>
                                    <img src={songInfo.al.picUrl || __REQUESTHOST + '/defaultCover.png'}/>
                                </div>
                                <div className="info" onClick={this.toUIPage.bind(this)}>
                                    <div className="name">{songInfo.name || ''}</div>
                                    <div className="singer">{songInfo.ar[0].name || ''}</div>
                                </div>
                                <div className={`play-icon iconfont ${storeMain.playState?'icon-weibiaoti519':'icon-bofang2'}`} onClick={(e) => {
                                    this.switchPlay(!storeMain.playState);
                                }}></div>
                            </div>
                    }

                    <audio id="audio"></audio>
                    <Switch>
                        {
                            1 === 1?
                                <React.Fragment>
                                    <Route path="/listDetail/:id" component={ListDetail}/>
                                    <Route path="/albumDetail/:id" component={AlbumDetail}/>
                                    <Route path="/" component={Home}/>
                                </React.Fragment>:<React.Fragment>
                                    <Route path="/" component={AlbumDetail}/>
                                </React.Fragment>
                        }
                    </Switch>
                </div>
            </Router>
        )
    }
}