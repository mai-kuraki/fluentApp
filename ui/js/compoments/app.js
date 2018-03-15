/**
 * Created by maikuraki on 2017/11/4.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import {remote} from 'electron';

export default class App extends React.Component {
    constructor() {
        super();
        this.state = {

        };
    }

    render() {
        return (
            <Router>
                <div className="player-wrap">
                    <div className="play-ui-page">
                        <div className="head">
                            <div className="back iconfont icon-fanhui"></div>
                            <div className="menu iconfont icon-weibiaoti12"></div>
                        </div>
                        <div className="cover"><img src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1521139730883&di=971a956639155c09237e4a924221c70d&imgtype=0&src=http%3A%2F%2Fi0.sinaimg.cn%2Fent%2Fy%2F2011-11-16%2FU5956P28T3D3482905F326DT20111116155045.jpg"/></div>
                    </div>
                </div>
            </Router>
        )
    }
}