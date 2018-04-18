import React from 'react';
import {Link} from 'react-router-dom';
import {remote, ipcRenderer} from 'electron';
import Swiper from 'swiper';
import Recommend from './recommend';
import Newest from './newest';
import Album from './ablum';
import Mysong from './mysong';
import BarLoading from './barLoading';
import eventEmitter from '../lib/eventEmitter';
import store from '../store';
import * as Actions from '../actions';
import _ from 'underscore';
import * as constStr from "../lib/const";

const low = remote.require('lowdb');
const FileSync = remote.require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);


export default class Home extends React.Component {
    constructor() {
        super();
        this.state = {
            barLoading: false,
            activeTab: 0,
            addedDir: [],
            addFileDialog: false,
            tabs: [
                {id: 0, name: '推荐歌单'},
                {id: 1, name: '最新单曲'},
                {id: 2, name: '推荐专辑'},
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

    closeWindow() {
        let vol = store.getState().main.volume;
        let playOrder = store.getState().main.playOrder;
        db.set('volume', vol).write();
        db.set('playOrder', playOrder).write();
        remote.getCurrentWindow().close();
    }

    minWindow() {
        remote.getCurrentWindow().minimize();
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
                        <div className="swiper-slide"><Recommend/></div>
                        <div className="swiper-slide"><Newest/></div>
                        <div className="swiper-slide"><Album/></div>
                        <div className="swiper-slide"><Mysong/></div>
                    </div>
                </div>
            </div>
        )
    }
}