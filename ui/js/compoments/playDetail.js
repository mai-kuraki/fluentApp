import React from 'react';
import {Link} from 'react-router-dom';
import Progressbar from "progressbar.js";
import eventEmitter from '../lib/eventEmitter';
import * as constStr from '../lib/const';
import store from "../store";
import * as Actions from "../actions";

export default class PlayDetail extends React.Component {
    constructor() {
        super();
        this.state = {
            playState: false,
            percent: 0,
        };
        this.progress = null;
        this.baseY = Math.floor(window.innerHeight * 2/3);
    }

    componentDidMount() {
        let audio = document.getElementById('audio');
        let state = audio.paused;
        this.setState({
            playState: !state,
        });
        this.progress = new Progressbar.Circle('#progress', {
            strokeWidth: 4,
            trailWidth: 2,
            trailColor: 'rgba(49,194,124, 0.4)',
            color: 'rgba(49,194,124, 1)',
        });
        this.init();
        eventEmitter.on(constStr.PLAYPERCENT, (percent) => {
            this.progress.animate(percent);
        })
    }

    componentWillUnmount() {

    }

    init() {
        let _this = this;
        this.audioContext = new window.AudioContext();
        this.canvas = document.getElementById('waveCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.offsetWidth,
            this.height = this.canvas.offsetHeight;
        this.canvas.width = this.width,
            this.canvas.height = this.height;
        this.ctx.beginPath();
        this.ctx.fillStyle = 'rgba(240,143,143,0.9)';
        this.ctx.moveTo(0, this.baseY);
        this.ctx.lineTo(this.width, this.baseY);
        this.ctx.lineTo(this.width, this.height);
        this.ctx.lineTo(0, this.height);
        this.ctx.fill();

        let audio = document.getElementById('audio');
        let source = this.audioContext.createMediaElementSource(audio);
        let analyser = this.audioContext.createAnalyser();
        analyser.connect(this.audioContext.destination);
        source.connect(analyser);
        function con() {
            let storeMain = store.getState().main;
            if(storeMain.UIPage) {
                let array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);
                _this.draw(array);
            }
            requestAnimationFrame(con);
        }
        requestAnimationFrame(con)
    }

    draw(array){
        this.ctx.clearRect(0,0,this.width, this.height);
        //array的长度为1024, 总共取10个关键点,关键点左右边各取五个点作为过渡,波浪更为自然;
        let waveArr1 = [],waveArr2 = [],waveTemp = [],leftTemp = [],rightTemp = [],waveStep = 50,leftStep = 70, rightStep = 90;
        array.map((data, k) => {
            if(waveStep == 50 && waveTemp.length < 9) {
                waveTemp.push(data / 2.6);
                waveStep = 0;
            }else{
                waveStep ++;
            }
            if(leftStep == 0 && leftTemp.length < 5) {
                leftTemp.unshift(Math.floor(data / 4.8));
                leftStep = 70;
            }else {
                leftStep --;
            }
            if(rightStep == 0 && rightTemp.length < 5) {
                rightTemp.push(Math.floor(data / 4.8));
                rightStep = 90;
            }else {
                rightStep --;
            }
        });
        waveArr1 = leftTemp.concat(waveTemp).concat(rightTemp);
        waveArr2 = leftTemp.concat(rightTemp);
        waveArr2.map((data, k) => {
            waveArr2[k] = data * 1.8;
        });
        let waveWidth = Math.ceil(this.width / (waveArr1.length - 3));
        let waveWidth2 =  Math.ceil(this.width / (waveArr2.length - 3));
        this.ctx.beginPath();
        this.ctx.fillStyle = 'rgba(49,194,124,0.4)';
        this.ctx.moveTo(-waveWidth2, this.baseY - waveArr2[0]);
        for(let i = 1; i < waveArr2.length - 2; i ++) {
            let p0 = {x: (i - 1) * waveWidth2, y:waveArr2[i - 1]};
            let p1 = {x: (i) * waveWidth2, y:waveArr2[i]};
            let p2 = {x: (i + 1) * waveWidth2, y:waveArr2[i + 1]};
            let p3 = {x: (i + 2) * waveWidth2, y:waveArr2[i + 2]};

            for(let j = 0; j < 100; j ++) {
                let t = j * (1.0 / 100);
                let tt = t * t;
                let ttt = tt * t;
                let CGPoint ={};
                CGPoint.x = 0.5 * (2*p1.x+(p2.x-p0.x)*t + (2*p0.x-5*p1.x+4*p2.x-p3.x)*tt + (3*p1.x-p0.x-3*p2.x+p3.x)*ttt);
                CGPoint.y = 0.5 * (2*p1.y+(p2.y-p0.y)*t + (2*p0.y-5*p1.y+4*p2.y-p3.y)*tt + (3*p1.y-p0.y-3*p2.y+p3.y)*ttt);
                this.ctx.lineTo(CGPoint.x, this.baseY - CGPoint.y);
            }
            this.ctx.lineTo(p2.x, this.baseY - p2.y);
        }
        this.ctx.lineTo((waveArr2.length - 1) * waveWidth2, this.baseY - waveArr2[waveArr2.length - 1]);
        this.ctx.lineTo(this.width + waveWidth2, this.baseY);
        this.ctx.lineTo(this.width + waveWidth2, this.height);
        this.ctx.lineTo(-1 * waveWidth2, this.height);
        this.ctx.fill();


        this.ctx.beginPath();
        this.ctx.fillStyle = 'rgba(49,194,124,0.8)';
        this.ctx.moveTo(-waveWidth * 2, this.baseY - waveArr1[0]);
        for(let i = 1; i < waveArr1.length - 2; i ++) {
            let p0 = {x: (i - 2) * waveWidth, y:waveArr1[i - 1]};
            let p1 = {x: (i - 1) * waveWidth, y:waveArr1[i]};
            let p2 = {x: (i) * waveWidth, y:waveArr1[i + 1]};
            let p3 = {x: (i + 1) * waveWidth, y:waveArr1[i + 2]};

            for(let j = 0; j < 100; j ++) {
                let t = j * (1.0 / 100);
                let tt = t * t;
                let ttt = tt * t;
                let CGPoint ={};
                CGPoint.x = 0.5 * (2*p1.x+(p2.x-p0.x)*t + (2*p0.x-5*p1.x+4*p2.x-p3.x)*tt + (3*p1.x-p0.x-3*p2.x+p3.x)*ttt);
                CGPoint.y = 0.5 * (2*p1.y+(p2.y-p0.y)*t + (2*p0.y-5*p1.y+4*p2.y-p3.y)*tt + (3*p1.y-p0.y-3*p2.y+p3.y)*ttt);
                this.ctx.lineTo(CGPoint.x, this.baseY - CGPoint.y);
            }
            this.ctx.lineTo(p2.x, this.baseY - p2.y);
        }
        this.ctx.lineTo((waveArr1.length) * waveWidth, this.baseY - waveArr1[waveArr1.length - 1]);
        this.ctx.lineTo(this.width + waveWidth * 2, this.baseY);
        this.ctx.lineTo(this.width + waveWidth * 2, this.height);
        this.ctx.lineTo(-2 * waveWidth, this.height);
        this.ctx.fill();
    }

    switchPlay() {
        eventEmitter.emit(constStr.SWITCHPLAY, !this.state.playState);
        this.setState({
            playState: !this.state.playState,
        })
    }

    goBack() {
        store.dispatch(Actions.setPlayUiPage(false));
    }

    render() {
        let state = this.state;
        let storeMain = store.getState().main;
        let songInfo = storeMain.songInfo;
        if(!songInfo.hasOwnProperty('al')) {
            songInfo.al = {};
        }
        if(!songInfo.hasOwnProperty('ar')) {
            songInfo.ar = [{}];
        }
        return (
            <div className={`play-ui-page ${storeMain.UIPage?'play-ui-page-show':''}`}>
                <div className={`windowsHead`}>
                    <div className="back iconfont icon-fanhui" onClick={this.goBack.bind(this)}></div>
                    <div className="dragbar"></div>
                    <div className="btns">
                        <span className="iconfont icon-zuixiaohua3"></span>
                        <span className="close iconfont icon-guanbi"></span>
                    </div>
                </div>
                <div className="cover">
                    <div className="progress" id="progress">
                    </div>
                    <img src={songInfo.al.picUrl || __REQUESTHOST + '/defaultCover.png'}/>
                </div>
                <div className="wave">
                    <canvas id="waveCanvas"></canvas>
                </div>
                <div className="player-panel">
                    <div className="song-name">{songInfo.name || ''}</div>
                    <div className="singer">{songInfo.ar[0].name || ''}</div>
                    <div className="control">
                        <div className="change pre iconfont icon-xiayishou1-copy"></div>
                        <div className={`play iconfont ${state.playState?'icon-zanting':'icon-bofang'}`} onClick={this.switchPlay.bind(this)}></div>
                        <div className="change next iconfont icon-xiayishou1"></div>
                    </div>
                </div>
            </div>
        )
    }
}