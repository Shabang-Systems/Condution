import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Pages.css';
import './FirstInteraction.css';

import logo from '../static/logo.png';

const autoBind = require('auto-bind/react');

function FirstInteraction(props) {
    return (
        <div className="first-interaction-container">
            <div style={{width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexDirection: "column", padding: 10, flexGrow: 10}}>
                <div className="first-interaction-logo"><img src={logo} width={25} style={{marginBottom: 1, marginRight: 10, transform: "translateY(-1px)"}}/>Condution Project</div>
                <div className="first-interaction-callout">
                    Tasks? Done.
                </div>
            </div>
            <div className="first-interaction-actions">
                <div className="first-interaction-action-container">
                    <div className="first-interaction-right-callout-a">{props.localizations.onboarding_howdy}</div><div className="first-interaction-right-callout-b">👋 {props.localizations.onboarding_welcome}</div>
                    <div className="first-interaction-right-callout-c">{props.localizations.onboarding_quick_things}</div>
                </div>
            </div>
        </div>
    )
}

export default FirstInteraction;

