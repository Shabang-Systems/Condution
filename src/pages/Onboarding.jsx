import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Pages.css';

const autoBind = require('auto-bind/react');

function Onboarding(props) {
    return (
        <div style={{width: "100%", height: "100%", position: "absolute", display: "flex", justifyContent: "center", alignItems: "center", color:"var(--content-normal-accent)"}}>
            <div style={{background: "var(--background-feature)", marginRight: 40}}>
                TODO TODO TODO <br /> Pretend that I am a cool animation
            </div>
            <div style={{marginRight: 20}}>
                <b style={{color: "var(--content-normal-alt)", fontSize: 25}}>{props.localizations.setting_up_callout} 🏃</b> <br />
                {props.localizations.setting_up_action} <br /> 
                <span style={{fontWeight: 600, marginTop: 20, display: "inline-block"}}>🚄 {props.localizations.setting_up_hold}</span> <br /> 
            </div>
        </div>
    )
}

export default Onboarding;

