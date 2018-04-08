import React from 'react';
import {Link} from 'react-router-dom';
import store from '../store';
import * as Actions from '../actions';
import * as constStr from "../lib/const";
import eventEmitter from "../lib/eventEmitter";

export default class AblumSearch  extends React.Component {
    constructor() {
        super();
    }

    componentDidMount() {
    }

    render() {
        let data = this.props.data || [];
        return (
            <div className="album">
                <div className="item-list">
                    {
                        data.map((data, k) => {
                            return(
                                <Link to={`/albumDetail/${data.id}`} key={k}>
                                <div className="album-itembox clearfix">
                                    <div className="cover">
                                        <img src={data.picUrl}/>
                                    </div>
                                    <div className="info">
                                        <div className="name">{data.name}</div>
                                        <div className="singer">{data.artist.name}</div>
                                    </div>
                                </div>
                                </Link>
                            )
                        })
                    }

                </div>
            </div>
        )
    }
}