import React from 'react';
import {Link} from 'react-router-dom';
import Swiper from 'swiper';
import Single from './single';
import AblumSearch from './ablumSearch';
import SingerSearch from './singerSearch';
import SongListSearch from './songListSearch';
import store from '../store';
import * as Actions from '../actions';
import * as constStr from "../lib/const";
import eventEmitter from "../lib/eventEmitter";

export default class Search  extends React.Component {
    constructor() {
        super();
        this.state = {
            activeTab: 0,
            keyword: '',
            keywordCache: '',
            tabs: [
                {id: 0, name: '单曲'},
                {id: 1, name: '专辑'},
                {id: 2, name: '歌手'},
                {id: 3, name: '歌单'},
            ],
            singleLoad: false,
            singerLoad: false,
            albumLoad: false,
            listLoad: false,
            limit: 30,
            singleItem: [],
            singleCount: 0,
            singleOffset: 0,
            singerItem: [],
            singerCount: 0,
            singerOffset: 0,
            albumItem: [],
            albumCount: 0,
            albumOffset: 0,
            listItem: [],
            listCount: 0,
            listOffset: 0,
            loading: false,
        }
    }

    componentDidMount() {
        this.mySwiper = new Swiper('.search-tab-wrapper', {
            allowTouchMove: false,
            on:{
                transitionEnd: () => {
                    this.setState({
                        activeTab: this.mySwiper.activeIndex
                    });
                },
            },
        });
    }

    switchTab(index) {
        this.mySwiper.slideTo(index);
        this.setState({
            activeTab: index,
        });
        setTimeout(() => {
            this.search();
        })
    }

    search(paging) {
        /**
         * 1: 单曲
         * 10: 专辑
         * 100: 歌手
         * 1000: 歌单
         * @type {number}
         */
        let state = this.state;
        let keyword = state.keyword;
        if(!keyword) return;
        let typeMap = [1, 10, 100, 1000];
        let typeKey = ['single', 'album', 'singer', 'list'];
        let activeTab = state.activeTab;
        let type = typeMap[activeTab];
        if(!paging) {
            if((type == 1 && state.singleLoad) ||
                (type == 10 && state.albumLoad) ||
                (type == 100 && state.singerLoad) ||
                (type == 1000 && state.listLoad)) {
                return;
            };
        }
        eventEmitter.emit(constStr.RINGLOADING, true);
        this.setState({
            loading: true,
        });
        fetch(`${__REQUESTHOST}/api/search?keywords=${keyword}&type=${type}&offset=${state[`${typeKey[activeTab]}Offset`] || 0}&limit=${state.limit}`, {
            method: 'GET',
        }).then((res) => {
            return res.json();
        }).then(data => {
            if(data.code == 200) {
                if(type == 1) {
                    let arr = [];
                    if(paging) {
                        arr = state.singleItem || [];
                    }
                    this.setState({
                        singleLoad: true,
                        singleItem: arr.concat(data.result.songs || []),
                        singleCount: data.result.songCount,
                    })
                }else if(type == 10) {
                    let arr = [];
                    if(paging) {
                        arr = state.albumItem || [];
                    }
                    this.setState({
                        albumLoad: true,
                        albumItem: arr.concat(data.result.albums || []),
                        albumCount: data.result.albumCount,
                    })
                }else if(type == 100) {
                    let arr = [];
                    if(paging) {
                        arr = state.singerItem || [];
                    }
                    this.setState({
                        singerLoad: true,
                        singerItem: arr.concat(data.result.artists || []),
                        singerCount: data.result.artistCount,
                    })
                }else if(type == 1000) {
                    let arr = [];
                    if(paging) {
                        arr = state.listItem || [];
                    }
                    this.setState({
                        listLoad: true,
                        listItem: arr.concat(data.result.playlists || []),
                        listCount: data.result.playlistCount
                    })
                }
            }else {
                this.doFailed();
            }
            this.setState({
                loading: false,
            });
            eventEmitter.emit(constStr.RINGLOADING, false);
        }).catch((err) => {
            this.setState({
                loading: false,
            });
            this.doFailed();
        })
    }

    doFailed() {
        let typeKey = ['single', 'album', 'singer', 'list'];
        let activeTab = this.state.activeTab;
        let curOffset = this.state[`${typeKey[activeTab]}Offset`];
        if(curOffset > 0) {
            let newOffset = {};
            newOffset[`${typeKey[activeTab]}Offset`] = curOffset - 1;
            this.setState(newOffset);
        }
    }

    loadingMore() {
        let typeKey = ['single', 'album', 'singer', 'list'];
        let activeTab = this.state.activeTab;
        let curOffset = this.state[`${typeKey[activeTab]}Offset`];
        let newOffset = {};
        newOffset[`${typeKey[activeTab]}Offset`] = curOffset + 1;
        this.setState(newOffset);
        setTimeout(() => {
            this.search(true);
        });
    }

    render() {
        let state = this.state;
        return (
            <div className="search-page">
                <div className="search-area">
                    <Link to="/"><div className="searchBtn iconfont icon-fanhui"></div></Link>
                    <input ref="search" type="text" placeholder="搜索音乐、歌单、歌手"
                           onChange={(e) => {
                               this.setState({
                                   keywordCache: e.target.value,
                               })
                           }}
                           onKeyDown={(e) => {
                        if(e.keyCode == 13) {
                            if(e.target.value == state.keyword) {
                                return;
                            }else {
                                this.setState({
                                    keyword: e.target.value,
                                    singleLoad: false,
                                    singerLoad: false,
                                    albumLoad: false,
                                    listLoad: false,
                                });
                                setTimeout(() => {
                                    this.search();
                                });

                            }

                        }
                    }}/>
                    {
                        state.keywordCache?
                            <div className="clear iconfont icon-guanbi" onClick={() => {
                                this.setState({
                                    keyword: '',
                                    keywordCache: '',
                                });
                                this.refs.search.value = '';
                            }}></div>:null
                    }
                </div>
                <div className="search-tab">
                    {
                        state.tabs.map((data, k) => {
                            return(
                                <div key={k} className={`tab ${state.activeTab == data.id?'cur':''}`} onClick={this.switchTab.bind(this, data.id)}>{data.name}</div>
                            )
                        })
                    }
                </div>
                <div className="search-tab-wrapper">
                    <div className="swiper-wrapper">
                        <div className="swiper-slide"><Single data={state.singleItem} load={this.loadingMore.bind(this)} count={state.singleCount}/></div>
                        <div className="swiper-slide"><AblumSearch data={state.albumItem} load={this.loadingMore.bind(this)} count={state.albumCount}/></div>
                        <div className="swiper-slide"><SingerSearch data={state.singerItem} load={this.loadingMore.bind(this)} count={state.singerCount}/></div>
                        <div className="swiper-slide"><SongListSearch data={state.listItem} load={this.loadingMore.bind(this)} count={state.listCount}/></div>
                    </div>
                </div>
            </div>
        )
    }
}