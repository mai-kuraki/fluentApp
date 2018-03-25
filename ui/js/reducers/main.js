import * as TYPE from '../lib/const';

const initState = {
    recommendList: [],
    currentSong: {},
    UIPage: false,
    songInfo: {},
};

function main(state = initState, action) {
    switch (action.type) {
        case TYPE.SET_RECOMMEND_LIST:
            return Object.assign({}, state, {
                recommendList: action.value
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
        default:
            return state;
    }
}

export default main;