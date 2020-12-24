import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import {useSpring, animated} from 'react-spring'

import './Pages.css';
import './Auth.css';

const autoBind = require('auto-bind/react');


function Auth(props) {
    return (
        <div className="auth-backdrop">
            <div className="auth-not-actually-a-clearfix">&nbsp;</div>
            <animated.div className="auth-container">
                <div className="auth-story">
                    boom
                </div>
            </animated.div>
        </div>
    )
}

export default Auth;

