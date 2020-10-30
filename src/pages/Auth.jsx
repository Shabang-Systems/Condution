import React, { Component } from 'react';
import { Plugins } from '@capacitor/core';
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";

import $ from "jquery";


import './Auth.css';


import '../themefiles/condutiontheme-default.css';
import '../themefiles/condutiontheme-default-dark.css';
import '../themefiles/condutiontheme-default-light.css';



const autoBind = require('auto-bind/react');


const { Storage } = Plugins;

class Auth extends Component {
    constructor(props) {
        super(props);

        let greetings = ["Hello,", "Hey,", "Heyo,", "Aloha,", "Yo!"];

        /*
         * mode 0 = login in progress, 
         *      1 = new account in progress,
         *      2 = recovery in progress, 
         *      3 = email unverified,
         *      4 = email verified, proceed create
         *      5 = recovery executed, shepeard them back
         *
         */

        this.state = {
            authMode: 0,
            showExtra: false,
            greeting: greetings[Math.floor(Math.random() * greetings.length)]
        };

        autoBind(this);
    }

    doLogin() {
        let view = this;
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(() => {
            firebase.auth().signInWithEmailAndPassword($("#email").val(), $("#password").val()).then(function() {
                if (firebase.auth().currentUser.emailVerified)
                     view.props.dispatch({service: "firebase", operation: "login"});
                else
                    view.setState({authMode: 3});
            }).catch(function(error) {
                    // Handle Errors here.
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(error);
                    $(".auth-upf").addClass("wrong");
            });
        });
    }

    doCreate() {
        // TODO: actually create the account
        let view = this;
        let problem = false;
        firebase.auth().createUserWithEmailAndPassword($("#email").val(), $("#password").val()).catch(function(error) {
            view.setState({showExtra: true}, ()=>$('#need-verify').html(error.message));
            problem=true;
        }).then(function() {
            if (!problem) {
                firebase.auth().currentUser.sendEmailVerification();
                firebase.auth().currentUser.updateProfile({displayName: $("#name").val()});
                view.setState({authMode: 4, showExtra: true});
            }
        })
    }

    dispatchCreate() {
        firebase.auth().currentUser.reload().then(()=>{;
            if (firebase.auth().currentUser.emailVerified)
                this.props.dispatch({service: "firebase", operation: "create"});
            else
                $('#need-verify').html("Please double-check that you tapped the verification link in your email.");
        });
    }

    doRecover() {
        let problem = false;
        let view = this;
        firebase.auth().sendPasswordResetEmail($("#email").val()).catch(function(error) {
            view.setState({showExtra: true});
            $('#need-verify').html(error.message);
            problem=true;
        }).then(function() {
            if (!problem) {
                view.setState({authMode: 5});
            }
        })
        // TODO: actually recover the account
    }

    doLocal() {
        this.props.dispatch({service: "json", operation: "login"});
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
                    <h1 id="greeting-auth">{this.state.greeting}</h1><span id="welcome-auth-msg">Welcome to Condution.</span>
                    <h3 className="greeting-auth-subtitle" id="greeting-auth-normal">{(()=>{
                        switch (this.state.authMode) {
                            case 2:
                                return "No worries! Let's recover your password.";
                            default:
                                return "Good to see you. Please sign in or tap Use Locally.";

                        }
                    })()}</h3> 
                    <input className="auth-upf" id="name" type="text" autoComplete="off" defaultValue="" placeholder="What should we call you?" style={{display: this.state.authMode === 1 ? "block" : "none"}}/>
                    <input className="auth-upf" id="email" type="email" autoComplete="off" defaultValue="" placeholder="Email" />
                    <input className="auth-upf" id="password" type="password" autoComplete="off" defaultValue="" placeholder="Password" style={{display: this.state.authMode !== 2 ? "block" : "none"}} onKeyPress={(event)=>{
                        if (event.key === "Enter") {
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
                                case 4:
                                    this.dispatchCreate();
                                    break;
                                case 5: 
                                    this.doLogin();
                                    break;
                            }
                        }
                    }}/>
                    {(() => {
                        if (this.state.authMode === 3 || this.state.authMode ===  4 || this.state.authMode === 5 || this.state.showExtra) return <span id="need-verify">
                            {(()=>{
                                switch(this.state.authMode){
                                    case 3:
                                        return "Check and verify your email, then tap Let's Do This!";
                                    case 4:
                                        return "Check and verify your email, then tap Proceed!";
                                    case 5:
                                        return "Check and verify your email, then return to login.";

                            }})()}
                        </span>
                    })()}
                    <span id="recover-password" style={{display: this.state.authMode === 3 ? "none" : "block"}} onClick={()=>{
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
                                case 1:
                                    return this.setState({authMode: 0});
                                default:
                                    return this.setState({authMode: 1});

                            }
                        }}>{(()=>{
                            switch (this.state.authMode) {
                                case 1:
                                    return "Log in";
                                default:
                                    return "Make an account";

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
                                case 4:
                                    this.dispatchCreate();
                                    break;
                            }
                        }}>
                            <i className="fas fa-snowboarding" style={{paddingRight: "5px"}}></i><span id="login-text">{(() => {
                                switch(this.state.authMode) {
                                    case 0:
                                    case 3:
                                        return "Let's Do This!";
                                    case 1:
                                        return "Verify Email!";
                                    case 2:
                                        return "Let's Recover!";
                                    case 4:
                                        return "Proceed!";
                                    case 5:
                                        return "Proceed!";
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
