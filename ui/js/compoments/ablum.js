import React from 'react';
import {Link} from 'react-router-dom';
import store from '../store';
import * as Actions from '../actions';

export default class Assume  extends React.Component {
    constructor() {
        super();
    }

    componentDidMount() {
        this.getAlbum();
    }

    getAlbum() {
        fetch(`${__REQUESTHOST}/api/top/album`, {
            method: 'GET',
        }).then((res) => {
            return res.json();
        }).then(data => {
            if(data.code == 200) {
                store.dispatch(Actions.setAlbum(data.albums || []));
            }
        })
    }

    render() {
        let albumList = store.getState().main.albumList || [];
        return (
            <div className="album">
                <div className="item-list">
                    {
                        albumList.map((data, k) => {
                            return(
                                <div key={k} className="album-itembox clearfix">
                                    <div className="cover">
                                        <img src={data.picUrl}/>
                                    </div>
                                    <div className="info">
                                        <div className="name">{data.name}</div>
                                        <div className="singer">{data.artist.name}</div>
                                    </div>
                                </div>
                            )
                        })
                    }

                </div>
            </div>
        )
    }
}