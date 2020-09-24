import { IonItem, IonInput, IonContent } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Task.css';

const autoBind = require('auto-bind/react');

class Task extends Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {expanded: false}
    }

    render() {
        return (
            <div className="task collapsed">
                <IonInput value={"apple pie"} placeholder={"Task Name"}></IonInput>
            </div>
        )
    }
}

export default Task;

