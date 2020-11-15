// A whole lotta imports

// Ionic components
import { IonItem, IonInput, IonContent, IonGrid, IonRow, IonCol, IonSegment, IonLabel, IonButton, IonPopover } from '@ionic/react';

// Detect whether is mobile
import { getPlatforms } from '@ionic/react';

// Like, your heart and soul
import React, { Component } from 'react';

// React Spring animation packages
import { Spring, animated, Keyframes } from 'react-spring/renderprops'

// Cool components 
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import * as chrono from 'chrono-node';
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable';

// Our very own repeat UI
import Repeat from './Repeat';

// Our very own tag editor UI
import TagEditor from './TagEditor';

// Our very own calendar popover
import CalendarPopover from './CalendarPopover';

// Our very own CSS
import './Task.css';

// Oooips
import ReactTooltip from 'react-tooltip';

// FNS date parcing utils
const { parseFromTimeZone } = require('date-fns-timezone')

// autobind those functions
const autoBind = require('auto-bind/react');

/*
 *
 * Hello human,
 *
 * I am a task.
 *
 * You seriously are reading the help poem about this?
 *
 * @jemoka
 *
 */


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
            taskBackground:"var(--task-selected)", 
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
            showTagEditor: false, // is our TagEditor UI shown?
            deferPopoverShown: false, // is the defer calendar popover shown?
            duePopoverShown: false, // is the due calendar popover shown?
            startingCompleted: this.props.startingCompleted, // disable immediate onComplete animation for completed
            possibleTags: this.props.datapack[0], // tags will need to be dynamically added, so
            haveBeenExpanded: (this.props.startOpen !== undefined && this.props.startOpen !== false), // did we render the edit part yet? optimization
            notificationPopoverShown: [false, null], // is our notification popover shown?
        }
        this.initialRenderDone = false; // wait for data to load to make animation decisions
        this.me = React.createRef(); // who am I? what am I?
        this.repeater = React.createRef(); // what's my repeater?
        this.checkbox = React.createRef(); // what's my pseudocheck
        this.TagEditorRef = React.createRef(); // what's my tag editor
        this.actualCheck = React.createRef(); // what's my (actual, non-seen) checkmark
        this.duePopover = React.createRef(); // what's my due popover?
        this.deferPopover = React.createRef(); // what's my defer popover?
        this.notificationPopover = React.createRef(); // what's my notification popover?
    }

    showRepeat() {this.setState({showRepeat: true})} // util func for showing repeat
    hideRepeat() {this.setState({showRepeat: false})} // util func for hiding repeat

    showTagEditor() {this.setState({showTagEditor: true})} // function for showing tag editor
    showTageEditor() {this.setState({showTageEditor: false})}  // function for hiding tag editor

    showNotificationPopover(e) {this.setState({notificationPopoverShown: [true, e.nativeEvent]})}

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
        this.initialRenderDone = true;
    }

    refreshDecorations() {
        if (this.state.dueDate) // if we gotta due date
            if (this.state.dueDate-(new Date()) < 0) // and this kid has not done his homework
                this.setState({decoration: "od"}); // give 'em a red badge
        else if (this.state.dueDate-(new Date()) < 24*60*60*1000) // or if this kid has not done his homework a day earlier
            this.setState({decoration: "ds"}); // give 'em an orange badge
        else 
            this.setState({decoration: ""}); // give 'em an nothing badge

        if (this.state.deferDate) // if we gotta defer date
            if (this.state.deferDate-(new Date()) > 0) // and this kid is trying to start early
                this.setState({availability: false}); // tell 'em it's not avaliable
        else if (this.props.availability === true) //  otherwise, if this thing's avaliable
            this.setState({availability: true}); // set it to be so!
        else if (!this.props.availability) // or if my props make me disabled
            this.setState({availability: false}); // well then you gotta follow them props, no?
    }

    componentDidMount() {
        this.loadTask(); // load the task when we mount   
        document.addEventListener('mousedown', this.detectOutsideClick, false); // and listen for clicks everywhere
    }

    componentWillUnmount = () => document.removeEventListener('mousedown', this.detectOutsideClick, false); // remove the listener... no memory leaks plez

    toggleTask = () => this.setState(state => ({expanded: !state.expanded})); // util function to toggl a task
    
    closeTask() {
        this.setState({expanded: false});
    }
    //closeTask = () => this.setState({expanded: false}); // util function to close a task

    openTask() {
        if (this.state.haveBeenExpanded)
            this.setState({expanded: true});
        else 
            this.setState({haveBeenExpanded: true}, ()=>this.setState({expanded: true}));
    }// util function to open a task

    _explode() {
        // You should probably be calling openTask()
        this.initialRenderDone = true;
        this.setState({haveBeenExpanded: true}, ()=>this.setState({expanded: true}));
    }

    detectOutsideClick(e) {

        if (this.me.current) // if we are mounted
            if (this.me.current.contains(e.target)) // if we are clicking me
                return; //click inside

        if (this.repeater.current) // if our repeater is a thing that mounted
            if (this.repeater.current.contains(e.target)) // and we are clicking inside that
                return; //click inside

        if (this.duePopover.current) // if our due popover is a thing that mounted
            if (this.duePopover.current.contains(e.target)) // and we are clicking inside that
                return; //click inside

        if (this.deferPopover.current) // if our defer popover is a thing that mounted
            if (this.deferPopover.current.contains(e.target)) // and we are clicking inside that
                return; //click inside

        if (this.notificationPopover.current) // if our notification popover is a thing that mounted
            if (this.notificationPopover.current.contains(e.target)) // and we are clicking inside that
                return; //click inside

        
        if (this.TagEditorRef.current) // if our repeater is a thing that mounted
            if (this.TagEditorRef.current.contains(e.target)) // and we are clicking inside that
                return; //click inside
        
        //if (this.props.envelope) // if we have a drag envelope
            //if (this.props.envelope.current) // if we have a drag envelope
                //if (this.props.envelope.current.contains(e.target)) // and we are clicking inside that
                    {/*return; //click inside*/}

        // DRAG ENVELOPES ARE SUPPOSED TO PROTECT AGAINST DRAGGING, AND ARE UNIVERSAL ACROSS ALL TASKS
        // UNCOMMENTING THIS WILL MAKE MULTIPLE TASKS OPEN AT ONCE ON UPCOMING

        if (document.getElementById("parking-lot").contains(e.target))
            return;

        if (this.props.onModal)
            if (document.getElementById("airplane-hanger").contains(e.target))
                return;

        if (this.state.showRepeat) // if we are showing our repeat
            return; //click inside

        if (this.state.showTagEditor) // if we are showing TagEditor
            return; // click inside

        //otherwise,
        this.closeTask();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // flush styles
        if (prevState.deferDate !== this.state.deferDate) // if we updated the defer date
            this.refreshDecorations();
        if (prevState.dueDate !== this.state.dueDate) // if we updated the due date
            this.refreshDecorations();
        if (prevState.expanded !== this.state.expanded && this.state.expanded === true) {// if we opened a task for updating
            if (getPlatforms().includes("mobile"))
                document.getElementById("abtib").style.display = "none";
            if (this.props.setDragEnabled) // if we are a draggable task
                this.props.setDragEnabled(false); // disable drag
            this.props.gruntman.lockUpdates(); // tell gruntman to chill
        }
        else if (prevState.expanded !== this.state.expanded && this.state.expanded === false) { // if we closed a task
            if (getPlatforms().includes("mobile"))
                document.getElementById("abtib").style.display = "block";
            if (this.props.setDragEnabled) // if we are a draggable task
                this.props.setDragEnabled(true); // enable drag
            this.props.gruntman.unlockUpdates(); // tell gruntman to... grunt!
        }
        if (prevProps.startOpen !== this.props.startOpen && this.props.startOpen) // we are newly starting open
            this.openTask(); // open task
    }


    // ready fo this?

    render() {

        return (
            <div>

                {/*animation factory to orchistrate animations*/}

                <AnimationFactory

                    native  

                    state = {
                        this.initialRenderDone ?
                            (this.state.isComplete? // if we are complete 
                                (this.state.startingCompleted? // and we start complete 
                                    (this.state.expanded? // and we are expanded 
                                        "show":"hide") // show, otherwise, hide 
                                        :"complete") // if we are complete,  and don't start completed, complete. 
                                        : // if we arnt complete, 
                                this.state.startingCompleted ?  // and we start complete 
                                "complete" :
                                (this.state.expanded? "show":"hide")):"hide"
                    } // if we are incomplete, and we start incomplete, then show or hide based on expanded 

                >
                    {animatedProps => {
                        return (
                            // Actual task container, now
                            <animated.div 
                                onClick={(e)=>{
                                    if(!this.state.expanded && e.target !== this.checkbox.current && e.target !== this.actualCheck.current && !this.props.freeze && !(this.state.isComplete&&!this.state.startingCompleted)) { 
                                        this.openTask(); // open the task
                                    }
                                }}
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

                                {/* Chapter 0: Utility Components */}

                                {/* Gotta get those on hover tips */}
                                {/* And load up + hide the repeat UI, too! */}
                                <Repeat tid={this.props.tid} reference={this.repeater} isShown={this.state.showRepeat} onDidDismiss={this.hideRepeat} uid={this.props.uid} engine={this.props.engine} gruntman={this.props.gruntman}/>
                                {/* As well as load up + hide the tag editor!*/}
                                <TagEditor reference={this.TagEditorRef} isShown={this.state.showTagEditor} onDidDismiss={()=>this.setState({showTagEditor: false})} uid={this.props.uid} engine={this.props.engine} gruntman={this.props.gruntman}/>
                                
                                {/* Chapter 1: Task Checkmark */}
                                {/* Who could have thought so much code goes into a checkbox? */}
                                <div style={{display: "inline-block", transform: "translateY(-3px)"}}>
                                    {/* First, an invisible checkmark */}
                                    <input 
                                        type="checkbox" 

     ref={this.actualCheck}
                                        id={"task-check-"+this.props.tid} 
                                        className="task-check"
                                        defaultChecked={this.props.startingCompleted}
                                        onChange={()=>{

                                            // If we are uncompleting a task (that is, currently task is complete) 
                                            if (this.state.isComplete) {
                                                this.props.gruntman.lockUpdates();
                                                // Well, first, uncomplete it
                                                this.setState({isComplete: false})
                                                // Update the database, registering a gruntman action while you are at it.
                                                this.props.gruntman.do("task.update__uncomplete", { uid: this.props.uid, tid: this.props.tid}, true)
                                                // Whatever this is
                                                this.props.gruntman.unlockUpdates(1000)
                                            }
                                            // If we are completing a task (that is, currently task is incomplete)
                                            else if (!this.state.isComplete) {
                                                // Lock updates so that animation could finish
                                                this.props.gruntman.lockUpdates();
                                                // Complete it
                                                this.setState({isComplete: true})
                                                // Update the database, registering a gruntman action while you are at it.
                                                this.props.gruntman.do("task.update__complete", { uid: this.props.uid, tid: this.props.tid}, true)
                                                //TODO wait for animation to finish before state update??
                                                this.props.gruntman.unlockUpdates(1000)
                                            }
                                        }} 
                                        style={{opacity: this.state.availability?1:0.35}}
                                    />

                                    {/* Oh yeah, that checkmark above you can't actually see */}
                                    {/* Here's what the user actually clicks on, the label! */}
                                    <label ref={this.checkbox} className={"task-pseudocheck "+this.state.decoration} id={"task-pseudocheck-"+this.props.tid} htmlFor={"task-check-"+this.props.tid}>&zwnj;</label>
                                </div>

                                {/* The animated input box */}
                                <animated.input 
                                    defaultValue={this.state.name} 
                                    placeholder={"LOCALIZE: Task Name"} 
                                    onChange={
                                        (e)=>{
                                            // THIS. REFER TO THIS. YOU ARE HERE. STOP SEARCHING.
                                            // :point down: is FANCYCHANGE

                                            // If somebody dares to do the complicated action of task name change
                                            e.persist(); //https://reactjs.org/docs/events.html#event-pooling

                                            // Register a scheduler to watch for more changes
                                            // because dang react calls onChange on every freaking change
                                            // TODO TODO destruct all schedulers on view change
                                            this.props.gruntman.registerScheduler(() => this.props.gruntman.do(
                                                "task.update", // the scheduler actually updates the task
                                                {
                                                    uid: this.props.uid, 
                                                    tid: this.props.tid, 
                                                    query:{name: e.target.value} // setting the name to the name
                                                }
                                            ), `task-name-${this.props.tid}-update`) // and we will schedule it as this
                                        }
                                    } 

                                    onFocus={(e)=>{ 
                                        // open the task if its not open already
                                        if(!this.state.expanded) { 
                                            //this.openTask(); // open the task
                                            if (getPlatforms().includes("mobile")) e.target.blur(); // blur, only if mobile to fix bugs where even in attempted readonly the cursor blurs
                                        }
                                    }} 
                                    className={"task-name "+(this.state.expanded?"":"no-select")} 
                                    readOnly={(!this.state.expanded)} 
                                    type="text" 
                                    autoComplete="off" 
                                    placeholder="LOCALIZE: Task Name" 
                                    style={{opacity: this.state.availability?1:0.35, textDecoration: animatedProps.taskNameDecoration}} />

                                {/* Task edit. The thing that slides open on edit. */}
                                {(() => {
                                    if (this.state.haveBeenExpanded===true)
                                        return(
                                            <animated.div className="task-edit" style={{opacity: animatedProps.taskEditOpacity, overflow: "hidden",maxHeight: animatedProps.taskEditMaxHeight}}>

                                                {/* First, task description field */}
                                                <textarea 
                                                    placeholder="LOCALIZE:Description" 
                                                    className="task-desc" 
                                                    style={{marginBottom: 10}} 
                                                    defaultValue={this.state.desc}
                                                    onChange={
                                                        (e)=>{
                                                            // Register a scheduler to deal with React's onChange
                                                            // Search for the word FANCYCHANGE to read my spheal on this
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

                                                {/* Task icon set. TODO delete task */}
                                                <div style={{display: "inline-block", marginBottom: 6, transform: "translateY(-5px)"}}>
                                                    {/* Flagged icon */}
                                                    <a data-tip="LOCALIZE: Flagged" className="task-icon" style={{borderColor: this.state.isFlagged ? "var(--task-icon-ring-highlighted)":"var(--task-icon-ring)", cursor: "pointer"}} onClick={()=>{
                                                        // On change, set the flagged state to the opposite of whatever it is
                                                        // Both on the db...
                                                        this.props.gruntman.do(
                                                            "task.update", 
                                                            { uid: this.props.uid, tid: this.props.tid, query:{isFlagged: !this.state.isFlagged}}
                                                        )
                                                        // And the task!
                                                        this.setState({isFlagged: !this.state.isFlagged});

                                                    }}><i className="fas fa-flag" style={{margin: 3, color: this.state.isFlagged ? "var(--task-icon-highlighted)" : "var(--task-icon-text)", fontSize: 15, transform: "translate(7px, 5px)"}} ></i></a>

                                                    {/* Floating icon */}
                                                    <a data-tip="LOCALIZE: Floating" className="task-icon" style={{borderColor: this.state.isFloating? "var(--task-icon-ring-highlighted)":"var(--task-icon-ring)", cursor: "pointer"}} onClick={()=>{
                                                        // On change, set the floating state to the opposite of whatever it is
                                                        // Both on the db... TODO flush the timezone too?
                                                        this.props.gruntman.do(
                                                            "task.update", 
                                                            { uid: this.props.uid, tid: this.props.tid, query:{isFloating: !this.state.isFloating}}
                                                        )
                                                        // And the task!
                                                        this.setState({isFloating: !this.state.isFloating});

                                                    }}><i className="fas fa-globe-americas" style={{margin: 3, color: this.state.isFloating? "var(--task-icon-highlighted)" : "var(--task-icon-text)", fontSize: 15, transform: "translate(7px, 5px)"}} ></i></a>

                                                    {/* Repeat icon that, on click, shows repeat */}
                                                    <a onClick={this.showRepeat} className="task-icon" style={{borderColor: "var(--task-icon-ring)", cursor: "pointer"}} data-tip="LOCALIZE: Repeat"><i className="fas fa-redo" style={{margin: 3, color: "var(--task-icon-text)", fontSize: 15, transform: "translate(6.5px, 5.5px)"}} ></i></a>

                                                    {/* Notification icon that, on click, shows notify popover */}
                                                    <IonPopover
                                                        showBackdrop={false}
                                                        isOpen={this.state.notificationPopoverShown[0]}
                                                        cssClass='notif-popover'
                                                        onDidDismiss={e => this.setState({notificationPopoverShown: [false, null]})}
                                                        event={this.state.notificationPopoverShown[1]}
                                                        ref={this.notificationPopover}
                                                    >
                                                        <div>
                                                            <div className="notification-popover-item">Cancel Notification</div>
                                                            <div className="notification-popover-item">Change Notification</div>
                                                        </div>
                                                    </IonPopover>
                                                    <a onClick={this.showNotificationPopover} className="task-icon" style={{borderColor: "var(--task-icon-ring)", marginRight: 20, cursor: "pointer"}} data-tip="LOCALIZE: Repeat"><i className="fas fa-bell" style={{margin: 3, color: "var(--task-icon-text)", fontSize: 15, transform: "translate(7px, 5.5px)"}} ></i></a>

                                                    {/* TagEditor icon that shows TagEditor on click*/}
                                                    <a onClick={this.showTagEditor} className="task-icon" style={{borderColor: "var(--task-icon-ring)", marginRight: 20, cursor: "pointer"}} data-tip="LOCALIZE: Freaking TagEditor"><i className="fas fa-tags" style={{margin: 3, color: "var(--task-icon-text)", fontSize: 15, transform: "translate(6.5px, 5.5px)"}}></i></a>
                                                    {/*<div className="task-icon" style={{borderColor: "var(--task-checkbox-feature-alt)", marginRight: 20}}><a className="fas fa-globe-americas" style={{margin: 3, color: "var(--task-textbox)", fontSize: 13, transform: "translate(2.5px, -0.5px)"}}></a></div>*/}
                                                </div>


                                                {/* Task date set */}
                                                <div style={{display: "inline-block", marginBottom: 8}}>

                                                    {/* Defer date container */}
                                                    <div style={{display: "inline-block", marginRight: 10, marginBottom: 5, marginLeft: 6}}>
                                                        {/* The. Defer. Date. */}
                                                        <i className="fas fa-play" data-tip="LOCALIZE: Defer Date" style={{transform: "translateY(-1px)", marginRight: 10, color: "var(--task-icon)", fontSize: 10}}></i>
                                                        <CalendarPopover reference={this.deferPopover} uid={this.props.uid} engine={this.props.engine} isShown={this.state.deferPopoverShown} onDidDismiss={()=>this.setState({deferPopoverShown: false})} useTime initialDate={this.state.deferDate} onDateSelected={(d)=>{
                                                            this.props.gruntman.do(
                                                                "task.update", { uid: this.props.uid, tid: this.props.tid, query:{defer:d, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone}}
                                                            )
                                                            this.setState({deferDate: d});

                                                        }}/>
                                                        {(() => {
                                                            {/* The. Defer. Date. Input. */}
                                                            const DateInput = ({ value, onClick }) => { 
                                                                return (
                                                                    <input className="task-datebox" readOnly={(getPlatforms().includes("mobile"))} defaultValue={value}  onChange={(e)=>{
                                                                        // Register a scheduler to deal with React's onChange
                                                                        // Search for the word FANCYCHANGE to read my spheal on this
                                                                        // DATEHANDLING is here too. If you are looking for that, stop searching

                                                                        e.persist(); //https://reactjs.org/docs/events.html#event-pooling
                                                                        this.props.gruntman.registerScheduler(() => {
                                                                            let d = chrono.parseDate(e.target.value); // NLP that date!
                                                                            if (d) this.setState({deferDate: d}); // we we got a valid date, update the calendar UI
                                                                            if (d) // and update the database too!
                                                                                this.props.gruntman.do(
                                                                                    "task.update", { uid: this.props.uid, tid: this.props.tid, query:{defer:d, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone}}
                                                                                )
                                                                        }, `task-defer-${this.props.tid}-update`)
                                                                    }} onFocus={(e) => {
                                                                        if (getPlatforms().includes("mobile"))
                                                                            this.setState({deferPopoverShown: true})
                                                                        else {
                                                                            onClick();
                                                                            e.target.focus();
                                                                        }

                                                                    }}
                                                                    />
                                                                );
                                                            };
                                                            const TimeInput = ({ value, onChange }) => {
                                                                // IDK why this is needed, but it is. Sometimes it decides that it will drop the final 0?
                                                                if (value.slice(value.length-2, value.length) === ":0") value = value + "0";
                                                                // TODO: calling complex string ops to fix an interface bug not a good idea?
                                                                return (
                                                                    <input
                                                                        className="task-timebox"
                                                                        defaultValue={value}
                                                                        onKeyPress={e => {
                                                                            // TIMEHANDLING is here. If you are searching for that, it's here.
                                                                            // But anyway, on change, parse the time
                                                                            let d = chrono.parseDate(e.target.value); //TODO bad?
                                                                            // ...and throw away the date 
                                                                            if (d && e.key === "Enter") onChange(d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()); // TODO make this with the onChange API
                                                                        }}
                                                                    />
                                                                )};
                                                            return (
                                                                <DatePicker
                                                                    selected={this.state.deferDate}
                                                                    portalId={this.props.onModal?"airplane-hanger":"parking-lot"}
                                                                    onChange={date => {
                                                                        // If the calendar got a new date, set it
                                                                        this.setState({deferDate: date});

                                                                        // No longer needed. State updates handle decoration udpates. Kept here for decorative purposes:
                                                                        // and hit the DB too!
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
                                                        {/* Due date popover */}
                                                        <CalendarPopover reference={this.duePopover} uid={this.props.uid} engine={this.props.engine} isShown={this.state.duePopoverShown} onDidDismiss={()=>this.setState({duePopoverShown: false})} useTime initialDate={this.state.dueDate} onDateSelected={(d)=>{
                                                            this.props.gruntman.do(
                                                                "task.update", { uid: this.props.uid, tid: this.props.tid, query:{due:d, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone}}
                                                            )
                                                            this.setState({dueDate: d});

                                                        }}/>
                                                        {(() => {
                                                            const DateInput = ({ value, onClick }) => { 
                                                                return (
                                                                    <input className="task-datebox" readOnly={(getPlatforms().includes("mobile")) ? true : false} defaultValue={value} onChange={(e)=>{
                                                                        // Register a scheduler to deal with React's onChange
                                                                        // Search for the word FANCYCHANGE to read my spheal on this
                                                                        // Search for the word DATEHANDLING for what the heck the code actually does

                                                                        e.persist(); //https://reactjs.org/docs/events.html#event-pooling
                                                                        this.props.gruntman.registerScheduler(() => {
                                                                            let d = chrono.parseDate(e.target.value);
                                                                            if (d) this.setState({dueDate: d});
                                                                            if (d)
                                                                                this.props.gruntman.do(
                                                                                    "task.update", { uid: this.props.uid, tid: this.props.tid, query:{due:d, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone}}
                                                                                )

                                                                        }, `task-due-${this.props.tid}-update`)
                                                                    }
                                                                        } onFocus={(e) => {
                                                                            if (getPlatforms().includes("mobile"))
                                                                                this.setState({duePopoverShown: true})
                                                                            else {
                                                                                onClick();
                                                                                e.target.focus();
                                                                            }
                                                                        }}
                                                                    />
                                                                );
                                                            };
                                                            const TimeInput = ({ value, onChange }) => {
                                                                // IDK why this is needed, but it is. Sometimes it decides that it will drop the final 0?
                                                                if (value.slice(value.length-2, value.length) === ":0") value = value + "0";
                                                                // TODO: calling complex string ops to fix an interface bug not a good idea?
                                                                return (
                                                                    <input
                                                                        className="task-timebox"
                                                                        defaultValue={value}
                                                                        onKeyPress={e => {
                                                                            // Search for TIMEHANDLING for notes on time handling.
                                                                            // But anyway, on change, parse the time
                                                                            let d = chrono.parseDate(e.target.value); //TODO bad?
                                                                            // ...and throw away the date 
                                                                            if (d && e.key === "Enter") onChange(d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());
                                                                        }}
                                                                    />
                                                                )};
                                                            return (
                                                                <DatePicker
                                                                    selected={this.state.dueDate}
                                                                    portalId={this.props.onModal?"airplane-hanger":"parking-lot"}
                                                                    onChange={date => this.setState({dueDate: date})}
                                                                    showTimeInput
                                                                    isClearable
                                                                    dateFormat="MM/dd/yyyy h:mm aa"
                                                                    customTimeInput={<TimeInput />}
                                                                    customInput={<DateInput />}
                                                                    onChange={date => {
                                                                        // If the calendar got a new date, set it
                                                                        this.setState({dueDate: date});

                                                                        // and hit the DB too!
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
                                                    {/* Task project container */}
                                                    <span className="task-project-container">
                                                        {/* Icon */}
                                                        <i className="fas fa-list-ul" style={{margin: 3, color: "var(--task-icon)", fontSize: 13, marginRight: 5, transform: "translateY(5px)"}}></i>
                                                        {/* Project select */}
                                                        <Select 
                                                            options={this.props.datapack[1]}
                                                            className='task-project'
                                                            classNamePrefix='task-select'
                                                            isClearable
                                                            styles={{
                                                                // Fixes the overlapping problem of the component
                                                                menuPortal: provided => ({ ...provided, zIndex: "99999 !important" })
                                                            }}
                                                            menuPortalTarget={document.body}
                                                            value={this.props.datapack[1].filter(option => option.value === this.state.project)}
                                                            onChange={(e)=>{
                                                                {/* :point up: filter for only options with this project and set that to be the value */}
                                                                {/* Actually update the project */}
                                                                this.props.gruntman.do("task.update__project", { uid: this.props.uid, tid: this.props.tid, oldProject: this.state.project===""?undefined:this.state.project, project: (e?e.value:"")})
                                                                {/* And set the state, too! */}
                                                                this.setState({project:(e?e.value:"")});
                                                            }}
                                                        />
                                                    </span>
                                                    {/* Task tag container */}
                                                    <span className="task-tag-container">
                                                        {/* Icon */}
                                                        <i className="fas fa-tags" style={{margin: 3, color: "var(--task-icon)", fontSize: 13, transform: "translateY(5px)"}}></i>
                                                        {/* Tag select */}
                                                        <CreatableSelect
                                                            options={this.props.datapack[0]}
                                                            className='task-tag'
                                                            classNamePrefix='task-select'
                                                            isClearable
                                                            isMulti
                                                            styles={{ menuPortal: base => ({ ...base, zIndex: "99999 !important" }) }}
                                                            menuPortalTarget={document.body}
                                                            value={this.props.datapack[0].filter(option => this.state.tags.includes(option.value))}
                                                            onChange={(newValue, actionMeta) => {
                                                                let view = this;
                                                                let tids = newValue?newValue.map(async function (e) { // for each tag
                                                                    if (e.__isNew__) { // if it's a new tag
                                                                        let tagID = (await view.props.gruntman.do( // create it!
                                                                            "tag.create",
                                                                            {
                                                                                uid: view.props.uid,
                                                                                name: e.label,
                                                                            }, 
                                                                        )).id;
                                                                        let originalTags = view.state.possibleTags; // get tags
                                                                        originalTags.push({label: e.label, value: tagID}); // add our new tag
                                                                        view.setState({possibleTags: originalTags}); // sax-a-boom!
                                                                        return tagID;
                                                                    } else
                                                                        return e.value;
                                                                }):[]; // find the correct tags sets, or set it to an empty set
                                                                Promise.all(tids).then(tagIDs => {
                                                                    this.setState({tags: tagIDs}); // set the state
                                                                    this.props.gruntman.do(
                                                                        "task.update", 
                                                                        {
                                                                            uid: this.props.uid, 
                                                                            tid: this.props.tid, 
                                                                            query:{tags: tagIDs} // set a taskID
                                                                        }
                                                                    )
                                                                });
                                                            }}
                                                        />
                                                    </span>
                                                </div>
                                            </animated.div>
                                        )
                                })()}
                            </animated.div>
                        )}
                    } 
                </AnimationFactory>
            </div >


        )
    }
}

export default Task;

