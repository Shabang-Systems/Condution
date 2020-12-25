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
                    <div className="auth-subtitle">Good to see you! Where is your Condution database?</div>
                    <div style={{marginTop: 10}}>
                        <GuttedTask tid="0" name={"🌐 In the cloud"} localizations={props.localizations} complete={()=>{
                        }}/>
                        <GuttedTask tid="1" name={"💾 On your device"} localizations={props.localizations} complete={()=>{
                        }}/>

                    </div>
                </div>
                <div className="auth-copyright">
                    ©2020 Shabang Systems, LLC and the Condution Authors. An open source project licensed under <a href="https://www.gnu.org/licenses/gpl-3.0.en.html">GPL v3.0</a> with a cloud database governed by our <a>TOS</a> and <a>Privacy Policy</a>.
                </div>
            </animated.div>
        </div>
    )
}

export default Auth;

