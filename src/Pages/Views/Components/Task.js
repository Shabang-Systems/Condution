import React, { Component } from 'react';
import { Plugins } from '@capacitor/core';
// Firebase App (the core Firebase SDK) is always required and must be listed first

import $ from "jquery";


import './Task.css';

const autoBind = require('auto-bind/react');

const { Storage } = Plugins;

class Task extends Component {
    constructor(props) {
        super(props);

        this.state = {};
        autoBind(this);
    }

    componentDidMount() {
    }

    render() {
        return (
            <div>baaaario</div>
        );
    }
}

export default Task;
