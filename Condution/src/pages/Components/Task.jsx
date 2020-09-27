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
const { parseFromTimeZone } = require('date-fns-timezone')


const autoBind = require('auto-bind/react');

class Task extends Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = { expanded: false, deferDate: undefined, dueDate: undefined, name: "", desc: "", isFlagged: false, isFloating: false, project:"", tags: [], decoration: "", availability: true}
        this.me = React.createRef();
    }

    /* GOAL!! State updates trigger DB updates. No need to call DB updates manually. */

    async loadTask() {
        let taskInfo = await this.props.engine.db.getTaskInformation(this.props.uid, this.props.tid);
        this.setState({
            name: taskInfo.name,
            desc: taskInfo.desc, 
            project: taskInfo.project, 
            tags: taskInfo.tags, 
            isFloating: taskInfo.isFloating, 
            isFlagged: taskInfo.isFlagged, 
            dueDate: (
                taskInfo.due ? 
                    (taskInfo.isFloating ? 
                        new Date(taskInfo.due.seconds*1000) : 
                        parseFromTimeZone(
                            (new Date(taskInfo.due.seconds*1000)).toISOString(), 
                            {timeZone: taskInfo.timezone}
                        )
                    ):
                undefined
            ), 
            deferDate: (
                taskInfo.defer ? 
                    (taskInfo.isFloating ? 
                        new Date(taskInfo.defer.seconds*1000) : 
                            parseFromTimeZone(
                                (new Date(taskInfo.defer.seconds*1000)).toISOString(), 
                                {timeZone: taskInfo.timezone}
                            )
                    ): undefined
            )
        });
        if (this.state.dueDate)
            if (this.state.dueDate-(new Date()) < 0) 
                this.setState({decoration: "od"});
            else if (this.state.dueDate-(new Date()) < 24*60*60*1000) 
                this.setState({decoration: "ds"});
        if (this.state.deferDate)
            if (this.state.deferDate-(new Date()) > 0) 
                this.setState({availability: false});
        else if (this.props.availability === false)
                this.setState({availability: false});
    }

    async componentDidMount() {
        await this.loadTask();    
    }

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
                        taskEditOpacity: 0,
                        taskEditMaxHeight: 0,
                    }}
                    to={{
                        taskHeight:this.state.expanded?38:38, 
                        taskMargin:this.state.expanded?"15px 25px":"2px 8px", 
                        taskBackground:this.state.expanded?"var(--task-feature)":"", 
                        taskPadding: this.state.expanded?10:3,
                        taskEditOpacity: this.state.expanded?1:0,
                        taskEditMaxHeight: this.state.expanded?300:0,
                    }}
                    config={{
                        tension: 200,
                        friction: 25,
                        mass: 1
                    }}
                >
                {animatedProps => {
                    return (
                        <div className={"task "+(this.state.expanded?"expanded":"collapsed")} ref={this.me} style={{minHeight: animatedProps.taskHeight, margin: animatedProps.taskMargin, background:animatedProps.taskBackground, padding: animatedProps.taskPadding}}>
                            <div style={{display: "inline-block", transform: "translateY(-3px)"}}>
                                <input type="checkbox" id={"task-check-"+this.props.tid} className="task-check" onChange={()=>{console.log("OMOOB!")}} style={{opacity: this.state.availability?1:0.35}}/>
                                <label className={"task-pseudocheck "+this.state.decoration} id={"task-pseudocheck-"+this.props.tid} htmlFor={"task-check-"+this.props.tid}>&zwnj;</label>
                            </div>
                            <input value={this.state.name} placeholder={"LOCALIZE: Task Name"} onChange={()=>{}} onFocus={()=>{ if(!this.state.expanded) this.toggleTask() }} className="task-name" readOnly={false} type="text" autoComplete="off" placeholder="LOCALIZE: Task Name" style={{opacity: this.state.availability?1:0.35}}></input>

                                            <div className="task-edit" style={{opacity: animatedProps.taskEditOpacity, overflow: "hidden",maxHeight: animatedProps.taskEditMaxHeight}}>
                                                <textarea placeholder="LOCALIZE:Description" className="task-desc" style={{marginBottom: 10}} defaultValue={this.state.desc}>
                                                    
                                                </textarea>

                                                <div style={{display: "inline-block", marginBottom: 6}}>
                                                    <div className="task-icon" style={{borderColor: this.state.isFlagged ? "var(--task-flaggedRing)":"var(--task-checkbox-feature-alt)"}}><a className="fas fa-flag" style={{margin: 3, color: this.state.isFlagged ? "var(--task-flagged)" : "var(--task-textbox)", fontSize: 13, transform: "translate(2.5px, -0.5px)"}}></a></div>
                                                    <div className="task-icon" style={{borderColor: this.state.isFloating? "var(--task-flaggedRing)":"var(--task-checkbox-feature-alt)", marginRight: 20}}><a className="fas fa-globe-americas" style={{margin: 3, color: this.state.isFloating? "var(--task-flagged)" : "var(--task-textbox)", fontSize: 13, transform: "translate(2.5px, -0.5px)"}}></a></div>
                                                    {/*<div className="task-icon" style={{borderColor: "var(--task-checkbox-feature-alt)", marginRight: 20}}><a className="fas fa-globe-americas" style={{margin: 3, color: "var(--task-textbox)", fontSize: 13, transform: "translate(2.5px, -0.5px)"}}></a></div>*/}
                                                </div>


                                                <div style={{display: "inline-block", marginBottom: 8}}>

                                                    <div style={{display: "inline-block", marginRight: 10, marginBottom: 5, marginLeft: 6}}>
                                                        <i className="fas fa-play" style={{transform: "translateY(-1px)", marginRight: 10, color: "var(--task-icon)", fontSize: 10}}></i>
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
                                                        <i className="fas fa-stop" style={{transform: "translateY(-1px)", marginRight: 10, color: "var(--task-icon)", fontSize: 10}}></i>
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
                                                <div>
                                                    <span className="task-project-container">
                                                        <i className="fas fa-list-ul" style={{margin: 3, color: "var(--task-icon)", fontSize: 13, marginRight: 5}}></i>
                                                        <Select 
                                                            options={this.props.datapack[1]}
                                                            className='task-project'
                                                            classNamePrefix='task-select'
                                                            isClearable
                                                            styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
                                                            menuPortalTarget={this.me.current}
                                                        />
                                                    </span>
                                                    <span className="task-tag-container">
                                                        <i className="fas fa-tags" style={{margin: 3, color: "var(--task-icon)", fontSize: 13}}></i>
                                                        <Select 
                                                            options={this.props.datapack[0]}
                                                            className='task-tag'
                                                            classNamePrefix='task-select'
                                                            isClearable
                                                            isMulti
                                                            styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
                                                            menuPortalTarget={this.me.current}
                                                        />
                                                    </span>
                                                </div>
                                            </div>
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

