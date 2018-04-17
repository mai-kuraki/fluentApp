import React from 'react';
import {Link} from 'react-router-dom';
import eventEmitter from '../lib/eventEmitter';
import * as constStr from '../lib/const';
import store from "../store";
import * as Actions from "../actions";

export default class PlayDetail extends React.Component {
    constructor() {
        super();
        this.state = {
            mouseDown: false,
            vMouseDown: false,
            percent: 0,
            duration: 0,
            currentTime: 0,
            buffered: 0,
            volBarState: false,
            init: false,
        };
        this.mouseDownPercent = 0;
        this.mouseDown = false;
        this.audio = null;
        this.baseY = Math.floor(window.innerHeight * 2/3);
    }

    componentDidMount() {
        this.init();
        eventEmitter.on(constStr.PLAYANIMATE, () => {
            this.init();
        });
        eventEmitter.on(constStr.PLAYPERCENT, (p) => {
            this.audioDo();
        })
    }

    audioDo() {
        if(this.audio) {
            let buffered = this.audio.buffered.end(0),
                duration = this.audio.duration,
                currentTime = this.audio.currentTime;
            let playPercent = currentTime / duration;
            if(!this.state.mouseDown) {
                this.setState({
                    duration: duration,
                    currentTime: currentTime,
                    buffered: buffered,
                    percent: (playPercent * 100).toFixed(2),
                })
            }else {
                this.setState({
                    currentTime: currentTime,
                    buffered: buffered,
                })
            }
        }
    }


    formatSeconds(value) {
        let theTime = parseInt(value);
        let theTime1 = 0;
        let theTime2 = 0;
        if (theTime > 60) {
            theTime1 = parseInt(theTime / 60);
            theTime = parseInt(theTime % 60);
            if (theTime1 > 60) {
                theTime2 = parseInt(theTime1 / 60);
                theTime1 = parseInt(theTime1 % 60);
            }
        }
        let result;
        if (parseInt(theTime) > 9) {
            result = "" + parseInt(theTime) + "";
        } else {
            result = "0" + parseInt(theTime) + "";
        }
        if (theTime1 > 0) {
            if(parseInt(theTime1) > 9) {
                result = "" + parseInt(theTime1) + ":" + result;
            }else {
                result = "0" + parseInt(theTime1) + ":" + result;
            }
        } else {
            result = "00:" + result;
        }
        if (theTime2 > 0) {
            result = "" + parseInt(theTime2) + ":" + result;
        }
        return result;
    }

    init() {
        let init = this.state.init;
        let _this = this;
        if(!init) {
            this.audioContext = new window.AudioContext();
            this.canvas = document.getElementById('waveCanvas');
            this.ctx = this.canvas.getContext('2d');
            this.width = this.canvas.offsetWidth,
            this.height = this.canvas.offsetHeight;
            this.canvas.width = this.width,
            this.canvas.height = this.height;
            this.ctx.beginPath();
            this.ctx.fillStyle = 'rgba(49,194,124,0.8)';
            this.ctx.moveTo(0, this.baseY);
            this.ctx.lineTo(this.width, this.baseY);
            this.ctx.lineTo(this.width, this.height);
            this.ctx.lineTo(0, this.height);
            this.ctx.fill();

            this.audio = document.getElementById('audio');
            this.source = this.audioContext.createMediaElementSource(this.audio);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.connect(this.audioContext.destination);
            this.source.connect(this.analyser);
            this.setState({
                init: true,
            })
        }
        function con() {
            if(store.getState().main.UIPage) {
                let array = new Uint8Array(_this.analyser.frequencyBinCount);
                _this.analyser.getByteFrequencyData(array);
                _this.draw(array);
                requestAnimationFrame(con);
            }
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
        this.ctx.fillStyle = 'rgba(102,102,102,0.4)';
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
        this.ctx.fillStyle = 'rgba(102,102,102,0.8)';
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
        if(this.audio && this.audio.src) {
            let storeMain = store.getState().main;
            eventEmitter.emit(constStr.SWITCHPLAY, !storeMain.playState);
        }
    }

    goBack() {
        store.dispatch(Actions.setPlayUiPage(false));
    }

    calcCir() {
        let percent = this.state.percent;
        let cir = (Math.PI * 15.6 * 2 * percent / 100).toFixed(2);
        return cir;
    }

    calcDeg() {
        let percent = this.state.percent;
        let deg = 360 * percent / 100;
        return deg;
    }

    dotMouseDown(e) {
        if(this.audio && this.audio.src) {
            this.mouseDownPercent = this.state.percent;
            this.setState({
                mouseDown: true,
            })
        }
    }

    mouseMove(e) {
        if(this.state.mouseDown && this.audio && this.audio.src) {
            let baseX = document.getElementById('dotflag').getBoundingClientRect().left;
            let baseY = document.getElementById('dotflag').getBoundingClientRect().top;
            let cx = e.clientX;
            let cy = e.clientY;
            let offsetX = cx - baseX;
            let offsetY = -(cy - baseY);
            let tan = offsetX / offsetY;
            let deg = 0;
            if(offsetX > 0) {
                if(offsetY > 0) {
                    deg = Math.abs(Math.atan(tan) / (Math.PI/360)) / 2;
                }else {
                    deg = 180 - Math.abs(Math.atan(tan) / (Math.PI/360)) / 2;
                }

            }else if(offsetX < 0){
                if(offsetY > 0) {
                    deg = 360 - Math.abs(Math.atan(tan) / (Math.PI/360) / 2);
                }else {
                    deg = 180 + Math.abs(Math.atan(tan) / (Math.PI/360) / 2);
                }
            }else if(offsetX == 0 && offsetY < 0) {
                deg = 180;
            }
            this.setState({
                percent: deg * (100 / 360),
            });
        }
        if(this.state.vMouseDown) {
            this.setVol(e.clientY);
        }
    }

    setVol(clientY) {
        let barBottom = this.refs.volPanel.getBoundingClientRect().bottom,
            barTop = this.refs.volPanel.getBoundingClientRect().top;
        let height = barBottom - barTop;
        let curHeight = barBottom - clientY;
        let vPercent = (curHeight / height).toFixed(2);
        if(vPercent > 1) {
            vPercent = 1;
        }else if(vPercent < 0) {
            vPercent = 0;
        }
        store.dispatch(Actions.setVolume(vPercent));
        this.audio.volume = vPercent;
    }

    mouseUp() {
        if(this.state.vMouseDown) {
            this.setState({
                vMouseDown: false,
            })
        }
        if(this.state.mouseDown && this.audio && this.audio.src) {
            this.setState({
                mouseDown: false,
            });
            let percent = this.state.percent,
                duration = this.state.duration;
            let currentTime = percent / 100 * duration;
            this.audio.currentTime = currentTime;
        }
    }

    vdotMouseDown(e) {
        this.setState({
            vMouseDown: true,
        });
    }

    pageMouseDown(e) {
        if(this.state.volBarState) {
            let classname = e.target.getAttribute('class');
            if(classname != 'dot' && classname != 'v-track') {
                this.setState({
                    volBarState: false,
                })
            }
        }
    }

    render() {
        let state = this.state;
        let storeMain = store.getState().main;
        let songInfo = storeMain.songInfo;
        let vol = storeMain.volume;
        if(!songInfo.hasOwnProperty('al')) {
            songInfo.al = {};
        }
        if(!songInfo.hasOwnProperty('ar')) {
            songInfo.ar = [{}];
        }
        return (
            <div className={`play-ui-page ${storeMain.UIPage?'play-ui-page-show':''}`} onMouseDown={this.pageMouseDown.bind(this)} onMouseMove={this.mouseMove.bind(this)} onMouseUp={this.mouseUp.bind(this)}>
                <div className={`windowsHead`}>
                    <div className="back iconfont icon-fanhui" onClick={this.goBack.bind(this)}></div>
                    <div className="dragbar"></div>
                    <div className="btns">
                        <span className="iconfont icon-zuixiaohua3" onClick={() => {eventEmitter.emit(constStr.MINWINDOW)}}></span>
                        <span className="close iconfont icon-guanbi" onClick={() => {eventEmitter.emit(constStr.CLOSEWINDOW)}}></span>
                    </div>
                </div>
                <div className="cover">
                    <div className="bar-wrap">
                        <div id="dotflag"></div>
                        <div className="dot-wrap" id="dotWrap" style={{transform: `rotate(${this.calcDeg()}deg)`}}>
                            <div className="dot" onMouseDown={this.dotMouseDown.bind(this)}></div>
                        </div>
                        <svg width="32vw" height="32vw">
                            <circle cx="16vw" cy="16vw" r="15.5vw" strokeWidth="3" stroke="#DDD" fill="none" className="track"></circle>
                            <circle cx="16vw" cy="16vw" r="15.5vw" strokeWidth="3" stroke="#666" fill="none" className="thumb" strokeDasharray={`${this.calcCir()}vw 2000`}></circle>
                        </svg>
                    </div>
                    <img src={songInfo.al.picUrl || __REQUESTHOST + '/defaultCover.png'}/>
                </div>
                <div className="wave">
                    <canvas id="waveCanvas"></canvas>
                </div>
                <div className="player-panel">
                    <div className="song-name">{songInfo.name || ''}</div>
                    <div className="singer">{songInfo.ar[0].name || ''}</div>
                    <div className="time">{this.formatSeconds(state.currentTime)} / {this.formatSeconds(state.duration)}</div>
                    <div className="control">
                        <div className="vol">
                            {
                                state.volBarState?
                                    <div className="vol-panel" id="volPanel" ref="volPanel">
                                        <div className="v-track" onClick={(e) => {this.setVol(e.clientY)}}></div>
                                        <div className="v-bar" style={{height: `${vol * 100}%`}}></div>
                                        <div className="dot" style={{bottom: `${vol * 100}%`}} onMouseDown={this.vdotMouseDown.bind(this)}></div>
                                    </div>:null
                            }
                            <div className={`vol-icon iconfont ${vol > 0?'icon-yinliang':'icon-jingyin'} ${state.volBarState?'vol-icon-active':''}`} data-vol={Math.floor(vol * 100)} onClick={() => {this.setState({volBarState: !state.volBarState})}}></div>
                        </div>
                        <div className="change pre iconfont icon-xiayishou1-copy"></div>
                        <div className={`play iconfont ${storeMain.playState?'icon-weibiaoti519':'icon-bofang2'}`} onClick={this.switchPlay.bind(this)}></div>
                        <div className="change next iconfont icon-xiayishou1"></div>
                        <div className="order iconfont icon-shunxuchakan"></div>
                    </div>
                </div>
            </div>
        )
    }
}