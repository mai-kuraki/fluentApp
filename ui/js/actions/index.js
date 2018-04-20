import * as TYPE from '../lib/const';

export function setRecommend(val) {
    return {
        type: TYPE.SET_RECOMMEND_LIST,
        value: val
    }
}

export function setNewest(val) {
    return {
        type: TYPE.SET_NEWEST_LIST,
        value: val
    }
}

export function setAlbum(val) {
    return {
        type: TYPE.SET_ALBUM_LIST,
        value: val
    }
}

export function setCurrentSong(val) {
    return {
        type: TYPE.SET_CURRENTSONG_INFO,
        value: val
    }
}

export function setPlayUiPage(val) {
    return {
        type: TYPE.SET_PLAY_UI_PAGE,
        value: val
    }
}

export function setSongInfo(val) {
    return {
        type: TYPE.SET_SONG_INFO,
        value: val
    }
}

export function setPlayState(val) {
    return {
        type: TYPE.SET_PLAY_STATE,
        value: val
    }
}

export function setVolume(val) {
    return {
        type: TYPE.SET_VOLUME,
        value: val
    }
}

export function setPlayOrder(val) {
    return {
        type: TYPE.SET_PLAYORDER,
        value: val
    }
}

export function setPlayList(val) {
    return {
        type: TYPE.SET_PLAYLIST,
        value: val
    }
}

export function setLocalPlayList(val) {
    return {
        type: TYPE.SET_LOCALPLAYLIST,
        value: val
    }
}

export function setShuffleList(val) {
    return {
        type: TYPE.SET_SHUFFLELIST,
        value: val
    }
}