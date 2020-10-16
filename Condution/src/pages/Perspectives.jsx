import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Perspectives.css'
import './Pages.css';

import Task from './Components/Task';

const autoBind = require('auto-bind/react');

class Perspectives extends Component {
    render() {
        console.log(this.props);
        return (
            <IonPage>
                <IonContent>
                    DONT USE ME. I AM DUMB
                </IonContent>
            </IonPage>
        )
    }
}

export default Perspectives;

