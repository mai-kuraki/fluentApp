import React from 'react';
import {Link} from 'react-router-dom';
import LazyImg from 'lazy-img-react';
import store from '../store';
import * as Actions from '../actions';
import * as constStr from "../lib/const";
import eventEmitter from "../lib/eventEmitter";

export default class Recommend  extends React.Component {
    constructor() {
        super();
    }

    getRecommend() {
        eventEmitter.emit(constStr.RINGLOADING, true);
        fetch(`${__REQUESTHOST}/api/personalized`, {
            method: 'GET',
        }).then((res) => {
            return res.json();
        }).then(data => {
            if(data.code == 200) {
                store.dispatch(Actions.setRecommend(data.result || []));
            }
            eventEmitter.emit(constStr.RINGLOADING, false);
        })
    }

    getPlayCount(num) {
        let str;
        if(num > 10000) {
            str = (num / 10000).toFixed(0);
            str += '万';
        }else {
            str = num;
        }
        return str
    }

    render() {
        let recommendList = store.getState().main.recommendList || [];
        return (
            <div className="recommend">
                {
                    recommendList.length > 0?
                        <div className="recommoned-banner">
                            <div className="cover">
                                <i className="list-tag"><em className="iconfont icon-iconset0271"></em>{this.getPlayCount(recommendList[0].playCount)}</i>
                                <LazyImg src={recommendList[0].picUrl || ''} placeholder={__REQUESTHOST + '/placeholderCover.png'}/>
                            </div>
                            <div className="info">
                                <div className="name">{recommendList[0].name || ''}</div>
                                <div className="desc">{recommendList[0].copywriter || ''}</div>
                                <Link to={`/listDetail/${recommendList[0].id}`}>
                                    <div className="play-btn"><i className="iconfont icon-bofang1"></i>去看看</div>
                                </Link>
                            </div>
                        </div>:null
                }
                <div className="item-list">
                    {
                        recommendList.map((data, k) => {
                            if(k > 0) {
                                return (
                                    <Link to={`/listDetail/${data.id}`} key={k}>
                                        <div className="album-itembox">
                                            <div className="cover">
                                                <LazyImg src={data.picUrl} placeholder={__REQUESTHOST + '/placeholderCover.png'} />
                                            </div>
                                            <div className="r">
                                                <div className="desc">{data.name}</div>
                                                <div className="num">
                                                    <i className="iconfont icon-iconset0271"></i>
                                                    <span>{this.getPlayCount(data.playCount)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            }
                        })
                    }
                    {
                        recommendList.length == 0?
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