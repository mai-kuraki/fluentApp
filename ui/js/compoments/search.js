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
            singleItem: [],
            singerItem: [],
            albumItem: [],
            listItem: [],
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

    search() {
        /**
         * 1: 单曲
         * 10: 专辑
         * 100: 歌手
         * 1000: 歌单
         * @type {number}
         */
        let state = this.state;
        let keyword = state.keyword;
        let typeMap = [1, 10, 100, 1000];
        let activeTab = state.activeTab;
        let type = typeMap[activeTab];
        if((type == 1 && state.singleLoad) ||
            (type == 10 && state.albumLoad) ||
            (type == 100 && state.singerLoad) ||
            (type == 1000 && state.listLoad)) {
            return;
        }
        eventEmitter.emit(constStr.RINGLOADING, true);
        fetch(`${__REQUESTHOST}/api/search?keywords=${keyword}&type=${type}`, {
            method: 'GET',
        }).then((res) => {
            return res.json();
        }).then(data => {
            if(data.code == 200) {
                if(type == 1) {
                    this.setState({
                        singleLoad: true,
                        singleItem: data.result.songs || [],
                    })
                }else if(type == 10) {
                    this.setState({
                        albumLoad: true,
                        albumItem: data.result.albums || [],
                    })
                }else if(type == 100) {
                    this.setState({
                        singerLoad: true,
                        singerItem: data.result.artists || [],
                    })
                }else if(type == 1000) {
                    this.setState({
                        listLoad: true,
                        listItem: data.result.playlists || [],
                    })
                }
            }
            eventEmitter.emit(constStr.RINGLOADING, false);
        })
    }


    render() {
        let state = this.state;
        return (
            <div className="search-page">
                <div className="search-area">
                    <Link to="/"><div className="searchBtn iconfont icon-fanhui"></div></Link>
                    <input type="text" placeholder="搜索音乐、歌单、歌手" onKeyDown={(e) => {
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
                    <div className="clear iconfont icon-guanbi"></div>
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
                        <div className="swiper-slide"><Single data={state.singleItem}/></div>
                        <div className="swiper-slide"><AblumSearch data={state.albumItem}/></div>
                        <div className="swiper-slide"><SingerSearch data={state.singerItem}/></div>
                        <div className="swiper-slide"><SongListSearch data={state.listItem}/></div>
                    </div>
                </div>
            </div>
        )
    }
}