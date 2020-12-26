import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { useState, useEffect } from 'react';
import {useSpring, animated} from 'react-spring'

import './Pages.css';
import './Auth.css';

import dark_preload from '../static/auth-background.jpg';
import light_preload from '../static/auth-background-dark.jpg';

import GuttedTask from './Components/GuttedTask';

const autoBind = require('auto-bind/react');


function Auth(props) {
    let [majorMode, setMajorMode] = useState(0); // 0=>nada, 1=>firebase, 2=> hard
    let [minorMode, setMinorMode] = useState(0); // 0=>default/auth, 1=>create, 2=>create in progress, 3=>recovery, 4=>recovery in progress

    let [name, setName] = useState("");
    let [email, setEmail] = useState("");
    let [password, setPassword] = useState("");

    let greetings = props.localizations.greetings_setB;
    let [currentGreeting, _] = useState(greetings[Math.floor(Math.random() * greetings.length)]);

    let greeting = name==""?currentGreeting:name+", ";

    return (
        <div className="auth-backdrop">
            <img rel="preload" src={light_preload} style={{display: "none"}} />
            <img rel="preload"  src={dark_preload} style={{display: "none"}} />
            <div className="auth-not-actually-a-clearfix">&nbsp;</div>
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
                                            return <><span style={{display: "inline-block"}}>Let's connect to our cloud database.</span></>
                                }
                            }
                        )()}
                    </div>
                    <div style={{marginTop: 20}}>
                        {(()=>
                            {
                                switch (majorMode) {
                                    case 0:
                                        return (
                                            <>
                                                <div className="auth-click-button" onClick={()=>setMajorMode(1)}>🌐 in the cloud</div>
                                                <div className="auth-click-button" onClick={()=>setMajorMode(2)}>💾 on your device</div>
                                            </>
                                        );
                                    case 1:
                                            return (
                                                <>
                                                    <div className="auth-containerbox" style={{display: (minorMode == 1) || (minorMode == 2) ? "flex" : "none"}}><i className="fas fa-signature auth-symbol" style={{paddingRight: 12}}/><input className="auth-upf" id="name" type="text" autoComplete="off" value={name} placeholder={props.localizations.what_should_we} value={name} onChange={(e)=>setName(e.target.value)} /></div>
                                                    <div className="auth-containerbox"><i className="fas fa-envelope auth-symbol" /><input className="auth-upf" id="email" type="email" autoComplete="off" placeholder={props.localizations.email} value={email} onChange={(e)=>setEmail(e.target.value)}  /></div>
                                                    <div className="auth-containerbox" style={{display: (minorMode==3) || (minorMode == 4) ? "none" : "flex"}}><i className="fas fa-unlock-alt auth-symbol" /><input className="auth-upf" id="password" type="password" autoComplete="off" placeholder={props.localizations.password} value={password} onChange={(e)=>setPassword(e.target.value)}  /></div>
                                                    <div className="auth-opbar">
                                                        <div style={{transform: "translateX(-9px)"}}>
                                                            <div className="auth-action">New Account</div>
                                                            <div className="auth-action">Change Database</div>
                                                        </div>
                                                        <div className="auth-action auth-action-primary"><i className="fas fa-child auth-symbol" style={{paddingRight: 10, color: "var(--content-normal)"}}/>Proceed!</div>
                                                    </div>
                                                </>
                                            );
                                }
                            })()}
                    </div>
                </div>
                <div className="auth-copyright">
                    <span syle={{display: "inline-block", paddingLeft: 10, paddingRight: 10}}>©2020 Shabang Systems, LLC & the Condution Authors.</span><span syle={{display: "inline-block"}}> Licensed under <a href="https://www.gnu.org/licenses/gpl-3.0.en.html">GPL v3.0</a> with a cloud database also governed by our <a>Privacy Policy</a>.</span>
                </div>
            </animated.div>
        </div>
    )
}

export default Auth;

