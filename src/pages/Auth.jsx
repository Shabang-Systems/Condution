import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { useState, useEffect } from 'react';
import {useSpring, animated} from 'react-spring'

import * as firebase from "firebase/app";
import "firebase/auth";

import './Pages.css';
import './Auth.css';

import dark_preload from '../static/auth-background.jpg';
import light_preload from '../static/auth-background-dark.jpg';

import GuttedTask from './Components/GuttedTask';

const autoBind = require('auto-bind/react');


function Auth(props) {
    let [majorMode, setMajorMode] = useState(props.startOnForm ? 1 : 0); // 0=>nada, 1=>firebase, 2=> hard
    let [minorMode, setMinorMode] = useState(props.startOnForm ? 1 : 0); // 0=>default/auth, 1=>create, 2=>create in progress, 3=>recovery, 4=>recovery in progress, 5=>need verify email

    let [name, setName] = useState("");
    let [email, setEmail] = useState("");
    let [password, setPassword] = useState("");

    let [regularMessage, setRegularMessage] = useState(props.localizations.auth_regular_message);
    let [specialMessage, setSpecialMessage] = useState(props.localizations.auth_special_message);
    let [recoveryMessage, setRecoveryMessage] = useState(props.localizations.auth_recovery_message);

    let greetings = props.localizations.greetings_setB;
    let [currentGreeting, _] = useState(greetings[Math.floor(Math.random() * greetings.length)]);

    let greeting = name==""?currentGreeting:name+", ";

    let emailBox = React.createRef();
    let passwordBox = React.createRef();

    function takeAction() {
        switch (majorMode) {
            case 1:
                switch (minorMode) {
                    case 0:
                        props.cm.auth.authenticate({requestType:"email_pass", payload: { email, password }}).then((res) => {
                            if (res.actionSuccess)
                                props.dispatch({service: "firebase", operation: "login"});
                            else if (res.payload.code === "email_verification_needed")
                                setRegularMessage(props.localizations.auth_email_unverified_message);
                            else
                                setRegularMessage(res.payload.msg);
                        });
                        break;
                    case 1:
                        props.cm.auth.createUser({payload: { email, password, displayName: name }}).then((res) => {
                            if (res.actionSuccess) {
                                // TODO onboarding
                                setSpecialMessage(props.localizations.auth_verification_message);
                                setMinorMode(2);
                            } else {
                                setSpecialMessage(res.payload.msg);
                            }
                        });
                        break;
                    case 2:
                        props.cm.auth.refreshAuthentication().then(() => {
                            props.cm.auth.currentUser.then((user) => {
                                if (user.emailVerified)
                                    props.dispatch({service: "firebase", operation: "create"});
                                else
                                    setSpecialMessage(props.localizations.auth_verification_check_message);
                            });
                        });
                        break;
                    case 3:
                        let recProblem = false;
                        firebase.auth().sendPasswordResetEmail(email).catch(function(error) {
                            setRecoveryMessage(error.message);
                            recProblem=true;
                        }).then(function() {
                            if (!recProblem) {
                                setRecoveryMessage(props.localizations.auth_recovery_check_message);
                                setMinorMode(4);
                            }
                        }); break;

                }; break;
        }
    }

    return (
        <div className="auth-backdrop">
            <animated.div className="auth-container">
                <div className="auth-story">
                    <div className="auth-greeting">{greeting} <span className="auth-welcome">Welcome to Condution</span></div>
                    <div className="auth-subtitle">
                        {(()=>
                            {
                                switch (majorMode) {
                                    case 0:
                                        return <><span style={{display: "inline-block"}}>Good to see you back!</span> <span style={{display: "inline-block"}}>Where shall we connect to Condution?</span></>;
                                    case 1:
                                            return <><span style={{display: "inline-block"}} className="auth-message">
                                                {(()=>{
                                                    switch (minorMode) {
                                                        case 0:
                                                            return regularMessage;
                                                        case 1:
                                                        case 2:
                                                            return specialMessage;
                                                        case 3:
                                                        case 4:
                                                            return recoveryMessage;
                                                    }
                                                })()}</span></>
                                }
                            }
                        )()}
                    </div>
                    <div style={{marginTop: 15}}>
                        {(()=>
                            {
                                switch (majorMode) {
                                    case 0:
                                        return (
                                            <>
                                                <div className="auth-click-button" onClick={()=>{
                                                    props.cm.useProvider("firebase");
                                                    setMajorMode(1)
                                                }}>🌐  in the cloud</div>
                                                <div className="auth-click-button" onClick={()=>props.dispatch({service: "json", operation: "login"})}>💾  on your device</div>
                                            </>
                                        );
                                    case 1:
                                            return (
                                                <>
                                                    <div className="auth-containerbox" style={{display: (minorMode == 1) || (minorMode == 2) ? "flex" : "none"}}><i className="fas fa-signature auth-symbol" style={{paddingRight: 12}}/><input className="auth-upf" id="name" type="text" onKeyDown={(event)=>{if(event.key==="Enter") emailBox.current.focus() }} autoComplete="off" value={name} placeholder={props.localizations.what_should_we} value={name} onChange={(e)=>setName(e.target.value)} /></div>
                                                    <div className="auth-containerbox"><i className="fas fa-envelope auth-symbol" /><input className="auth-upf" id="email" ref={emailBox} type="email" autoComplete="off" onKeyDown={(event)=>{if(event.key==="Enter") {if (minorMode !== 3) passwordBox.current.focus(); else takeAction()}}} placeholder={props.localizations.email} value={email} onChange={(e)=>setEmail(e.target.value)}  /></div>
                                                    <div className="auth-containerbox" style={{display: (minorMode==3) || (minorMode == 4) ? "none" : "flex"}}><i className="fas fa-unlock-alt auth-symbol" /><input ref={passwordBox} onKeyDown={(event)=>{if(event.key==="Enter") takeAction() }} className="auth-upf" id="password" type="password" autoComplete="off" placeholder={props.localizations.password} value={password} onChange={(e)=>setPassword(e.target.value)}  /></div>
                                                    <div className="auth-opbar">
                                                        <div style={{transform: "translateX(-9px)"}}>
                                                            <div className="auth-action" onClick={()=>{(minorMode==1 || minorMode==2) ? setMinorMode(0) : setMinorMode(1)}}>{(minorMode==1 || minorMode==2) ? "Login" : "New Account"}</div>
                                                            <div className="auth-action" onClick={()=>{(minorMode==3 || minorMode==4) ? setMinorMode(0) : setMinorMode(3)}}>{(minorMode==3 || minorMode==4) ? "Login" : "Forgot Password?"}</div>
                                                        </div>
                                                        <div>
                                                            <div className="auth-action auth-action-primary" onClick={takeAction}><i className="fas fa-snowboarding auth-symbol" style={{paddingRight: 10, color: "var(--content-normal)"}}/>Proceed!</div> <br />
                                                            <div className="auth-action" style={{display: "block", float:"right", paddingRight: 1, paddingTop: 5}} onClick={()=>{setName(""); setEmail(""); setPassword(""); setMajorMode(0); setMinorMode(0)}}><i className="fas fa-caret-left auth-symbol" style={{paddingRight: 5}}/>Back</div>
                                                        </div>
                                                    </div>
                                                </>
                                            );
                                }
                            })()}
                    </div>
                </div>
                <div className="auth-copyright">
                    <span syle={{display: "inline-block", paddingLeft: 10, paddingRight: 10}}>©2020 Shabang Systems, LLC & the Condution Authors.</span><span syle={{display: "inline-block"}}> Licensed under <a href="https://www.gnu.org/licenses/gpl-3.0.en.html">GPL v3.0</a> with a cloud database also governed by our <a href="https://www.condution.com/privacy.html">Privacy Policy</a>.</span>
                </div>
            </animated.div>
            <img rel="preload" src={light_preload} style={{display: "none"}} />
            <img rel="preload"  src={dark_preload} style={{display: "none"}} />
            <div className="auth-not-actually-a-clearfix">&nbsp;</div>

        </div>
    )
}

export default Auth;

