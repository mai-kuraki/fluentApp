import React from 'react';

export default class RingLoading extends React.Component {
    constructor() {
        super();
    }

    render() {
        return(
            <div className="progress-ring-root">
                <div>
                    <div className="react-uwp-progress-ring_6_5000-item-0 progress-ring-item"></div>
                    <div className="react-uwp-progress-ring_6_5000-item-1 progress-ring-item"></div>
                    <div className="react-uwp-progress-ring_6_5000-item-2 progress-ring-item"></div>
                    <div className="react-uwp-progress-ring_6_5000-item-3 progress-ring-item"></div>
                    <div className="react-uwp-progress-ring_6_5000-item-4 progress-ring-item"></div>
                    <div className="react-uwp-progress-ring_6_5000-item-5 progress-ring-item"></div>
                </div>
            </div>
        )
    }
}