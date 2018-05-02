import React from 'react';
import {Link} from 'react-router-dom';
import SearchSingerDetail from './searchSingerDetail';
import LazyImg from 'lazy-img-react';
import store from '../store';
import * as Actions from '../actions';
import eventEmitter from "../lib/eventEmitter";
import * as constStr from "../lib/const";

export default class SingerSearch  extends React.Component {
    constructor() {
        super();
        this.state = {
            detailShow: false,
            curId: '',
        }
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

    goback() {
        this.setState({
            detailShow: false,
        })
    }

    render() {
        let data = this.props.data;
        let count = this.props.count;
        let currentSong = store.getState().main.currentSong || {};
        return (
            <div className="singer-item">
                {
                    this.state.detailShow?
                        <div className="singerlist-detail">
                            <SearchSingerDetail id={this.state.curId} goback={this.goback.bind(this)}/>
                        </div>:null
                }
                <div className="item-list">
                    {
                        data.map((data, k) => {
                            return(
                                <div key={k} className={`song-itembox ${currentSong.id == data.id?'song-itembox-active':''}`} onClick={() => {
                                    this.setState({
                                        curId: data.id,
                                        detailShow: true,
                                    })
                                }}>
                                    <div className="cover"><LazyImg src={(data.img1v1Url.indexOf('5639395138885805') > -1)?`${__REQUESTHOST}/defaultSinger.png`:data.img1v1Url} placeholder={__REQUESTHOST + '/placeholderCover.png'}/></div>
                                    <div className="info">
                                        <div className="name">{data.name}<i>{data.trans?`(${data.trans})`:''}</i></div>
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