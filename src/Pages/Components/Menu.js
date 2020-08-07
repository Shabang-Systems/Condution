import React, { Component } from 'react';
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";

import $ from "jquery";


import './Menu.css';

const autoBind = require('auto-bind/react');


class Menu extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        autoBind(this);
    }

    render() {
        return (
            <div className="menu-area">
                <div>
                    <div id="today" className="today today-highlighted"><i className="fas fa-chevron-circle-right"></i><span style={{paddingLeft:"8px"}} id="upcoming-text-name">Upcoming</span></div>
                    <div id="completed" className="today"><i className="fas fa-check-circle"></i><span style={{paddingLeft:"8px"}} id="completed-text-name">Completed</span></div>
                </div>
                <span className="menu-label">
                    <span id="perspectives-text-name">Perspectives</span> <div className="menu-subicon" id="perspective-add"><i className="fas fa-plus"></i></div>
                </span>
                <div className="perspectives menu-portion scrollable"></div>
                <span className="menu-label">
                    <span id="projects-text-name">Projects</span> <div className="menu-subicon" id="project-add-toplevel"><i className="fas fa-plus"></i></div>
                </span>
                <div className="projects menu-portion scrollable"></div>
                <div id="logout"><i className="fas fa-snowboarding" style={{paddingRight: "5px"}}></i><span id="logout-text-name">Logout</span></div>
            </div>

      );
    }
}

export default Menu;

