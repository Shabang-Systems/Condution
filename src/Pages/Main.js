import React, { Component } from 'react';
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";

import $ from "jquery";


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
                </div>
                <div id="content-area" class="scrollable">
                </div>
            </div>
      );
    }
}

export default Main;

