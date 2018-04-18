import * as TYPE from '../lib/const';

const initState = {
    recommendList: [],
    newestList: [],
    albumList: [],
    currentSong: {},
    UIPage: false,
    songInfo: {},
    volume: 0,
    playOrder: 0,
    playList: [],
    playState: false,
};

function main(state = initState, action) {
    switch (action.type) {
        case TYPE.SET_RECOMMEND_LIST:
            return Object.assign({}, state, {
                recommendList: action.value
            });
        case TYPE.SET_NEWEST_LIST:
            return Object.assign({}, state, {
                newestList: action.value
            });
        case TYPE.SET_ALBUM_LIST:
            return Object.assign({}, state, {
                albumList: action.value
            });
        case TYPE.SET_CURRENTSONG_INFO:
            return Object.assign({}, state, {
                currentSong: action.value
            });
        case TYPE.SET_PLAY_UI_PAGE:
            return Object.assign({}, state, {
                UIPage: action.value
            });
        case TYPE.SET_SONG_INFO:
            return Object.assign({}, state, {
                songInfo: action.value
            });
        case TYPE.SET_PLAY_STATE:
            return Object.assign({}, state, {
                playState: action.value
            });
        case TYPE.SET_VOLUME:
            return Object.assign({}, state, {
                volume: action.value
            });
        case TYPE.SET_PLAYORDER:
            return Object.assign({}, state, {
                playOrder: action.value
            });
        case TYPE.SET_PLAYLIST:
            return Object.assign({}, state, {
                playList: action.value
            });
        default:
            return state;
    }
}

export default main;