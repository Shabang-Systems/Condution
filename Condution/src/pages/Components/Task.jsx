import { IonItem, IonInput, IonContent, IonGrid, IonRow, IonCol } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Task.css';
import { Spring } from 'react-spring/renderprops'
import OutsideClickHandler from 'react-outside-click-handler';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";


const autoBind = require('auto-bind/react');

class Task extends Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = { expanded: false, dueDate: new Date()}
    }

    /* GOAL!! State updates trigger DB updates. No need to call DB updates manually. */

    toggleTask = () => this.setState(state => ({expanded: !state.expanded}));
    closeTask = () => this.setState({expanded: false});

    render() {
        return (
            <OutsideClickHandler
                onOutsideClick={this.closeTask}
            >
            <Spring
                from={{
                    taskHeight:38, 
                    taskMargin: "2px 8px", 
                    taskBackground:"", 
                    taskPadding: 3,
                    taskEditDisplay: "none",
                    taskEditOpacity: 0,
                }}
                to={{
                    taskHeight:this.state.expanded?150:38, 
                    taskMargin:this.state.expanded?"15px 25px":"2px 8px", 
                    taskBackground:this.state.expanded?"var(--task-feature)":"", 
                    taskPadding: this.state.expanded?10:3,
                    taskEditDisplay: this.state.expanded?"block":"none",
                    taskEditOpacity: this.state.expanded?1:0,
                }}
                config={{
                    tension: 200,
                    friction: 20,
                    mass: 1
                }}
            >
            {animatedProps => {
                return (
                    <div className={"task "+(this.state.expanded?"expanded":"collapsed")} style={{height: animatedProps.taskHeight, margin: animatedProps.taskMargin, background:animatedProps.taskBackground, padding: animatedProps.taskPadding}}>
                        <div style={{display: "inline-block", transform: "translateY(-1px)"}}>
                            <input type="checkbox" id={"task-check-"+this.props.tid} className="task-check" onChange={()=>{console.log("OMOOB!")}}/>
                            <label className="task-pseudocheck" id={"task-pseudocheck-"+this.props.tid} htmlFor={"task-check-"+this.props.tid}>&zwnj;</label>
                        </div>
                        <input value={"apple pie"} placeholder={"Task Name"} onChange={()=>{}} onClick={()=>{ if(!this.state.expanded) this.toggleTask() }} className="task-name" type="text" autoComplete="off" placeholder="LOCALIZE: Task Name"></input>
                            <div className="task-edit" style={{display: animatedProps.taskEditDisplay, opacity: animatedProps.taskEditOpacity}}>
                                <textarea placeholder="LOCALIZE:Description" className="task-desc">
                                </textarea>
                                    <DatePicker
                                      selected={new Date()}
                                      onChange={date => console.log(date)}
                                      showTimeInput
                                      isClearable
                                      dateFormat="MM/dd/yyyy h:mm aa"
                                      //customTimeInput={<ExampleCustomTimeInput />}
                                      //customInput={<ExampleCustomTimeInput />}
                                    />
                            </div>
                    </div>
                )}
            } 
            </Spring>
        </OutsideClickHandler>

        )
    }
}

export default Task;

