import React from 'react';

export default class BarLoading extends React.Component {
    constructor() {
        super();
    }

    render() {
        return(
            <div className="progress-bar-root">
                <div className="progress-bar-bar">
                    <div className="progress-bar-item react-uwp-progress-bar_4000-item-0"></div>
                    <div className="progress-bar-item react-uwp-progress-bar_4000-item-1"></div>
                    <div className="progress-bar-item react-uwp-progress-bar_4000-item-2"></div>
                    <div className="progress-bar-item react-uwp-progress-bar_4000-item-3"></div>
                    <div className="progress-bar-item react-uwp-progress-bar_4000-item-4"></div>
                </div>
            </div>
        )
    }
}