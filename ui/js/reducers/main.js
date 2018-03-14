import * as TYPE from '../lib/const';

const initState = {
    curSong: {},
    curPlaySong: {},
    playState: false,
};

function main(state = initState, action) {
    switch (action.type) {
        case TYPE.SET_CUR_SONG:
            return Object.assign({}, state, {
                curSong: action.val
            });
        case TYPE.SET_CUR_PLAY_SONG:
            return Object.assign({}, state, {
                curPlaySong: action.val
            });
        case TYPE.SET_PLAY_STATE:
            return Object.assign({}, state, {
                playState: action.val
            });
        default:
            return state;
    }
}

export default main;