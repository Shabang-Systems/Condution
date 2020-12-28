import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import '../Pages.css';
import Lottie from 'react-lottie';


const autoBind = require('auto-bind/react');
const LoadSpinner = require('../../static/onboarding.json');

const defaultOptions = {
    loop: true,
    autoplay: true, 
    animationData: LoadSpinner,
    rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice',
    }
};



function Spinner(props) {
    return (
        <div style={{marginRight: 20, display: props.ready?"none":"block", position: "relative"}}>
            <Lottie options={defaultOptions}
                height={200}
                width={200}
                isStopped={false}
                isPaused={false}
                speed={2}
                style={{margin: "-40px auto"}}
            />
            <div style={{margin: "0 auto", width: "100%", textAlign: "center", transform: "translate(-12px, -10px)", color: "var(--decorative-light-alt)", fontWeight: 600}}>Loading...</div>
        </div>
    )
}

export default Spinner;

