// A whole lotta imports

// Ionic components
import { IonItem, IonInput, IonContent, IonGrid, IonRow, IonCol, IonSegment, IonLabel, IonButton } from '@ionic/react';

// Like, your heart and soul
import React, { Component } from 'react';

// React Spring animation packages
import { Spring, animated, Keyframes } from 'react-spring/renderprops'

// Cool components 
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import * as chrono from 'chrono-node';
import Select from 'react-select'

// Our very own repeat UI
import Repeat from './Repeat';

// Our very own CSS
import './Task.css';

// Oooips
import ReactTooltip from 'react-tooltip';

// FNS date parcing utils
const { parseFromTimeZone } = require('date-fns-timezone')

// autobind those functions
const autoBind = require('auto-bind/react');

// Our very own custom animatinos
const AnimationFactory = Keyframes.Spring({
    // Open->close animation
    hide: {
        to: {
            taskHeight:38, 
            taskMargin: "2px 8px", 
            taskBackground:"", 
            taskPadding: 3,
            taskEditOpacity: 0,
            taskEditMaxHeight: 0,
            taskOpacity: 1,
            taskNameDecoration: "",
            taskPosition: "",
            taskDisplay: "",
            taskMaxHeight: 40,
        },
        config: {
            tension: 200,
            friction: 25,
            mass: 1
        },
        reset: false

    },
    // Close->open animation
    show: {
        to: {
            taskHeight:38, 
            taskMargin:"15px 25px", 
            taskBackground:"var(--task-feature)", 
            taskPadding: 10,
            taskEditOpacity: 1,
            taskDisplay: "",
            taskOpacity: 1,
            taskEditMaxHeight: 300,
            taskNameDecoration: "",
            taskPosition: "",
            taskMaxHeight: 500,
        },
        config: {
            tension: 200,
            friction: 25,
            mass: 1
        },
        reset: false
    },
    // Incomplete->complete animation
    complete: [
        {
            to: {
                taskMargin: "14px 8px", 
                taskNameDecoration: "line-through",
                taskOpacity: 1,
                taskPosition: "",
            },
            config: {
                tension: 200,
                friction: 25,
                mass: 1
            },

        }, 
        {
            to: {
                taskMaxHeight: 0,
                taskHeight:0, 
                taskOpacity: 0,
                taskMargin: "0px 8px", 
                taskPadding: 0,
                taskPosition: "absolute",
            },
            config: {
                tension: 800,
                friction: 50,
                mass: 1
            },
        }
    ],
})

// Aww sheat, here we go
class Task extends Component {

    constructor(props) {
        // Invoke React's constructor
        super(props);

        // Bind it good!
        autoBind(this);

        this.state = { 
            expanded: false, // are we expanded?
            deferDate: undefined, // what's our defer date?
            dueDate: undefined, // what's our due date?
            name: "", // what's our name string?
            desc: "",  // what's our description string?
            isFlagged: false, // are we flagged?
            isFloating: false, // are we floating? or just eating jello?
            project:"", // what's our project ID?
            tags: [], // what are the IDs of our tags?
            decoration: "",  // are we "od" "ds" or just just good ol' ""?
            availability: true, // are we avaliable? or are we deferred or blocked (in which case it'd be false.)
            isComplete: false, // are we completed?
            showRepeat: false, // is our repeat UI shown?
            startingCompleted: this.props.startingCompleted // @Enquiererer?
        }

        this.me = React.createRef(); // who am I? what am I?
        this.repeater = React.createRef(); // what's my repeater?
    }

    showRepeat() {this.setState({showRepeat: true})} // util func for showing repeat
    hideRepeat() {this.setState({showRepeat: false})} // util func for hiding repeat


    // Monster function to query task info TODO TODO #cleanmeup
    async loadTask() {

        // Obviously we need this, the task info
        let taskInfo = await this.props.engine.db.getTaskInformation(this.props.uid, this.props.tid);

        // Setting state to update the rest of them elements
        this.setState({
            name: taskInfo.name, // Set name field
            desc: taskInfo.desc, // Set task description
            project: taskInfo.project,  // Set project ID
            tags: taskInfo.tags, // Set tag ID array
            isFloating: taskInfo.isFloating, // Set isFloating bool
            isFlagged: taskInfo.isFlagged, // Set is Flagged bool
            isComplete: taskInfo.isComplete, // Set is complete style
            dueDate: (
                taskInfo.due ? // If we have a due date
                    (taskInfo.isFloating ? // and if we are floating
                        new Date(taskInfo.due.seconds*1000) : // then the due date in just... the due date
                        parseFromTimeZone( // otherwise, we stringify the date to remove timezone info
                            (new Date(taskInfo.due.seconds*1000)).toISOString(), 
                            {timeZone: taskInfo.timezone} // and cast it to the right time zone
                        )
                    ):
                undefined 
            ), 
            deferDate: (
                taskInfo.defer ? // If we have a defer date
                    (taskInfo.isFloating ?  // and if we are floating
                        new Date(taskInfo.defer.seconds*1000) : // then the defer date is just... the defer date
                            parseFromTimeZone( // otherwise, we stringify the date to remove timezone info
                                (new Date(taskInfo.defer.seconds*1000)).toISOString(), 
                                {timeZone: taskInfo.timezone} // and cast it to the right time zone
                            )
                    ): undefined
            )
        });
        this.refreshDecorations(); // flush and generate them decorations!
    }

    refreshDecorations() {
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
        document.addEventListener('mousedown', this.detectOutsideClick, false);
    }

    componentWillUnmount = () => document.removeEventListener('mousedown', this.detectOutsideClick, false);

    toggleTask = () => this.setState(state => ({expanded: !state.expanded}));

    closeTask = () => this.setState({expanded: false});

    openTask = () => this.setState({expanded: true});

    detectOutsideClick(e) {

        if (this.me.current.contains(e.target))
            return; //click inside

        if (this.repeater.current)
            if (this.repeater.current.contains(e.target))
                return; //click inside

        //otherwise,
        this.closeTask();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.expanded !== this.state.expanded && this.state.expanded === true)
            this.props.gruntman.lockUpdates();
        else if (prevState.expanded !== this.state.expanded && this.state.expanded === false)
            this.props.gruntman.unlockUpdates();

    }

    render() {

        return (

            <div >

                <AnimationFactory

                    native 

                    state={
			this.state.isComplete? 
			    (this.state.startingCompleted?
				(("complete"), (this.setState({isComplete: false})))

				:"complete"):(this.state.expanded?"show":"hide")}




// if complete, if starting complete, show. if complete, if starting uncomplete, complete. 
// if not complete, if expanded, show. if not complete, if not expanded, hide. 





                >
                {animatedProps => {
                    return (
                        <animated.div 
                            className={"task "+(this.state.expanded?"expanded":"collapsed")} 
 
                            ref={this.me} 
                            style={{
                                minHeight: animatedProps.taskHeight, 
                                maxHeight: animatedProps.taskMaxHeight, 
                                margin: animatedProps.taskMargin, 
                                background:animatedProps.taskBackground, 
                                opacity:animatedProps.taskOpacity, 
                                overflow: "hidden",
                                display: animatedProps.taskDisplay,
                                position: animated.taskPosition,
                                padding: animatedProps.taskPadding}}
                        >
                <ReactTooltip effect="solid" offset={{top: 3}} backgroundColor="black" className="tooltips" />
                            <Repeat tid={this.props.tid} reference={this.repeater} isShown={this.state.showRepeat} onDidDismiss={this.hideRepeat}/>
                            <div style={{display: "inline-block", transform: "translateY(-3px)"}}>
                                <input 
                                    type="checkbox" 
                                    id={"task-check-"+this.props.tid} 
                                    className="task-check" 
                                    onChange={()=>{
					console.log("changed")
                                        if (this.state.isComplete)
                                            this.setState({isComplete: false})
					    this.props.gruntman.do("task.update__complete", { uid: this.props.uid, tid: this.props.tid}, true)
					    if (this.props.startingComplete) {
						console.log("completing while starting  coplete")
					    }

                                        else if (!this.state.isComplete) {
                                            this.props.gruntman.lockUpdates();
                                            this.setState({isComplete: true})
					    this.props.gruntman.do("task.update__complete", { uid: this.props.uid, tid: this.props.tid}, true)
					    if (!this.props.startingComplete) {
						console.log("completing while starting not coplete")
					    }


                                             //TODO wait for animation to finish before state update??
                                            this.props.gruntman.unlockUpdates(1000)
                                        }
                                    }} 
				    style={{opacity: this.state.availability?1:0.35}}
                                />
                                <label className={"task-pseudocheck "+this.state.decoration} id={"task-pseudocheck-"+this.props.tid} htmlFor={"task-check-"+this.props.tid}>&zwnj;</label>

                            </div>
                                <animated.input 
                                    defaultValue={this.state.name} 
                                    placeholder={"LOCALIZE: Task Name"} 
                                    onChange={
                                        (e)=>{
                                            e.persist(); //https://reactjs.org/docs/events.html#event-pooling
                                            this.props.gruntman.registerScheduler(() => this.props.gruntman.do(
                                                "task.update", 
                                                {
                                                    uid: this.props.uid, 
                                                    tid: this.props.tid, 
                                                    query:{name: e.target.value}
                                                }
                                            ), `task-name-${this.props.tid}-update`)
                                        }
                                    } 
                                    onFocus={()=>{ if(!this.state.expanded) this.openTask() }} 
                                    className="task-name" 
                                    readOnly={false} 
                                    type="text" 
                                    autoComplete="off" 
                                    placeholder="LOCALIZE: Task Name" 
                                    style={{opacity: this.state.availability?1:0.35, textDecoration: animatedProps.taskNameDecoration}} />

                                            <animated.div className="task-edit" style={{opacity: animatedProps.taskEditOpacity, overflow: "hidden",maxHeight: animatedProps.taskEditMaxHeight}}>
                                                <textarea 
                                                    placeholder="LOCALIZE:Description" 
                                                    className="task-desc" 
                                                    style={{marginBottom: 10}} 
                                                    defaultValue={this.state.desc}
                                                    onChange={
                                                        (e)=>{
                                                            e.persist(); //https://reactjs.org/docs/events.html#event-pooling
                                                            this.props.gruntman.registerScheduler(() => this.props.gruntman.do(
                                                                "task.update", 
                                                                {
                                                                    uid: this.props.uid, 
                                                                    tid: this.props.tid, 
                                                                    query:{desc: e.target.value}
                                                                }
                                                            ), `task-desc-${this.props.tid}-update`)
                                                        }
                                                    }
                                                        >
                                                    
                                                </textarea>

                                                <div style={{display: "inline-block", marginBottom: 6}}>
                                                    <div   className="task-icon" style={{borderColor: this.state.isFlagged ? "var(--task-flaggedRing)":"var(--task-checkbox-feature-alt)"}}><a  data-tip="LOCALIZE: Flagged" className="fas fa-flag" style={{margin: 3, color: this.state.isFlagged ? "var(--task-flagged)" : "var(--task-textbox)", fontSize: 13, transform: "translate(2.5px, -0.5px)", cursor: "pointer"}} onClick={()=>{
                                                        this.props.gruntman.do(
                                                            "task.update", 
                                                            { uid: this.props.uid, tid: this.props.tid, query:{isFlagged: !this.state.isFlagged}}
                                                        )
                                                        this.setState({isFlagged: !this.state.isFlagged});

                                                    }} ></a></div>
                                                    <div className="task-icon" style={{borderColor: this.state.isFloating? "var(--task-flaggedRing)":"var(--task-checkbox-feature-alt)"}}><a data-tip="LOCALIZE: Floating" className="fas fa-globe-americas" style={{margin: 3, color: this.state.isFloating? "var(--task-flagged)" : "var(--task-textbox)", fontSize: 13, transform: "translate(2.5px, -0.5px)", cursor: "pointer"}} onClick={()=>{
                                                        this.props.gruntman.do(
                                                            "task.update", 
                                                            { uid: this.props.uid, tid: this.props.tid, query:{isFloating: !this.state.isFloating}}
                                                        )
                                                        this.setState({isFloating: !this.state.isFloating});

                                                    }} ></a></div>
                                                    <div className="task-icon" style={{borderColor: "var(--task-checkbox-feature-alt)", marginRight: 20}}><a className="fas fa-redo"  data-tip="LOCALIZE: Repeat"  style={{margin: 3, color: "var(--task-textbox)", fontSize: 13, transform: "translate(2.5px, 0px)", cursor: "pointer"}} onClick={this.showRepeat} ></a></div>

                                                    {/*<div className="task-icon" style={{borderColor: "var(--task-checkbox-feature-alt)", marginRight: 20}}><a className="fas fa-globe-americas" style={{margin: 3, color: "var(--task-textbox)", fontSize: 13, transform: "translate(2.5px, -0.5px)"}}></a></div>*/}
                                                </div>


                                                <div style={{display: "inline-block", marginBottom: 8}}>

                                                    <div style={{display: "inline-block", marginRight: 10, marginBottom: 5, marginLeft: 6}}>
                                                        <i className="fas fa-play" data-tip="LOCALIZE: Defer Date" style={{transform: "translateY(-1px)", marginRight: 10, color: "var(--task-icon)", fontSize: 10}}></i>
                                                        {(() => {
                                                            const DateInput = ({ value, onClick }) => { 
                                                                return (
                                                                    <input className="task-datebox" defaultValue={value} onChange={(e)=>{
                                                                        e.persist(); //https://reactjs.org/docs/events.html#event-pooling
                                                                        this.props.gruntman.registerScheduler(() => {
                                                                            let d = chrono.parseDate(e.target.value);
                                                                            if (d) this.setState({deferDate: d});
                                                                            if (d)
                                                                                if (this.state.deferDate-(new Date()) > 0) 
                                                                                    this.setState({availability: false});
                                                                                else if (this.props.availability === false)
                                                                                    this.setState({availability: false});
                                                                            if (d)
                                                                                this.props.gruntman.do(
                                                                                    "task.update", { uid: this.props.uid, tid: this.props.tid, query:{defer:d, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone}}
                                                                                )
                                                                        }, `task-defer-${this.props.tid}-update`)
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
                                                                    onChange={date => {
                                                                        this.setState({deferDate: date});

                                                                        if (date-(new Date()) > 0 || !this.props.availability) 
                                                                            this.setState({availability: false});
                                                                        else 
                                                                            this.setState({availability: true});

                                                                        this.props.gruntman.do(
                                                                            "task.update", { uid: this.props.uid, tid: this.props.tid, query:{defer: date, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone}}
                                                                        )
                                                                    }}
                                                                    showTimeInput
                                                                    dateFormat="MM/dd/yyyy h:mm aa"
                                                                    customTimeInput={<TimeInput />}
                                                                    customInput={<DateInput />}
                                                                />
                                                            )
                                                        })()}
                                                    </div>

                                                    <div style={{display: "inline-block", marginBottom: 5, marginLeft: 6}}>
                                                        <i className="fas fa-stop" data-tip="LOCALIZE: Due Date" style={{transform: "translateY(-1px)", marginRight: 10, color: "var(--task-icon)", fontSize: 10}}></i>
                                                        {(() => {
                                                            const DateInput = ({ value, onClick }) => { 
                                                                return (
                                                                    <input className="task-datebox" defaultValue={value} onChange={(e)=>{
                                                                        e.persist(); //https://reactjs.org/docs/events.html#event-pooling
                                                                        this.props.gruntman.registerScheduler(() => {
                                                                            let d = chrono.parseDate(e.target.value);
                                                                            if (d) this.setState({dueDate: d});
                                                                            if (d)
                                                                                if (d-(new Date()) < 0) 
                                                                                    this.setState({decoration: "od"});
                                                                                else if (d-(new Date()) < 24*60*60*1000) 
                                                                                    this.setState({decoration: "ds"});
                                                                                else
                                                                                    this.setState({decoration: ""});

                                                                            if (d)
                                                                                this.props.gruntman.do(
                                                                                    "task.update", { uid: this.props.uid, tid: this.props.tid, query:{due:d, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone}}
                                                                                )

                                                                        }, `task-due-${this.props.tid}-update`)
                                                                    }
                                                                    } onFocus={(e) => {
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
                                                                    onChange={date => {
                                                                        this.setState({dueDate: date});

                                                                        if (date)
                                                                            if (date-(new Date()) < 0) 
                                                                                this.setState({decoration: "od"});
                                                                            else if (date-(new Date()) < 24*60*60*1000) 
                                                                                this.setState({decoration: "ds"});
                                                                            else
                                                                                this.setState({decoration: ""});
                                                                        else
                                                                            this.setState({decoration: ""});


                                                                        this.props.gruntman.do(
                                                                            "task.update", { uid: this.props.uid, tid: this.props.tid, query:{due: date, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone}}
                                                                        )
                                                                    }}
                                                                />
                                                            )
                                                        })()}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="task-project-container">
                                                        <i className="fas fa-list-ul" style={{margin: 3, color: "var(--task-icon)", fontSize: 13, marginRight: 5, transform: "translateY(5px)"}}></i>
                                                        <Select 
                                                            options={this.props.datapack[1]}
                                                            className='task-project'
                                                            classNamePrefix='task-select'
                                                            isClearable
                                                            styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
                                                            menuPortalTarget={this.me.current}
                                                            value={this.props.datapack[1].filter(option => option.value === this.state.project)}
                                                            onChange={(e)=>{
                                                                this.props.gruntman.do("task.update__project", { uid: this.props.uid, tid: this.props.tid, oldProject: this.project, project: (e?e.value:"")})
                                                                this.setState({project:(e?e.value:"")});
                                                            }}
                                                        />
                                                    </span>
                                                    <span className="task-tag-container">
                                                        <i className="fas fa-tags" style={{margin: 3, color: "var(--task-icon)", fontSize: 13, transform: "translateY(5px)"}}></i>
                                                        <Select 
                                                            options={this.props.datapack[0]}
                                                            className='task-tag'
                                                            classNamePrefix='task-select'
                                                            isClearable
                                                            isMulti
                                                            styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
                                                            menuPortalTarget={this.me.current}
                                                            value={this.props.datapack[0].filter(option => this.state.tags.includes(option.value))}
                                                            onChange={(e) => {
                                                                let tagIDs = e?e.map(a=>a.value):[];
                                                                this.setState({tags: tagIDs});
                                                                this.props.gruntman.do(
                                                                    "task.update", 
                                                                    {
                                                                        uid: this.props.uid, 
                                                                        tid: this.props.tid, 
                                                                        query:{tags: tagIDs}
                                                                    }
                                                                )
                                                            }}
                                                        />
                                                    </span>
                                                </div>
                                            </animated.div>
                        </animated.div>
                    )}
                } 
                </AnimationFactory>
            </div >

        )
    }
}

export default Task;

