import React, { Component } from 'react';
import Engine from '../backend/CondutionEngine';
import { Plugins } from '@capacitor/core';

import './Auth.css';

const { Storage } = Plugins;

class Auth extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div className="Auth">
                I am auth
            </div>
          );
    }
}

export default Auth;
