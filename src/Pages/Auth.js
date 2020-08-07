import React, { Component } from 'react';
import { Plugins } from '@capacitor/core';
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";

import $ from "jquery";


import './Auth.css';

const { Storage } = Plugins;

class Auth extends Component {
    constructor(props) {
        super(props);


        /*
         * mode 0 = login in progress, 
         *      1 = new account in progress, 
         *      2 = recovery in progress, 
         *      3 = email unverified
         *
         */

        this.state = {authMode: 0};
    }

    doLogin() {
        firebase.auth().signInWithEmailAndPassword($("#email").val(), $("#password").val()).then(function() {
            if (firebase.auth().currentUser.emailVerified)
                this.props.dispatch({service: "firebase", operation: "login"});
            else
                this.setState({authMode: 3});
        });
    }

    doCreate() {
        console.log("Doing create");
        this.props.dispatch({service: "firebase", operation: "create"});
    }

    doRecover() {
        console.log("Doing recover");
    }

    doLocal() {
        console.log("Doing local");
        this.props.dispatch({service: "firebase", operation: "login"});
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
                    <h3 className="greeting-auth-subtitle" id="greeting-auth-normal">{(()=>{
                        switch (this.state.authMode) {
                            case 2:
                                return "No worries! Let's recover your password.";
                            default:
                                return "Good to see you. Please sign in or tap Use Locally.";

                        }
                    })()}</h3> 
                    {(() => {
                        if (this.state.authMode === 1) return <input className="auth-upf" id="name" type="text" autoComplete="off" defaultValue="" placeholder="What should we call you?" />
                    })()}
                    <input className="auth-upf" id="email" type="email" autoComplete="off" defaultValue="" placeholder="Email" />
                    {(() => {
                        if (this.state.authMode !== 2) return <input className="auth-upf" id="password" type="password" autoComplete="off" defaultValue="" placeholder="Password" />
                    })()}
                    <br />
                    <span id="need-verify">Verify your email, then proceed!</span>
                    <span id="recover-password" onClick={()=>{
                            switch (this.state.authMode) {
                                case 2:
                                    return this.setState({authMode: 0});
                                default:
                                    return this.setState({authMode: 2});

                            }
                        }}>{(()=>{
                            switch (this.state.authMode) {
                                case 2:
                                    return "Remembered? Login";
                                default:
                                    return "Recover Password";

                            }
                        })()}</span>
                    <div id="auth-actiongroup">
                        <div id="newuser" onClick={()=>{
                            switch (this.state.authMode) {
                                case 0:
                                    return this.setState({authMode: 1});
                                case 1:
                                    return this.setState({authMode: 0});

                            }
                        }}>{(()=>{
                            switch (this.state.authMode) {
                                case 0:
                                    return "Make an account";
                                case 1:
                                    return "Log in";

                            }
                        })()}</div>
                        <div id="login" onClick={()=>{
                            switch (this.state.authMode) {
                                case 0:
                                    this.doLogin();
                                    break;
                                case 1:
                                    this.doCreate();
                                    break;
                                case 2:
                                    this.doRecover();
                                    break;
                            }
                        }}>
                            <i className="fas fa-snowboarding" style={{paddingRight: "5px"}}></i><span id="login-text">{(() => {
                                switch(this.state.authMode) {
                                    case 0:
                                        return "Let's Do This!";
                                    case 1:
                                        return "Verify Email!";
                                    case 2:
                                        return "Let's Recover!";
                                }
                            })()}</span>
                        </div>
                        {(() => {
                            if (this.state.authMode !== 2) return <div className="convert-src" id="ulac" onClick={this.doLocal}>Use Locally</div>
                        })()}
                    </div>
                </div>
            </div>
      );
    }
}

export default Auth;
