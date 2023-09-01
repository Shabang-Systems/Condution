import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet } from '@ionic/react';
import React, { Component } from 'react';
import './Pages.css';
import Lottie from 'react-lottie';

const autoBind = require('auto-bind/react');
const LoadSpinner = require('../static/onboarding.json');

const defaultOptions = {
    loop: true,
    autoplay: true, 
    animationData: LoadSpinner,
    rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice',
    }
};

function Onboarding(props) {
    return (
        <div style={{width: "100%", height: "100%", position: "absolute", display: "flex", justifyContent: "center", alignItems: "center", color:"var(--content-normal-accent)", flexWrap: "wrap", flexDirection: "column"}}>
            <div style={{marginRight: 20}}>
                <Lottie options={defaultOptions}
                    height={200}
                    width={200}
                    isStopped={false}
                    isPaused={false}
                    speed={2000}
                />
            </div>
            <div style={{marginRight: 20, marginLeft: 20}}>
                <b style={{color: "var(--content-normal-alt)", fontSize: 25}}>{props.localizations.setting_up_callout} 🏃</b> <br />
                🚄 {props.localizations.setting_up_action} 
                <span style={{fontWeight: 600, marginTop: 20, marginLeft: 10, display: "inline-block"}}>  {props.localizations.setting_up_hold}</span> <br /> 
            </div>
        </div>
    )
}

export default Onboarding;

