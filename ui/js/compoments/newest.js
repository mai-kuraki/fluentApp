import React from 'react';
import {Link} from 'react-router-dom';
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
        fetch(`${__REQUESTHOST}/api/personalized/newsong`, {
            method: 'GET',
        }).then((res) => {
            return res.json();
        }).then(data => {
            if(data.code == 200) {
                store.dispatch(Actions.setNewest(data.result || []));
            }
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
        return (
            <div className="newest">
                <div className="item-list">
                    {
                        newestList.map((data, k) => {
                            return(
                                <div key={k} className="song-itembox" onDoubleClick={this.id2Song.bind(this, data.id)}>
                                    <div className="cover"><img src={data.song.album.picUrl}/></div>
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