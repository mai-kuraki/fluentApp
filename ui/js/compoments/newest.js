import React from 'react';
import {Link} from 'react-router-dom';
import LazyImg from 'lazy-img-react';
import store from '../store';
import * as Actions from '../actions';
import eventEmitter from "../lib/eventEmitter";
import * as constStr from "../lib/const";

export default class Newest  extends React.Component {
    constructor() {
        super();
    }

    componentDidMount() {
        this.getNewest();
    }

    getNewest() {
        eventEmitter.emit(constStr.RINGLOADING, true);
        fetch(`${__REQUESTHOST}/api/personalized/newsong`, {
            method: 'GET',
        }).then((res) => {
            return res.json();
        }).then(data => {
            if(data.code == 200) {
                store.dispatch(Actions.setNewest(data.result || []));
            }
            eventEmitter.emit(constStr.RINGLOADING, false);
        })
    }

    id2Song(id) {
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
        })
    }

    render() {
        let newestList = store.getState().main.newestList || [];
        let currentSong = store.getState().main.currentSong || {};
        return (
            <div className="newest">
                <div className="item-list">
                    {
                        newestList.map((data, k) => {
                            return(
                                <div key={k} className={`song-itembox ${currentSong.id == data.id?'song-itembox-active':''}`} onDoubleClick={this.id2Song.bind(this, data.id)}>
                                    <div className="cover"><LazyImg src={data.song.album.picUrl} placeholder={__REQUESTHOST + '/placeholderCover.png'}/></div>
                                    <div className="info">
                                        <div className="name">{data.song.name}</div>
                                        <div className="singer">{data.song.artists[0].name}</div>
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