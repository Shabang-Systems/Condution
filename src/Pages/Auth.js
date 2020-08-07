import React, { Component } from 'react';
import Engine from '../backend/CondutionEngine';
import { Plugins } from '@capacitor/core';
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import "firebase/analytics";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

import './Auth.css';

const { Storage } = Plugins;

class Auth extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div id="auth-content-wrapper">
                <div id="auth-left-menu">
                    <div className="menu-area" style={{height:"100%"}}>
                        <div className="auth-component"></div>
                        <div className="auth-component"></div>
                        <span id="auth-image-credit">Image by <span style={{fontWeight: 500}}>Tobias Keller/Paweł Czerwiński</span></span>
                    </div>
                </div>
                <div id="authwall">
                    <h1 id="greeting-auth">Hello</h1><span id="welcome-auth-msg">Welcome to Condution.</span>
                    <h3 className="greeting-auth-subtitle" id="greeting-auth-normal">Good to see you. Please sign in or tap Use Locally.</h3>
                    <div id="name-tray" style={{display:"none"}}>
                        <input className="auth-upf" id="name" type="text" autoComplete="off" defaultValue="" placeholder="What should we call you?" />
                    </div>
                    <input className="auth-upf" id="email" type="email" autoComplete="off" defaultValue="" placeholder="Email" />
                        <input className="auth-upf" id="password" type="password" autoComplete="off" defaultValue="" placeholder="Password" />
                    <br />
                    <span id="need-verify">Verify your email, then proceed!</span>
                    <span id="recover-password">Recover Password</span>
                    <div id="auth-actiongroup">
                        <div id="newuser">Make an account</div>
                        <div id="login"><i className="fas fa-snowboarding" style={{paddingRight: "5px"}}></i><span id="login-text">Let's Do This!</span></div>
                        <div className="convert-src" id="ulac">Use Locally</div>
                    </div>
                </div>
            </div>
      );
    }
}

export default Auth;
