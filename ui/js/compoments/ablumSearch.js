import React from 'react';
import {Link} from 'react-router-dom';
import SearchAlbumDetail from './searchAlbumDetail';
import LazyImg from 'lazy-img-react';
import store from '../store';
import * as Actions from '../actions';
import * as constStr from "../lib/const";
import eventEmitter from "../lib/eventEmitter";

export default class AblumSearch  extends React.Component {
    constructor() {
        super();
        this.state = {
            detailShow: false,
            curId: '',
        }
    }

    componentDidMount() {
    }

    goback() {
        this.setState({
            detailShow: false,
        })
    }

    render() {
        let data = this.props.data || [];
        let count = this.props.count;
        return (
            <div className="album">
                {
                    this.state.detailShow?
                        <div className="album-detail">
                            <SearchAlbumDetail id={this.state.curId} goback={this.goback.bind(this)}/>
                        </div>:null
                }
                <div className="item-list">
                    {
                        data.map((data, k) => {
                            return(
                                <div key={k} className="album-itembox clearfix" onClick={() => {
                                    this.setState({
                                        curId: data.id,
                                        detailShow: true,
                                    })
                                }}>
                                    <div className="cover">
                                        <LazyImg src={data.picUrl} placeholder={__REQUESTHOST + '/placeholderCover.png'}/>
                                    </div>
                                    <div className="info">
                                        <div className="name">{data.name}</div>
                                        <div className="singer">{data.artist.name}</div>
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