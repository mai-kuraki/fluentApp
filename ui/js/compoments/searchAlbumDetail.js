import React from 'react';
import {Link} from 'react-router-dom';
import store from '../store';
import eventEmitter from '../lib/eventEmitter';
import * as constStr from '../lib/const';
import * as Actions from '../actions';

export default class SearchAlbumDetail extends React.Component {
    constructor() {
        super();
        this.state = {
            id: '38044027',
            album: {},
            songs: [],
            scrollState: false,
        }
    }

    componentWillMount() {
        let id = this.props.id;
        if(!id) return;
        this.setState({
            id: id,
        })
    }

    componentDidMount() {
        this.getListDetail();
    }

    getListDetail() {
        let id = this.state.id;
        eventEmitter.emit(constStr.RINGLOADING, true);
        fetch(`${__REQUESTHOST}/api/album?id=${id}`, {
            method: 'GET',
        }).then((res) => {
            return res.json();
        }).then(data => {
            if(data.code == 200) {
                this.setState({
                    songs: data.songs,
                    album: data.album,
                })
            }
            eventEmitter.emit(constStr.RINGLOADING, false);
        })
    }


    id2Song(id) {
        eventEmitter.emit(constStr.RINGLOADING, true);
        fetch(`${__REQUESTHOST}/api/music/url?id=${id}`, {
            method: 'GET',
        }).then((res) => {
            return res.json();
        }).then(data => {
            if(data.code == 200) {
                if(data.data.length > 0) {
                    store.dispatch(Actions.setCurrentSong(data.data[0]));
                    eventEmitter.emit(constStr.INITAUDIO);
                }
            }
            eventEmitter.emit(constStr.RINGLOADING, false);
        })
    }

    scroll(e) {
        let top = e.target.scrollTop;
        if(top > 200) {
            if(!this.state.scrollState) {
                this.setState({
                    scrollState: true,
                })
            }
        }else {
            if(this.state.scrollState) {
                this.setState({
                    scrollState: false,
                })
            }
        }
    }

    goBack() {
        this.props.goback();
    }

    saveToList() {
        let songs = this.state.songs;
        let item = [];
        eventEmitter.emit(constStr.RINGLOADING, true);
        songs.map((data, k) => {
            item.push({
                id: data.id,
                name: data.name || '',
                ar: data.ar[0].name || '',
                from: 'online'
            })
        });
        eventEmitter.emit(constStr.BATCHADD, item);
    }

    render() {
        let state = this.state;
        let songs = state.songs,
            album = state.album;
        let currentSong = store.getState().main.currentSong || {};
        return(
            <div className="listDetail-page">
                <div className={`windowsHead ${state.scrollState?'':'windowsHead-transparent'}`}>
                    <div className="back iconfont icon-fanhui" onClick={this.goBack.bind(this)}></div>
                    <div className="dragbar"></div>
                    <div className="btns">
                        <span className="iconfont icon-zuixiaohua3" onClick={() => {eventEmitter.emit(constStr.MINWINDOW)}}></span>
                        <span className="close iconfont icon-guanbi" onClick={() => {eventEmitter.emit(constStr.CLOSEWINDOW)}}></span>
                    </div>
                </div>
                <div className="wrap" onScroll={this.scroll.bind(this)}>
                    <div className="listCoverBanner">
                        <div className="play iconfont icon-tianjiaqiyedangan" onClick={this.saveToList.bind(this)}></div>
                        <div className="cover">
                            <img src={album.picUrl || ''} draggable={false}/>
                        </div>
                    </div>
                    <div className="listInfo">
                        <div className="name">{album.name || ''}</div>
                        <div className="desc">{album.company || ''}</div>
                    </div>
                    <div className="song-list">
                        {
                            songs.map((data, k) => {
                                return (
                                    <div className={`song ${currentSong.id == data.id?'song-active':''}`} key={k} onDoubleClick={this.id2Song.bind(this, data.id)}>
                                        <div className="key">{k + 1}</div>
                                        <div className="r">
                                            <div className="name">{data.name || ''}</div>
                                            <div className="singer">{data.ar[0].name || ''}</div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        )
    }
}