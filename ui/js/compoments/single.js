import React from 'react';
import {Link} from 'react-router-dom';
import LazyImg from 'lazy-img-react';
import store from '../store';
import * as Actions from '../actions';
import eventEmitter from "../lib/eventEmitter";
import * as constStr from "../lib/const";

export default class Single  extends React.Component {
    constructor() {
        super();
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
        let data = this.props.data;
        let count = this.props.count;
        let currentSong = store.getState().main.currentSong || {};
        return (
            <div className="single-item">
                <div className="item-list">
                    {
                        data.map((data, k) => {
                            return(
                                <div key={k} className={`song-itembox ${currentSong.id == data.id?'song-itembox-active':''}`} onDoubleClick={this.id2Song.bind(this, data.id)}>
                                    <div className="cover"><LazyImg src={(data.album.artist.img1v1Url.indexOf('5639395138885805') > -1)?`${__REQUESTHOST}/defaultSinger.png`:data.album.artist.img1v1Url} placeholder={__REQUESTHOST + '/placeholderCover.png'}/></div>
                                    <div className="info">
                                        <div className="name">{data.name}</div>
                                        <div className="singer">{data.artists[0].name}</div>
                                    </div>
                                </div>
                            )
                        })
                    }
                    {
                        data.length < count?
                            <div className="loadingmore iconfont icon-fanhui-copy" onClick={() => {this.props.load()}}>
                            </div>:null
                    }
                    {
                        (data.length == count && data.length > 0)?
                            <div className="loadingend">没有了~~</div>:null
                    }
                    {
                        data.length == 0?
                            <div className="loadingempty">
                                <span className="iconfont icon-wujilu"></span>
                                <p>~空空如也~</p>
                            </div>:null
                    }
                </div>
            </div>
        )
    }
}