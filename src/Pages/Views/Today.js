import React, { Component } from 'react';
import { Plugins } from '@capacitor/core';
// Firebase App (the core Firebase SDK) is always required and must be listed first

import $ from "jquery";


import './Today.css';

const autoBind = require('auto-bind/react');

const { Storage } = Plugins;

class Today extends Component {
    constructor(props) {
        super(props);

        this.state = {inboxTasks: [], dsTasks: [], daterowPosition: 0};
        autoBind(this);
    }

    async fetchData() {
        let avalibility = await this.props.engine.db.getItemAvailability(this.props.uid)
        let inboxAndDS = await this.props.engine.db.getInboxandDS(this.props.uid, avalibility);
        this.setState({inboxTasks: inboxAndDS[0], dsTasks: inboxAndDS[1]});
    }

    componentDidMount() {
        this.fetchData();
    }

    render() {
        return (
            <div>
                <div className="sandwich"><i className="fas fa-bars"></i></div>
                <div className="perspective-title"><i className="fas fa-chevron-circle-right"></i><span id="upcoming-titleword" className="perspective-titleword">Upcoming</span></div>
                <div style={{padding: "0 0 7px 0"}}>
                    <hr className="perspective-divider"/>
                    <div id="upcoming-header"><span id="greeting"></span><span id="greeting-name"></span>&middot;<span id="greeting-date"></span></div>
                            daterow goes here
                </div>
                <hr className="perspective-divider"/>
                <div id="inbox-subhead" className="perspective-subhead">
                   <span id="inbox-titleword-unsorted">Unsorted</span> <div id="unsorted-badge" className="badge" style={{transform: "translate(3px, -2px)"}}></div>
                </div>
                <div id="inbox" className="upcoming-section"> </div>
                <div id="ds-subhead" className="perspective-subhead">
                    <span id="ds-text">Due Soon</span> <div id="duesoon-badge" className="badge" style={{transform: "translate(3px, -2px)"}}>0</div> <div id="ds-daterowfield"><div id="ds-at">@</div> <div id="duesoon-ondate"></div> </div>
                </div>
                <div id="due-soon" className="upcoming-section"> </div>
            </div>
        );
    }
}

export default Today;
