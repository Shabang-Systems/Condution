import { IonItem, IonInput, IonContent, IonGrid, IonRow, IonCol } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Task.css';
import { Spring } from 'react-spring/renderprops'
import OutsideClickHandler from 'react-outside-click-handler';


const autoBind = require('auto-bind/react');

class Task extends Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {expanded: false}
    }

    toggleTask = () => this.setState(state => ({expanded: !state.expanded}));

    render() {
        return (
            <OutsideClickHandler

                      onOutsideClick={this.toggleTask}
            >
            <Spring
                from={{taskHeight:0, background:"red"}}
                to={{taskHeight:this.state.expanded?250:0, background:this.state.expanded?"blue":"red"}}
            >
            {animatedProps => {
                return (
                    <div className={"task "+(this.state.expanded?"expanded":"collapsed")} style={{height: animatedProps.taskHeight, background: animatedProps.background}}>
                        <div style={{display: "inline-block", transform: "translateY(-1px)"}}>
                            <input type="checkbox" id={"task-check-"+this.props.id} className="task-check" onChange={()=>{console.log("OMOOB!")}}/>
                            <label className="task-pseudocheck" id={"task-pseudocheck-"+this.props.id} htmlFor={"task-check-"+this.props.id}>&zwnj;</label>
                        </div>
                        <input value={"apple pie"} placeholder={"Task Name"} onChange={()=>{}} onClick={()=>{ if(!this.state.expanded) this.toggleTask() }} className="task-name" type="text" autoComplete="off" placeholder="Task Name"></input>
                    </div>
                )}
            } 
            </Spring>
                    </OutsideClickHandler>

        )
    }
}

export default Task;

