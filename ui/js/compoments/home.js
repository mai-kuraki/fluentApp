import React from 'react';
import {Link} from 'react-router-dom';
import store from '../store';
import * as Actions from '../actions';

export default class Home extends React.Component {
    constructor() {
        super();
    }

    componentDidMount() {
        this.getRecommend();
    }

    getRecommend() {
        fetch(`${__REQUESTHOST}/api/personalized`, {
            method: 'GET',
        }).then((res) => {
            return res.json();
        }).then(data => {
            if(data.code == 200) {
                store.dispatch(Actions.setRecommend(data.result || []))
            }
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
        return(
            <div className="home-page">
                <div className="windowsHead">
                    <div className="back"></div>
                    <div className="dragbar"></div>
                    <div className="btns">
                        <span className="iconfont icon-zuixiaohua3"></span>
                        <span className="close iconfont icon-guanbi"></span>
                    </div>
                </div>
                <div className="home-tab">
                    <div className="tab cur">RECOMMEND</div>
                    <div className="tab">NEWEST</div>
                    <div className="tab">ASSUME</div>
                    <div className="tab">MY SONG</div>
                </div>
                <div className="recommend">
                    {
                        recommendList.length > 0?
                            <div className="recommoned-banner">
                                <div className="cover">
                                    <i className="list-tag"><em className="iconfont icon-iconset0271"></em>{this.getPlayCount(recommendList[0].playCount)}</i>
                                    <img src={recommendList[0].picUrl || ''}/>
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
                                        <Link to={`/listDetail/${data.id}`} replace key={k}>
                                        <div className="album-itembox">
                                            <div className="cover">
                                                <img src={data.picUrl} />
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
                    </div>
                </div>
            </div>
        )
    }
}