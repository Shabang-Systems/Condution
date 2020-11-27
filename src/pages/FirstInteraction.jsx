import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Pages.css';
import './FirstInteraction.css';

import FIImage from '../static/firstinteraction.png';

const autoBind = require('auto-bind/react');

function FirstInteraction(props) {
    return (
        <div className="first-interaction-container">
            <div style={{width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: 10}}>
                <div className="first-interaction-name">
                </div>

                <div className="first-interaction-callout">
                    The <br /> Condution  <br /> Project <br />
                </div>
            </div>
            <div className="first-interaction-actions">
            </div>
        </div>
    )
}

export default FirstInteraction;

