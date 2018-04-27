import React from 'react';
import {remote, ipcRenderer} from 'electron';
import {Link} from 'react-router-dom';
import LazyImg from 'lazy-img-react';
import store from '../store';
import * as Actions from '../actions';
import eventEmitter from "../lib/eventEmitter";
import * as constStr from "../lib/const";
import db from './db';


export default class Mysong extends React.Component {
    constructor() {
        super();
        this.state = {
            barLoading: false,
            playlist: [],
        }
    }

    getListData() {
        let playlist = db.read().get('localPlayList').value();
        if(playlist && typeof playlist == 'object') {
            this.setState({
                playlist: playlist,
            })
        }
    }

    componentWillMount() {
        this.getListData();
        eventEmitter.on(constStr.SONGLOADING, (state) => {
            this.setState({
                barLoading: state,
            });
        });
        ipcRenderer.on('scanningEnd', (e) => {
            eventEmitter.emit(constStr.BARLOADING, false);
            this.setState({
                barLoading: false,
            });
            this.getListData();
        });
    }


    addFileDir() {
        eventEmitter.emit(constStr.OPENFILEDIALOG);
    }

    playLocal(data) {
        eventEmitter.emit(constStr.INITLOCALAUDIO, data);
    }

    render() {
        let state = this.state;
        let currentSong = store.getState().main.currentSong || {};
        return (
            <div className="mysong">
                {
                    state.playlist.length  == 0?
                        <div className="mysong-empty">
                            {
                                state.barLoading ?
                                    <div className="loading-text">音乐扫描中...</div> : null
                            }
                            <div className="tip">请添加本地音乐</div>
                            <div className="file-btn" onClick={this.addFileDir.bind(this)}>选择本地音乐文件夹</div>
                        </div>:null
                }
                {
                    state.playlist.length > 0?
                        <div className="item-list">
                            <div className="list-head">
                                <div className="label">本地音乐<i>{state.playlist.length}首音乐</i></div>
                                <div className="adddir" onClick={this.addFileDir.bind(this)}>选择目录</div>
                            </div>
                            {
                                state.playlist.map((data, k) => {
                                    return(
                                        <div key={k} className={`song-itembox ${currentSong.id == data.id?'song-itembox-active':''}`} onDoubleClick={this.playLocal.bind(this, data)}>
                                            <div className="cover"><LazyImg src={data.cover || '/defaultCover.png'} placeholder={__REQUESTHOST + '/placeholderCover.png'}/></div>
                                            <div className="info">
                                                <div className="name">{data.name}</div>
                                                <div className="singer"><i className="iconfont icon-computer_icon"></i>{data.artist || '未知'}-{data.album || '未知'}</div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>:null
                }
            </div>
        )
    }
}