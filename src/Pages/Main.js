import React, { Component } from 'react';
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";

import $ from "jquery";

import Menu from "./Components/Menu";

import './Main.css';

const autoBind = require('auto-bind/react');


class Main extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        autoBind(this);
    }

    render() {
        return (
            <div id="content-wrapper">
                <div id="left-menu">
                    <Menu engine={this.props.engine} uid={this.props.uid}/>
                </div>
                <div id="content-area" className="scrollable">
                </div>
            </div>
      );
    }
}

export default Main;

