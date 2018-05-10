import React from 'react';
import {Link} from 'react-router-dom';
import {remote, ipcRenderer} from 'electron';
import Swiper from 'swiper';
import Recommend from './recommend';
import Newest from './newest';
import Album from './ablum';
import Mysong from './mysong';
import BarLoading from './barLoading';
import Moment from 'moment'
import eventEmitter from '../lib/eventEmitter';
import store from '../store';
import * as Actions from '../actions';
import _ from 'underscore';
import * as constStr from "../lib/const";

import db from './db';


export default class Home extends React.Component {
    constructor() {
        super();
        this.state = {
            barLoading: false,
            activeTab: 0,
            addedDir: [],
            addFileDialog: false,
            recommendLoad: false,
            newestLoad: false,
            albumLoad: false,
            tabs: [
                {id: 0, name: '推荐歌单'},
                {id: 1, name: '最新单曲'},
                {id: 2, name: '新碟上架'},
                {id: 3, name: '本地歌曲'},
            ]
        }
    }

    barLoadingOpen() {
        this.setState({
            barLoading: true,
        })
    }

    barLoadingClose() {
        this.setState({
            barLoading: false,
        })
    }

    addFileDialogOpen() {
        this.setState({
            addFileDialog: true,
        })
    }

    addFileDialogClose() {
        this.setState({
            addFileDialog: false,
        })
    }

    getAddedDir() {
        let dirs = db.get('addedDir').value() || [];
        this.setState({
            addedDir: dirs,
        })
    }

    componentWillMount() {
        let catchTimestamp = db.get('catchTimestamp').value() || 0;
        let albumOffsetCatch = db.get('albumOffsetCatch').value() || 0;
        let albumTotalCatch = db.get('albumTotalCatch').value() || 0;
        let now = new Date().getTime();
        /**
         * 首页数据一天一更新,载入后先判断缓存的数据是否在当天如果不在了再去获取更新
         */
        if(Moment(catchTimestamp).isSame(now, 'day')) {
            let recommendList = store.getState().main.recommendList || [],
                newestList = store.getState().main.newestList || [],
                albumList = store.getState().main.albumList || [];
            let recommendLoad = false,
                newestLoad = false,
                albumLoad = false;
            if(recommendList.length > 0) {
                recommendLoad = true;
            }
            if(newestList.length > 0) {
                newestLoad = true;
            }
            if(albumList.length > 0) {
                albumLoad = true;
                setTimeout(() => {
                    this.refs.album.setState({
                        offset: albumOffsetCatch,
                        total: albumTotalCatch,
                    });
                }, 500)
            }
            this.setState({
                recommendLoad: recommendLoad,
                newestLoad: newestLoad,
                albumLoad: albumLoad,
            });
            setTimeout(() => {
                this.initList();
            }, 300);
        }else {
            setTimeout(() => {
                this.initList();
            }, 500);
        }
    }

    catchData() {
        let vol = store.getState().main.volume;
        let playOrder = store.getState().main.playOrder;
        let currentSongId = store.getState().main.currentSong.id || '';
        let currentTime = document.getElementById('audio').currentTime;
        db.set('volume', vol).write();
        db.set('playOrder', playOrder).write();
        db.set('currentSongId', currentSongId).write();
        db.set('currentTime', currentTime).write();
        let recommendList = store.getState().main.recommendList || [];
        let newestList = store.getState().main.newestList || [];
        let albumList = store.getState().main.albumList || [];
        let albumTotal = this.refs.album.state.total;
        let albumOffset = this.refs.album.state.offset;
        let catchTimestamp = new Date().getTime();
        db.set('recommendCatch', recommendList).write();
        db.set('newestCatch', newestList).write();
        db.set('albumCatch', albumList).write();
        db.set('albumOffsetCatch', albumOffset).write();
        db.set('albumTotalCatch', albumTotal).write();
        db.set('catchTimestamp', catchTimestamp).write();
    }

    closeWindow() {
        this.catchData();
        remote.getCurrentWindow().close();
    }

    minWindow() {
        remote.getCurrentWindow().minimize();
    }

    initList() {
        let activeTab = this.state.activeTab;
        if(activeTab == 0 && !this.state.recommendLoad) {
            this.refs.recommend.getRecommend();
            this.setState({
                recommendLoad: true,
            });
        }else if(activeTab == 1 && !this.state.newestLoad) {
            this.refs.newest.getNewest();
            this.setState({
                newestLoad: true,
            });
        }else if(activeTab == 2 && !this.state.albumLoad) {
            this.refs.album.getAlbum();
            this.setState({
                albumLoad: true,
            });
        }
    }

    componentDidMount() {
        eventEmitter.on(constStr.OPENFILEDIALOG, () => {
            this.addFileDialogOpen();
        });
        eventEmitter.on(constStr.BARLOADING, (state) => {
           if(state) {
               this.barLoadingOpen();
           }else {
               this.barLoadingClose();
           }
        });
        eventEmitter.on(constStr.CLOSEWINDOW, () => {
            this.closeWindow();
        });
        eventEmitter.on(constStr.MINWINDOW, () => {
            this.minWindow();
        });
        ipcRenderer.on('barLoadingOpen', (e) => {
            eventEmitter.emit(constStr.BARLOADING, true);
        });
        this.mySwiper = new Swiper('.home-tab-wrapper', {
            on:{
                transitionEnd: () => {
                    this.setState({
                        activeTab: this.mySwiper.activeIndex
                    });
                    setTimeout(() => {
                        this.initList();
                    })
                },
            },
        });
        this.getAddedDir();
    }

    switchTab(index) {
        this.mySwiper.slideTo(index);
        this.setState({
            activeTab: index,
        })
    }

    fileDialogOpen() {
        remote.dialog.showOpenDialog({
            title: '选择添加目录',
            properties: ['openDirectory', 'multiSelections'],
        }, (files) => {
            if(!files) return;
            let addedDir = this.state.addedDir;
            files.map((dir) => {
                let f = false;
                addedDir.map((d) => {
                    if(d.path == dir) {
                        f = true;
                    }
                });
                if(!f) {
                    addedDir.push({
                        path: dir,
                        checked: false,
                    });
                }
            });
            this.setState({
                addedDir: addedDir,
            });
        })
    }

    scan() {
        this.addFileDialogClose();
        this.barLoadingOpen();
        eventEmitter.emit(constStr.SONGLOADING, true);
        setTimeout(() => {
            let addedDir = this.state.addedDir;
            ipcRenderer.send('scanningDir', addedDir);
        }, 800);
    }

    render() {
        let state = this.state;
        return(
            <div className="home-page">
                <div className="windowsHead">
                    <Link to="/search"><div className="back search iconfont icon-sousuo1"></div></Link>
                    <div className="dragbar"></div>
                    <div className="btns">
                        <span className="iconfont icon-zuixiaohua3" onClick={this.minWindow.bind(this)}></span>
                        <span className="close iconfont icon-guanbi" onClick={this.closeWindow.bind(this)}></span>
                    </div>
                </div>
                {
                    state.addFileDialog?
                        <div className="addfile-dialog">
                            <div className="mask"></div>
                            <div className="content">
                                <div className="head"><label>选择本地音乐文件夹</label><span className="iconfont icon-guanbi" onClick={this.addFileDialogClose.bind(this)}></span></div>
                                <div className="list">
                                    {
                                        state.addedDir.map((data, k) => {
                                            return (
                                                <div className="row" key={k} onClick={(e) => {
                                                    data.checked = !data.checked;
                                                    this.setState({
                                                        addedDir: state.addedDir,
                                                    });
                                                }}>
                                                    <div className={`checkbox iconfont ${data.checked?'icon-fuxuankuang checked':'icon-iconfonticonfontsquare'}`}></div>
                                                    <span>{data.path}</span>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                                <div className="opts">
                                    <div className="btn confirm" onClick={this.scan.bind(this)}>确认</div>
                                    <div className="btn" onClick={this.fileDialogOpen.bind(this)}>添加文件夹</div>
                                </div>
                            </div>
                        </div>:null
                }
                <div className="home-tab">
                    {
                        state.tabs.map((data, k) => {
                            return(
                                <div key={k} className={`tab ${state.activeTab == data.id?'cur':''}`} onClick={this.switchTab.bind(this, data.id)}>{data.name}</div>
                            )
                        })
                    }
                </div>
                {
                    state.barLoading?
                        <div className="barloading"><BarLoading/></div>:null
                }
                <div className="home-tab-wrapper">
                    <div className="swiper-wrapper">
                        <div className="swiper-slide"><Recommend ref="recommend" active={state.activeTab}/></div>
                        <div className="swiper-slide"><Newest ref="newest" active={state.activeTab}/></div>
                        <div className="swiper-slide"><Album ref="album" active={state.activeTab}/></div>
                        <div className="swiper-slide"><Mysong ref="mysong" active={state.activeTab}/></div>
                    </div>
                </div>
            </div>
        )
    }
}