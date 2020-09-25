import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Upcoming.css';
import './Pages.css';

import Task from './Components/Task';

const autoBind = require('auto-bind/react');

class Upcoming extends Component {
    render() {
        return (
            <IonPage>
                <IonContent>
                    <Task tid={"thuanouh3o"} uid={this.props.uid} engine={this.props.engine}/>
                    <Task tid={"aoeunt"} uid={this.props.uid} engine={this.props.engine}/>
                    <Task tid={"aoenaoetuh"} uid={this.props.uid} engine={this.props.engine}/>
                </IonContent>
            </IonPage>
        )
    }
}

export default Upcoming;

