import { IonItem, IonInput, IonContent, IonGrid, IonRow, IonCol, IonSegment, IonLabel, IonButton } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Task.css';
import { Spring } from 'react-spring/renderprops'
import OutsideClickHandler from 'react-outside-click-handler';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import * as chrono from 'chrono-node';
import Select from 'react-select'


const autoBind = require('auto-bind/react');

class Task extends Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = { expanded: false, dueDate: new Date(), deferDate: new Date()}
        this.me = React.createRef();
    }

    /* GOAL!! State updates trigger DB updates. No need to call DB updates manually. */

    toggleTask = () => this.setState(state => ({expanded: !state.expanded}));
    closeTask = () => this.setState({expanded: false});

    render() {
        return (
            <OutsideClickHandler
                onOutsideClick={this.closeTask}
                
            >
            <div>
                <Spring
                    from={{
                        taskHeight:38, 
                        taskMargin: "2px 8px", 
                        taskBackground:"", 
                        taskPadding: 3,
                        doEdit: 0
                    }}
                    to={{
                        taskHeight:this.state.expanded?145:38, 
                        taskMargin:this.state.expanded?"15px 25px":"2px 8px", 
                        taskBackground:this.state.expanded?"var(--task-feature)":"", 
                        taskPadding: this.state.expanded?10:3,
                        doEdit: this.state.expanded?1:0
                    }}
                    config={{
                        tension: 200,
                        friction: 20,
                        mass: 1
                    }}
                >
                {animatedProps => {
                    return (
                        <div className={"task "+(this.state.expanded?"expanded":"collapsed")} ref={this.me} style={{minHeight: animatedProps.taskHeight, margin: animatedProps.taskMargin, background:animatedProps.taskBackground, padding: animatedProps.taskPadding}}>
                            <div style={{display: "inline-block", transform: "translateY(-1px)"}}>
                                <input type="checkbox" id={"task-check-"+this.props.tid} className="task-check" onChange={()=>{console.log("OMOOB!")}}/>
                                <label className="task-pseudocheck" id={"task-pseudocheck-"+this.props.tid} htmlFor={"task-check-"+this.props.tid}>&zwnj;</label>
                            </div>
                            <input value={"apple pie"} placeholder={"Task Name"} onChange={()=>{}} onFocus={()=>{ if(!this.state.expanded) this.toggleTask() }} className="task-name" type="text" autoComplete="off" placeholder="LOCALIZE: Task Name"></input>

                                <Spring
                                    from={{
                                        taskEditDisplay: "none",
                                        taskEditOpacity: 0,
                                    }}
                                    to={{
                                        taskEditDisplay: animatedProps.doEdit > 0.6?"block":"none",
                                        taskEditOpacity: animatedProps.doEdit > 0.6?1:0,
                                    }}
                                    config={{
                                        tension: 200,
                                        friction: 20,
                                        mass: 1
                                    }}
                                >
                                    {animatedEditProps => {
                                        return (
                                            <div className="task-edit" style={{display: animatedEditProps.taskEditDisplay, opacity: animatedEditProps.taskEditOpacity}}>
                                                <textarea placeholder="LOCALIZE:Description" className="task-desc" style={{marginBottom: 10}}>
                                                </textarea>

                                                <div style={{display: "inline-block"}}>
                                                    <div className="task-icon" style={{borderColor: "var(--task-icon)"}}><a className="fas fa-flag" style={{margin: 3, color: "var(--task-icon)", fontSize: 13, transform: "translate(2.5px, -0.5px)"}}></a></div>
                                                    <div className="task-icon" style={{borderColor: "var(--task-icon)", marginRight: 20}}><a className="fas fa-globe-americas" style={{margin: 3, color: "var(--task-icon)", fontSize: 13, transform: "translate(2.5px, -0.5px)"}}></a></div>
                                                </div>
                                                <Select 
                                                    options={[
                                                        {value: "yah", label: "noh"},
                                                        {value: "kyah", label: "pnoh"}
                                                    ]}
                                                    className='task-project'
                                                    classNamePrefix='task-project'
                                                    isClearable
                                                    styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
                                                    menuPortalTarget={this.me.current}
                                                />

                                                <div style={{display: "inline-block"}}>

                                                    <div style={{display: "inline-block", marginRight: 10, marginBottom: 5, marginLeft: 6}}>
                                                        <i className="far fa-play-circle" style={{transform: "translateY(1px)", marginRight: 10, color: "var(--task-icon)"}}></i>
                                                        {(() => {
                                                            const DateInput = ({ value, onClick }) => { 
                                                                return (
                                                                    <input className="task-datebox" defaultValue={value} onChange={()=>{}} onKeyPress={e => {
                                                                        let d = chrono.parseDate(e.target.value);
                                                                        if (d) console.log(d);
                                                                        if (d && e.key === "Enter") this.setState({deferDate: d});
                                                                    }} onFocus={(e) => {
                                                                        onClick();
                                                                        e.target.focus();
                                                                    }}
                                                                    />
                                                                );
                                                            };
                                                            const TimeInput = ({ value, onChange }) => {
                                                                if (value.slice(value.length-2, value.length) === ":0") value = value + "0";
                                                                // TODO: calling complex string ops to fix an interface bug not a good idea?
                                                                return (
                                                                    <input
                                                                        className="task-timebox"
                                                                        defaultValue={value}
                                                                        onKeyPress={e => {
                                                                            let d = chrono.parseDate(e.target.value); //TODO bad?
                                                                            if (d && e.key === "Enter") onChange(d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());
                                                                        }}
                                                                    />
                                                                )};
                                                            return (
                                                                <DatePicker
                                                                    selected={this.state.deferDate}
                                                                    onChange={date => this.setState({deferDate: date})}
                                                                    showTimeInput
                                                                    isClearable
                                                                    dateFormat="MM/dd/yyyy h:mm aa"
                                                                    customTimeInput={<TimeInput />}
                                                                    customInput={<DateInput />}
                                                                />
                                                            )
                                                        })()}
                                                    </div>

                                                    <div style={{display: "inline-block", marginBottom: 5, marginLeft: 6}}>
                                                        <i className="far fa-stop-circle" style={{transform: "translateY(1px)", marginRight: 10, color: "var(--task-icon)"}}></i>
                                                        {(() => {
                                                            const DateInput = ({ value, onClick }) => { 
                                                                return (
                                                                    <input className="task-datebox" defaultValue={value} onChange={()=>{}} onKeyPress={e => {
                                                                        let d = chrono.parseDate(e.target.value);
                                                                        if (d) console.log(d);
                                                                        if (d && e.key === "Enter") this.setState({dueDate: d});
                                                                    }} onFocus={(e) => {
                                                                        onClick();
                                                                        e.target.focus();
                                                                    }}
                                                                    />
                                                                );
                                                            };
                                                            const TimeInput = ({ value, onChange }) => {
                                                                if (value.slice(value.length-2, value.length) === ":0") value = value + "0";
                                                                // TODO: calling complex string ops to fix an interface bug not a good idea?
                                                                return (
                                                                    <input
                                                                        className="task-timebox"
                                                                        defaultValue={value}
                                                                        onKeyPress={e => {
                                                                            let d = chrono.parseDate(e.target.value); //TODO bad?
                                                                            if (d && e.key === "Enter") onChange(d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());
                                                                        }}
                                                                    />
                                                                )};
                                                            return (
                                                                <DatePicker
                                                                    selected={this.state.dueDate}
                                                                    onChange={date => this.setState({dueDate: date})}
                                                                    showTimeInput
                                                                    isClearable
                                                                    dateFormat="MM/dd/yyyy h:mm aa"
                                                                    customTimeInput={<TimeInput />}
                                                                    customInput={<DateInput />}
                                                                />
                                                            )
                                                        })()}
                                                    </div>
                                                </div>

                                            </div>
                                        )
                                    }}
                                </Spring>
                        </div>
                    )}
                } 
                </Spring>
            </div>
        </OutsideClickHandler>

        )
    }
}

export default Task;

