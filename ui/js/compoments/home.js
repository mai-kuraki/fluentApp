import React from 'react';
import {Link} from 'react-router-dom';
import Swiper from 'swiper';
import Recommend from './recommend';
import Newest from './newest';
import Album from './ablum';
import Mysong from './mysong';
import store from '../store';
import * as Actions from '../actions';

export default class Home extends React.Component {
    constructor() {
        super();
        this.state = {
            activeTab: 0,
            tabs: [
                {id: 0, name: 'RECOMMEND'},
                {id: 1, name: 'NEWEST'},
                {id: 2, name: 'ALBUM'},
                {id: 3, name: 'MY SONG'},
            ]
        }
    }

    componentDidMount() {
        this.mySwiper = new Swiper('.home-tab-wrapper', {
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
        })
    }

    render() {
        let state = this.state;
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
                    {
                        state.tabs.map((data, k) => {
                            return(
                                <div key={k} className={`tab ${state.activeTab == data.id?'cur':''}`} onClick={this.switchTab.bind(this, data.id)}>{data.name}</div>
                            )
                        })
                    }
                </div>
                <div className="home-tab-wrapper">
                    <div className="swiper-wrapper">
                        <div className="swiper-slide"><Recommend/></div>
                        <div className="swiper-slide"><Newest/></div>
                        <div className="swiper-slide"><Album/></div>
                        <div className="swiper-slide"><Mysong/></div>
                    </div>
                </div>
            </div>
        )
    }
}