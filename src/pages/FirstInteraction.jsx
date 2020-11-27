import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component, useState } from 'react';
import './Pages.css';
import './FirstInteraction.css';

import GuttedTask from './Components/GuttedTask';

import {Spring, animated, config} from 'react-spring/renderprops'

import logo from '../static/logo.png';

const autoBind = require('auto-bind/react');

function FirstInteraction(props) {
    let [isSignup, setIsSignup] = useState(false);
    return (
        <div className="first-interaction-container">
            <div style={{width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexDirection: "column", paddingTop: "min(env(safe-area-inset-top), 35px)", paddingLeft: 10, paddingRight: 10, paddingBottom: 10, flexGrow: 10}}>
                <div className="first-interaction-logo"><img src={logo} width={25} style={{marginBottom: 1, marginRight: 10, transform: "translateY(-1px)"}}/>Condution Project</div>
                <div className="first-interaction-callout">
                    Tasks? Done.
                </div>
            </div>
            <div className="first-interaction-actions">
                <div className="first-interaction-action-container">
                    <Spring native config={config.stiff} to={{opacityA: isSignup?0:1, opacityB: isSignup?1:0, displayA: isSignup?"none":"block", displayB: isSignup?"block":"none"}}>{styles=>
                    <>
                    <animated.div style={{opacity: styles.opacityB, display: styles.displayB}}>
                        <div className="selection-choices">
                            <GuttedTask tid="0" name="test" localizations={props.localizations} complete={()=>{
                            }}/>
                            <GuttedTask tid="1" name="botp" localizations={props.localizations} complete={()=>{
                            }}/>
                        </div>
                    </animated.div>
                    <animated.div style={{opacity: styles.opacityA, display: styles.displayA}}>
                        <div className="first-interaction-right-callout-a">{props.localizations.onboarding_howdy}</div><div className="first-interaction-right-callout-b">👋 {props.localizations.onboarding_welcome}</div>
                        <div className="first-interaction-right-callout-c">{props.localizations.onboarding_quick_things}</div>
                        <div className="first-interaction-onboarding-action first-interaction-button" onClick={()=>{
                            setIsSignup(true);
                        }}>Let's get started</div>
                        <a className="first-interaction-onboarding-login first-interaction-button" onClick={()=>{
                        }}>I have an account</a>
                    </animated.div>
                    </>}
                    </Spring>
                </div>
            </div>
        </div>
    )
}

export default FirstInteraction;

