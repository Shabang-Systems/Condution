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
    let [minorMode, setMinorMode] = useState(0); // 0=>default/auth, 1=>create, 2=>auth in progress, 3=>recovery, 4=>recovery in progress

    let greetings = props.localizations.greetings_setB;
    let greeting = greetings[Math.floor(Math.random() * greetings.length)];

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
                                        switch (minorMode) {
                                            case 0:
                                                return <input className="auth-upf" id="email" type="email" autoComplete="off" defaultValue="" placeholder={props.localizations.email} />
                                        }
                                }
                            })()}
                    </div>
                </div>
                <div className="auth-copyright">
                    <span syle={{display: "inline-block"}}>©2020 Shabang Systems, LLC and the Condution Authors.</span><span syle={{display: "inline-block"}}> An open source project licensed under <a href="https://www.gnu.org/licenses/gpl-3.0.en.html">GPL v3.0</a> with a cloud database also governed by our <a>Privacy Policy</a>.</span>
                </div>
            </animated.div>
        </div>
    )
}

export default Auth;

