import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Upcoming.css';
import './Pages.css';

import Task from './Components/Task';

const autoBind = require('auto-bind/react');

class Upcoming extends Component {
    constructor(props) {
        super(props);

        this.state = {inbox: [], dueSoon: []};

        this.props.gruntman.registerRefresher(this.refresh);

        autoBind(this);
    }

    async refresh() {
        let avail = await this.props.engine.db.getItemAvailability(this.props.uid)
        let pandt = await this.props.engine.db.getInboxandDS(this.props.uid, avail)
        this.setState({inbox: pandt[0], dueSoon: pandt[1]});
    }

    componentDidMount() {
        this.refresh();
    }
    
    render() {
        return (
            <IonPage>
                <IonContent>
                    {this.state.inbox.map(id => (
                        <Task tid={id} uid={this.props.uid} engine={this.props.engine} gruntman={this.props.gruntman}/>
                    ))}
                    <hr />
                    {this.state.dueSoon.map(id => (
                        <Task tid={id} uid={this.props.uid} engine={this.props.engine} gruntman={this.props.gruntman}/>
                    ))}

                </IonContent>
            </IonPage>
        )
    }
}

export default Upcoming;

