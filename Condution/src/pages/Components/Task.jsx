import { IonItem, IonInput, IonContent, IonGrid, IonRow, IonCol } from '@ionic/react';
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
                <div style={{display: "inline-block"}}>
                    <input type="checkbox" id={"task-check-"+this.props.id} className="task-check"/>
                    <label className="task-pseudocheck" id={"task-pseudocheck-"+this.props.id} htmlFor={"task-check-"+this.props.id}>&zwnj;</label>
                </div>
                <input value={"apple pie"} placeholder={"Task Name"} onChange={()=>{}} className="task-name" type="text" autoComplete="off" placeholder="Task Name"></input>
            </div>
        )
    }
}

export default Task;

