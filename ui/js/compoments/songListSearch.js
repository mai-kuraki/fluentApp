import React from 'react';
import {Link} from 'react-router-dom';
import SearchListDetail from './searchListDetail';
import LazyImg from 'lazy-img-react';
import store from '../store';
import * as Actions from '../actions';
import * as constStr from "../lib/const";
import eventEmitter from "../lib/eventEmitter";

export default class SongListSearch  extends React.Component {
    constructor() {
        super();
        this.state = {
            detailShow: false,
            curId: '',
        }
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

    goback() {
        this.setState({
            detailShow: false,
        })
    }

    render() {
        let data = this.props.data;
        let count = this.props.count;
        return (
            <div className="songlist">
                {
                    this.state.detailShow?
                        <div className="songlist-detail">
                            <SearchListDetail id={this.state.curId} goback={this.goback.bind(this)}/>
                        </div>:null
                }
                <div className="item-list">
                    {
                        data.map((data, k) => {
                            return (
                                <div key={k} className="album-itembox" onClick={() => {
                                    this.setState({
                                        curId: data.id,
                                        detailShow: true,
                                    })
                                }}>
                                    <div className="cover">
                                        <LazyImg src={data.coverImgUrl} placeholder={__REQUESTHOST + '/placeholderCover.png'}/>
                                    </div>
                                    <div className="r">
                                        <div className="desc">{data.name}</div>
                                        <div className="num">
                                            <i className="iconfont icon-iconset0271"></i>
                                            <span>{this.getPlayCount(data.playCount)}</span>
                                        </div>
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