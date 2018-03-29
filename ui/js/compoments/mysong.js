import React from 'react';
import {remote, ipcRenderer} from 'electron';
import {Link} from 'react-router-dom';
import store from '../store';
import * as Actions from '../actions';
import BarLoading from './barLoading';
import eventEmitter from "../lib/eventEmitter";
import * as constStr from "../lib/const";
let low = remote.require('lowdb');
let FileSync = remote.require('lowdb/adapters/FileSync');
let adapter = new FileSync('db.json');
let db = low(adapter);


export default class Mysong extends React.Component {
    constructor() {
        super();
        this.state = {
            barLoading: false,
            playlist: [],
        }
    }

    componentWillMount() {
        let playlist = db.get('playlist').value();
        if(playlist && typeof playlist == 'object') {
            this.setState({
                playlist: playlist,
            })
        }
        ipcRenderer.on('barLoadingOpen', (e) => {
            this.barLoadingOpen();
        });
        ipcRenderer.on('scanningEnd', (e, data) => {
            this.barLoadingClose();
            this.setState({
                playlist: data,
            })
        });
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

    addFileDir() {
        ipcRenderer.send('scanningDirDialog');
    }

    playLocal(data) {
        eventEmitter.emit(constStr.INITLOCALAUDIO, data);
    }

    render() {
        let state = this.state;
        return (
            <div className="mysong">
                {
                    state.playlist.length  == 0?
                        <div className="mysong-empty">
                            {
                                state.barLoading ?
                                    <React.Fragment>
                                        <div className="loading"><BarLoading/></div>
                                        <div className="loading-text">音乐马上就到...</div>
                                    </React.Fragment> : null
                            }
                            <div className="tip">请添加本地音乐</div>
                            <div className="file-btn" onClick={this.addFileDir.bind(this)}>选择本地音乐文件夹</div>
                        </div>:null
                }
                <div className="item-list">
                    {
                        state.playlist.map((data, k) => {
                            return(
                                <div key={k} className="song-itembox" onDoubleClick={this.playLocal.bind(this, data)}>
                                    <div className="cover"><img src={data.cover || '/defaultCover.png'}/></div>
                                    <div className="info">
                                        <div className="name">{data.name}</div>
                                        <div className="singer"><i className="iconfont icon-computer_icon"></i>{data.artist || '未知'}-{data.album || '未知'}</div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}