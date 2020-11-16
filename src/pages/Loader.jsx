import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import Lottie from 'react-lottie';
import './Pages.css';

const LoadSpinner = require('../static/load.json');

console.log(LoadSpinner);

const autoBind = require('auto-bind/react');

const defaultOptions = {
    loop: true,
    autoplay: true, 
    animationData: LoadSpinner,
    rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
    }
};

function Loader(props) {
    return (
        <div style={{width: "100%", height: "100%", position: "absolute", display: "flex", justifyContent: "center", alignItems: "center"}}>
            <Lottie options={defaultOptions}
                height={50}
                width={50}
                isStopped={false}
                isPaused={false}
            />
            <div style={{position: "absolute", bottom: 15, color: "var(--decorative-light-alt)", fontSize: 11}}>
                ©2019-2020 Shabang Systems, LLC and the Condution Authors. Software released under GNU-GPLv3.
            </div>
        </div>
    )
}

export default Loader;

