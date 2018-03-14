/**
 * Created by maikuraki on 2017/11/4.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import {remote} from 'electron';

export default class App extends React.Component {
    constructor() {
        super();
        this.state = {

        };
    }

    render() {
        return (
            <Router>
                <div className="wrap">
                    这里是英语
                </div>
            </Router>
        )
    }
}