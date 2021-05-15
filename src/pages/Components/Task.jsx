// A whole lotta imports

// Ionic components
import { IonItem, IonInput, IonContent, IonGrid, IonRow, IonCol, IonSegment, IonLabel, IonButton, IonPopover } from '@ionic/react';

// Detect whether is mobile
import { getPlatforms } from '@ionic/react';

// Like, your heart and soul
import React, { Component, findDOMNode } from 'react';
import ReactDOM from "react-dom";

// React Spring animation packages
import { Spring, animated, Keyframes } from 'react-spring/renderprops'

// Cool components 
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import * as chrono from 'chrono-node';
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable';

import TagsInput from './TagsInput'
import AutosizeInput from 'react-input-autosize';

import 'react-tagsinput/react-tagsinput.css'

// Our very own repeat UI
import Repeat from './Repeat';

// Our very own tag editor UI
import TagEditor from './TagEditor';

// Our very own calendar popover
import CalendarPopover from './CalendarPopover';

// Our very own CSS
import './Task.css';

// Our very own Backend Objects
import T from "../../backend/src/Objects/Task.ts";
import Tag from "../../backend/src/Objects/Tag.ts";
import { TagDatapackWidget, ProjectDatapackWidget } from  "../../backend/src/Widget";

import { RepeatRule, RepeatRuleType, Hookifier }  from "../../backend/src/Objects/Utils.ts";
import {Controlled as CodeMirror} from 'react-codemirror2'
//import 'codemirror/theme/material.css';
require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/markdown/markdown');
require('codemirror/mode/gfm/gfm');
require('codemirror/addon/display/placeholder');
require('codemirror/addon/scroll/simplescrollbars');
//require('codemirror/addon/display/fullscreen');
require('codemirror/addon/edit/matchbrackets');
require('codemirror/addon/edit/matchbrackets');
require('codemirror/keymap/vim');

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


function autosizingRenderInput ({addTag, ...props}) {
    let {onChange, value, ...other} = props
    return (
        <AutosizeInput style={{border: 0}} name="react-tagsinput-actualinput-delegation" type='text' onChange={onChange} value={value} {...other} />
    )
}

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
            taskEditMaxHeight: 350,
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
            taskObj: null, // the object we are reading from
            expanded: false, // are we expanded?
            deferDate: undefined, // what's our defer date?
            dueDate: undefined, // what's our due date?
            name: "", // what's our name string?
            desc: "",  // what's our description string?
            isFlagged: false, // are we flagged?
            isFloating: false, // are we floating? or just eating jello?
            project:null, // what's our project?
            tags: [], // what are the IDs of our tags?
            decoration: "",  // are we "od" "ds" or just just good ol' ""?
            availability: true, // are we avaliable? or are we deferred or blocked (in which case it'd be false.)
            isComplete: false, // are we completed?
            repeatRule: null, // do we have a repeatRule
            showRepeat: false, // is our repeat UI shown?
            showTagEditor: false, // is our TagEditor UI shown?
            deferPopoverShown: false, // is the defer calendar popover shown?
            duePopoverShown: false, // is the due calendar popover shown?
            startingCompleted: this.props.startingCompleted, // disable immediate onComplete animation for completed
            //possibleTags: this.props.datapack[0], // tags will need to be dynamically added, so
            haveBeenExpanded: (this.props.startOpen !== undefined && this.props.startOpen !== false), // did we render the edit part yet? optimization
            notificationPopoverShown: [false, null], // is our notification popover shown?
            notificationCalendarShown: false, // is the notification calendar shown?
            hasNotification: false, // do we have a notification scheudled?
            delegations: [], // task is delegated to...
            delegatedWorkspace: "", // task is delegated to workspace...
            delegatedTaskID: "", // the ID of the shadow task
            projectDatapackWidget: new ProjectDatapackWidget(props.cm), // the project datapack widget
            tagDatapackWidget: new TagDatapackWidget(props.cm), // the tag datapack widget
            projectDatapack: [], // the calculated project datapack
            tagDatapack: [], // the calculated tag datapack
            activelyRepeating: false, // are we actively playing the repeating animation?
            descExpanded: false,
            iconHovering: false,
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
        this.notificationCalender = React.createRef(); // what's my notification calandar?
        this.codeMirriscription = React.createRef(); // what's my description?
    }

    showRepeat() {this.setState({showRepeat: true})} // util func for showing repeat
    hideRepeat() {this.setState({showRepeat: false})} // util func for hiding repeat

    showTagEditor() {this.setState({showTagEditor: true})} // function for showing tag editor
    showTageEditor() {this.setState({showTageEditor: false})}  // function for hiding tag editor

    showNotificationPopover(e) {
        if (this.state.hasNotification)
            this.setState({notificationPopoverShown: [true, e.nativeEvent]})
        else 
            this.setState({notificationCalendarShown: true})
    }

    // Monster function to query task info TODO TODO #cleanmeup
    async loadTask() {
        let task = "chickeN";

        // Obviously we need this, the task info
        if (this.props.asyncObject) {
            this.openTask();
            task = await this.props.asyncObject;
        } else  {
            task = this.props.taskObject;
        }

        let [pdp, tdp] = await Promise.all([this.state.projectDatapackWidget.execute(), this.state.tagDatapackWidget.execute()]);

        // Setting state to update the rest of them elements
        this.setState({
            taskObj: task, // set task object
            name: task.name, // Set name field
            desc: task.description, // Set task description
            project: await task.async_project,  // Set project
            tags: await Promise.all(task.async_tags), // Set tag array
            isFloating: task.isFloating, // Set isFloating bool
            isFlagged: task.isFlagged, // Set is Flagged bool
            isComplete: task.isComplete, // Set is complete style
            repeatRule:task.repeatRule, // Set the repeat rule
            dueDate: task.due, 
            deferDate: task.defer,
            hasNotification: true, // TODO
            delegations: task.delegates, // TODO
            delegatedWorkspace: task.delegatedWorkspace, // TODO
            delegatedTaskID: task.delegatedTaskID, // TODO,
            projectDatapack: pdp,
            tagDatapack: tdp,
        }, this.refreshDecorations);
    }

    refreshDecorations() {
        let base = ""
        if (this.state.delegatedWorkspace && this.state.delegatedWorkspace !== "") 
            base = "delegated"
        if (this.state.dueDate && this.state.dueDate-(new Date()) < 0)
            this.setState({decoration: base+" od"}); // give 'em a red badge
        else if (this.state.dueDate && this.state.dueDate-(new Date()) < 24*60*60*1000) // or if this kid has not done his homework a day earlier
            this.setState({decoration: base+" ds"}); // give 'em an orange badge
        else
            this.setState({decoration: base}); // give 'em an nothing badge

        this.setState({availability: this.state.taskObj.available});

    }

    componentWillUnmount() {
        // TODO this seems to not work???
        this.props.taskObject.unhook(this.loadTask);
        this.state.tagDatapackWidget.unhook(this.loadTask);
        this.state.projectDatapack.unhook(this.loadTask);
    }

    componentDidMount() {

        this.loadTask(); // load the task when we mount   
        if (this.props.taskObject)
            this.props.taskObject.hook(this.loadTask);
        this.state.tagDatapackWidget.hook(this.loadTask);
        this.state.projectDatapackWidget.hook(this.loadTask);
        this.initialRenderDone = true;

        document.addEventListener('mousedown', this.detectOutsideClick, false); // and listen for clicks everywhere
        document.body.onclick = function(e) {   //when the document body is clicked
            if (window.event) {
                e = window.event.srcElement;           //assign the element clicked to e (IE 6-8)
            }
            else {
                e = e.target;                   //assign the element clicked to e
            }

            if (e.className && (e.className.indexOf('cm-link') != -1 || e.className.indexOf('cm-url') != -1)) {
                //if the element has a class name, and that is 'someclass' then...
                window.open(e.innerText, "_blank");
            }
        }

        //document.addEventListener('click', 
        //const timer = setTimeout(() => {
        //    const element = document.querySelector("pre");
        //    console.log("element!", element)
        //    //}, 2000)
        //console.log(findDOMNode("CodeMirror"))
        //console.log(document.getElementsByClassName("cm-link"))

        //element.addEventListener("click", () => {
        //    console.log("clicked element");
        //});
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
            this.setState({haveBeenExpanded: true, expanded:true});
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

        if (this.notificationCalender.current) // if our notification calendar is a thing that mounted
            if (this.notificationCalender.current.contains(e.target)) // and we are clicking inside that
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
            if (document.getElementById("airplane-hanger") && document.getElementById("airplane-hanger").contains(e.target))
                return;

        if (this.state.showRepeat) // if we are showing our repeat
            return; //click inside

        if (this.state.showTagEditor) // if we are showing TagEditor
            return; // click inside
        //
        if (e.target.className == " CodeMirror-line ") {
            return;
        }

        //otherwise,
        this.closeTask();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //        if (this.codeMirriscription.current) {
        //let urls = ReactDOM.findDOMNode(this.codeMirriscription.current).getElementsByClassName('cm-link') // Returns the elements
        //for (let url of urls) {
        //let u = url.innerHTML;
        //if (u.match(/^((https?|ftp):\/\/|\.{0,2}\/)/)) {
        //console.log(u);
        //url.innerHTML = `<a href="${u}">${u}</a>`
        //}
        //}
        //}
        //console.log(this.codeMirriscription);
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
            Hookifier.freeze();
            //this.props.gruntman.lockUpdates(); // tell gruntman to chill
        }
        else if (prevState.expanded !== this.state.expanded && this.state.expanded === false) { // if we closed a task
            if (getPlatforms().includes("mobile"))
                document.getElementById("abtib").style.display = "block";
            if (this.props.setDragEnabled) // if we are a draggable task
                this.props.setDragEnabled(true); // enable drag
            if (this.props.refreshHook)
                setTimeout(()=>this.props.refreshHook(), 300); // let the task close, then refresh
            //this.props.gruntman.unlockUpdates(); // tell gruntman to... grunt!
            setTimeout(()=>Hookifier.unfreeze(), 500);
        }
        if (prevProps.startOpen !== this.props.startOpen && this.props.startOpen) // we are newly starting open
            this.openTask(); // open task
    }


    // ready fo this?

    render() {

        return (
            <div ref={this.me}>

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



                                style={{
                                    minHeight: animatedProps.taskHeight, 
                                    maxHeight: animatedProps.taskMaxHeight, 
                                    margin: animatedProps.taskMargin, 
                                    background:animatedProps.taskBackground, 
                                    opacity:animatedProps.taskOpacity, 
                                    overflow: "hidden",
                                    display: animatedProps.taskDisplay,
                                    position: animated.taskPosition,
                                    padding: animatedProps.taskPadding,
                                }}
                            >

                                {/* Chapter 0: Utility Components */}

                                {/* Gotta get those on hover tips */}

                                {/* Chapter 1: Task Checkmark */}
                                {/* Who could have thought so much code goes into a checkbox? */}
                                <div style={{display: "inline-block", transform: "translateY(-3px)"}}>
                                    {/* First, an invisible checkmark */}
                                    <input 
                                        type="checkbox" 

                                        ref={this.actualCheck}
                                        id={"task-check-"+(this.props.taskObject ? this.props.taskObject.id : "temp-creation-task")} 
                                        className="task-check"
                                        checked={this.state.isComplete}
                                        onChange={()=>{
                                            //console.log(this.state.taskObj.isComplete)//;
                                            if (this.state.isComplete) {
                                                this.setState({isComplete: false}, ()=>setTimeout(()=>this.state.taskObj.uncomplete(), 800));

                                            } else {
                                                if (this.state.taskObj.repeatRule.isRepeating && this.state.taskObj.due) 
                                                    this.setState({activelyRepeating: true, isComplete:true}, async ()=> {
                                                        setTimeout(()=>this.state.taskObj.complete(), 800)
                                                        this.setState({activelyRepeating: false});
                                                    });
                                                else {
                                                    this.setState({isComplete: true}, ()=>setTimeout(()=>this.state.taskObj.complete(), 800));
                                                }
                                            }
                                        }} 
                                        style={{opacity: this.state.availability?1:0.35}}
                                    />

                                    {/* Oh yeah, that checkmark above you can't actually see */}
                                    {/* Here's what the user actually clicks on, the label! */}
                                    <label ref={this.checkbox} className={"task-pseudocheck "+this.state.decoration+((this.state.activelyRepeating)?" repeat":"")} id={"task-pseudocheck-"+(this.props.taskObject ? this.props.taskObject.id : "temp-creation-task")} htmlFor={"task-check-"+(this.props.taskObject ? this.props.taskObject.id : "temp-creation-task")}>&zwnj;</label>
                                </div>

                                {/* The animated input box */}
                                {/*	
                                */}
                                <animated.input 
                                    defaultValue={this.state.name} 
                                    onChange={(e)=>this.setState({name:e.target.value})} 
                                    onBlur={(_)=>{if (this.state.name !== this.state.taskObj.name) this.state.taskObj.name = this.state.name}}
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
                                    placeholder={this.props.localizations.nt} 
                                    style={{opacity: this.state.availability?1:0.35, textDecoration: animatedProps.taskNameDecoration}}
                                    onKeyDown={e => (e.key == "Enter")? this.setState({expanded: false}) : undefined}
                                />

                                {/* Task edit. The thing that slides open on edit. */}
                                {(() => {
                                    if (this.state.haveBeenExpanded===true)
                                        return(
                                            <>
                                            {/* And load up + hide the repeat UI, too! */}
                                            <Repeat taskObj={this.state.taskObj} reference={this.repeater} isShown={this.state.showRepeat} onDidDismiss={this.hideRepeat} cm={this.props.cm} localizations={this.props.localizations}/>
                                            {/* As well as load up + hide the tag editor!*/}
                                            <TagEditor reference={this.TagEditorRef} isShown={this.state.showTagEditor} onDidDismiss={()=>this.setState({showTagEditor: false})} localizations={this.props.localizations} cm={this.props.cm} localizations={this.props.localizations}/>

                                            <animated.div className="task-edit" style={{opacity: animatedProps.taskEditOpacity, overflow: "hidden",maxHeight: animatedProps.taskEditMaxHeight}}>

                                                {/* First, task description field */}
                                                {/*
                                                <textarea 
                            tabIndex='0'
                                                    placeholder={this.props.localizations.desc} 
                                                    className="task-desc" 
                                                    style={{marginBottom: 10}} 
                                                    defaultValue={this.state.desc}
                                                    onChange={(e)=>this.setState({desc:e.target.value})} 
                                                    onBlur={(_)=>{if (this.state.description !== this.state.taskObj.description) this.state.taskObj.description = this.state.desc}}
                                                >
                        </textarea>
                        */}
                                                <CodeMirror
                                                    ref={this.codeMirriscription}
                                                    tabIndex='0'
                                                    value={this.state.desc}

                                                    //options={options}
                                                    options={{
                                                        mode: 'gfm',
                                                        theme: `condution ${this.state.descExpanded? "expanded" : ""} ${this.state.iconHovering? "bghvr" : ""}`,
                                                        lineNumbers: false,
                                                        lineWrapping: true,
                                                        placeholder: this.props.localizations.desc,
                                                        scrollbarStyle: "null",
                                                        //xml: true,
                                                        highlightFormatting: true,
                                                        spellcheck: true,
                                                        matchBrackets: true,
                                                        continueList: true,
                                                        newineAndIndentContinueMarkdownList: true,
                                                        //vimMode: true,

                                                        //fullScreen: true,
                                                    }}
                                                    onBeforeChange={(editor, data, value) => {
                                                        this.setState({desc: value});
                                                        //console.log(value, editor, data)
                                                    }}
                                                    onBlur={(_)=>{
                                                        if (this.state.desc !== this.state.taskObj.description) this.state.taskObj.description = this.state.desc
                                                    }}
                                                    //onChange={(editor, data, value) => {
                                                    //}}
                                                />
                                                <i 
                                                    className={`fas fa-chevron-down expand-icon ${this.state.descExpanded? "rotated" : ""}`}
                                                    onClick={() => {
                                                        this.setState({descExpanded: !this.state.descExpanded}); 
                                                        //setTimeout(() => {this.forceUpdate()}, 3000);
                                                    }}
                                                    onMouseEnter={() => { this.setState({ iconHovering: true  })}}
                                                    onMouseLeave={() => { this.setState({ iconHovering: false })}}
                                                    //style={{transform: `${this.state.descExpanded? "rotate(180)" : "rotate(0)"}`}}
                                                ></i>

                                                {/* Task icon set. TODO delete task */}
                                                <div style={{display: "inline-block", marginBottom: 6, transform: "translateY(-5px)"}}>

                                                    {/*Delete icon*/}
                                                    <a data-tip={"LOCALIZE: Delete"} className="task-icon" style={{borderColor: "var(--task-icon-ring)", cursor: "pointer"}} onClick={()=>{
                                                        //this.props.engine.db.deleteTask(this.props.uid, this.props.tid);
                                                        this.closeTask();
                                                        this.props.taskObject.delete();

                                                    }}><i className="fas fa-trash" style={{margin: 3, fontSize: 15, transform: "translate(7px, 5px)"}}></i></a>

                                                    {/* Flagged icon */}
                                                    <a className="task-icon" style={{borderColor: this.state.isFlagged ? "var(--task-icon-ring-highlighted)":"var(--task-icon-ring)", cursor: "pointer"}} onClick={()=>{this.setState({isFlagged:!this.state.isFlagged}, ()=>this.state.taskObj.isFlagged = this.state.isFlagged)}}><i className="fas fa-flag" style={{margin: 3, color: this.state.isFlagged ? "var(--task-icon-highlighted)" : "var(--task-icon-text)", fontSize: 15, transform: "translate(7px, 5px)"}} ></i></a>

                                                    {/* Floating icon */}
                                                    <a data-tip="LOCALIZE: Floating" className="task-icon" style={{borderColor: this.state.isFloating? "var(--task-icon-ring-highlighted)":"var(--task-icon-ring)", cursor: "pointer"}} onClick={()=>{this.setState({isFloating:!this.state.isFloating}, ()=>this.state.taskObj.isFloating = this.state.isFloating)}}><i className="fas fa-globe-americas" style={{margin: 3, color: this.state.isFloating? "var(--task-icon-highlighted)" : "var(--task-icon-text)", fontSize: 15, transform: "translate(7px, 5px)"}} ></i></a>

                                                    {/* Repeat icon that, on click, shows repeat */}
                                                    <a onClick={this.showRepeat} className="task-icon" style={{borderColor: (this.state.taskObj && this.state.taskObj.repeatRule && this.state.taskObj.repeatRule.isRepeating && this.state.taskObj.due)? "var(--task-icon-ring-highlighted)" : "var(--task-icon-ring)", cursor: "pointer"}} data-tip="LOCALIZE: Repeat"><i className="fas fa-redo" style={{margin: 3, color: (this.state.taskObj &&  this.state.taskObj.repeatRule &&this.state.taskObj.repeatRule.isRepeating && this.state.taskObj.due)?"var(--task-icon-highlighted)": "var(--task-icon-text)", fontSize: 15, transform: "translate(6.5px, 5.5px)"}} ></i></a>

                                                    {/* Notification icon that, on click, shows notify popover */}
                                                    {/*<CalendarPopover  gruntman={this.props.gruntman} reference={this.notificationCalender} uid={this.props.uid} disableOnclick engine={this.props.engine} isShown={this.state.notificationCalendarShown} onDidDismiss={()=>this.setState({notificationCalendarShown: false})} useTime initialDate={this.state.dueDate} onDateSelected={(d)=>{
                                                        this.props.gruntman.cancelNotification(this.props.tid).then(()=>{
                                                            this.props.gruntman.scheduleNotification(this.props.tid, this.props.uid, this.state.name, this.state.desc, d);
                                                            this.setState({hasNotification: true});
                                                        });
                                                    }}/>*/}
                                                    <IonPopover
                                                        showBackdrop={false}
                                                        isOpen={this.state.notificationPopoverShown[0]}
                                                        cssClass='notif-popover'
                                                        mode="md" 
                                                        onDidDismiss={e => this.setState({notificationPopoverShown: [false, null]})}
                                                        event={this.state.notificationPopoverShown[1]}
                                                        ref={this.notificationPopover}
                                                    >
                                                        <div>
                                                            <div className="notification-popover-item" onClick={()=>{
                                                                this.props.gruntman.cancelNotification(this.props.tid)
                                                                this.setState({hasNotification: false, notificationPopoverShown: [false, null]});
                                                            }}>Cancel Notification</div>
                                                            <div className="notification-popover-item" onClick={()=>this.setState({notificationCalendarShown: true, notificationPopoverShown:[false, null]})}>Change Notification</div>
                                                        </div>
                                                    </IonPopover>
                                                    {/*(()=>{
                                                    we are just not going to talk about it
                                                        if (this.props.gruntman.notifPermissionGranted && !(getPlatforms().includes("mobileweb") || getPlatforms().includes("desktop")))
                                                            return <a onClick={this.showNotificationPopover} className="task-icon" style={{borderColor: "var(--task-icon-ring)", cursor: "pointer"}} data-tip="LOCALIZE: Repeat"><i className="fas fa-bell" style={{margin: 3, color: "var(--task-icon-text)", fontSize: 15, transform: "translate(7px, 5.5px)"}} ></i></a>
                                                    })()*/}

                                                    {/* TagEditor icon that shows TagEditor on click*/}
                                                    <a onClick={this.showTagEditor} className="task-icon" style={{borderColor: "var(--task-icon-ring)", marginRight: 20, cursor: "pointer"}} data-tip="LOCALIZE: Freaking TagEditor"><i className="fas fa-tags" style={{margin: 3, color: "var(--task-icon-text)", fontSize: 15, transform: "translate(6.5px, 5.5px)"}}></i></a>
                                                    {/*<div className="task-icon" style={{borderColor: "var(--task-checkbox-feature-alt)", marginRight: 20}}><a className="fas fa-globe-americas" style={{margin: 3, color: "var(--task-textbox)", fontSize: 13, transform: "translate(2.5px, -0.5px)"}}></a></div>*/}
                                                </div>


                                                {/* Task date set */}
                                                <div style={{display: "inline-block", marginBottom: 8, marginRight: 12}}>

                                                    {/* Defer date container */}
                                                    <div style={{display: "inline-block", marginRight: 10, marginBottom: 5, marginLeft: 6}}>
                                                        {/* The. Defer. Date. */}
                                                        <i className="fas fa-play" data-tip="LOCALIZE: Defer Date" style={{transform: "translateY(-1px)", marginRight: 10, color: "var(--task-icon)", fontSize: 10}}></i>
                                                        <CalendarPopover localizations={this.props.localizations} cm={this.props.cm} reference={this.deferPopover} uid={this.props.uid} isShown={this.state.deferPopoverShown} onDidDismiss={()=>this.setState({deferPopoverShown: false})} useTime initialDate={this.state.deferDate} onDateSelected={(d)=>{
                                                            this.state.taskObj.defer = d;
                                                            //                                                            this.props.gruntman.do(
                                                            //"task.update", { uid: this.props.uid, tid: this.props.tid, query:{defer:d, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone}}
                                                            //)
                                                            this.setState({deferDate: d});

                                                        }}/>
                                                        {(() => {
                                                            {/* The. Defer. Date. Input. */}
                                                            const DateInput = ({ value, onClick }) => { 
                                                                return (
                                                                    <input 
                                                                        tabIndex='0'
                                                                        className={"task-datebox "+this.state.decoration}
                                                                        readOnly={(getPlatforms().includes("mobile"))} defaultValue={value} onKeyPress={(e)=>{
                                                                            let d = chrono.parseDate(e.target.value);
                                                                            if (e.key==="Enter" && d)
                                                                                this.setState({deferDate: d}, ()=>{this.state.taskObj.defer = d});

                                                                        }} 
                                                                        onFocus={(e) => {
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
                                                                        this.state.taskObj.defer = date;
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
                                                        <CalendarPopover localizations={this.props.localizations} reference={this.duePopover} uid={this.props.uid} cm={this.props.cm} isShown={this.state.duePopoverShown} onDidDismiss={()=>this.setState({duePopoverShown: false})} useTime initialDate={this.state.dueDate} onDateSelected={(d)=>{
                                                            this.state.taskObj.due = d;
                                                            //                                                            this.props.gruntman.do(
                                                            //"task.update", { uid: this.props.uid, tid: this.props.tid, query:{due:d, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone}}
                                                            //)
                                                            this.setState({dueDate: d});

                                                        }}/>
                                                        {(() => {
                                                            const DateInput = ({ value, onClick }) => { 
                                                                return (
                                                                    <input 
                                                                        tabIndex='0'
                                                                        className={"task-datebox "+this.state.decoration} readOnly={(getPlatforms().includes("mobile")) ? true : false} defaultValue={value} onKeyPress={(e)=>{
                                                                            let d = chrono.parseDate(e.target.value);
                                                                            if (e.key==="Enter" && d)
                                                                                this.setState({dueDate: d}, ()=>{this.state.taskObj.due= d});

                                                                        }}


                                                                        onFocus={(e) => {
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
                                                                        this.state.taskObj.due = date;
                                                                    }}
                                                                />
                                                            )
                                                        })()}
                                                    </div>
                                                </div>
                                                <div className="tag-container" style={{display: this.props.cm.isInWorkspace ? "inline-flex":"none", marginBottom: 8, marginLeft: 5, alignItems: "center"}}>
                                                    <i className="fas fa-user-plus" style={{marginRight: 10, color: "var(--task-icon)", fontSize: 12}}></i>
                                                    <TagsInput className="react-tagsinput delegation-textbox" tagProps={{className: "react-tagsinput-tag delegation-delegate"}} inputProps={{className: "react-tagsinput-input delegation-input"}} value={this.state.delegations} onChange={(list)=>{
                                                        let isValid = true;
                                                        list.filter(e=>!this.state.delegations.includes(e)).forEach(newAccount => {
                                                            if (/\w+@\w+\.\w+/.test(newAccount))
                                                                this.state.taskObj.delegateTo(newAccount);
                                                            else 
                                                                isValid = false;
                                                        });
                                                        this.state.delegations.filter(e=>!list.includes(e)).forEach(removedAccount => {
                                                            this.state.taskObj.dedelegateFrom(removedAccount);
                                                        });

                                                        if (isValid)
                                                            this.setState({delegations: list});
                                                    }} renderInput={autosizingRenderInput} inputProps={{placeholder: this.props.localizations.workspace_email}} />
                                                </div>

                                                <div>
                                                    <span className="task-project-container">
                                                        <i className="fas fa-list-ul" style={{margin: 3, color: "var(--task-icon)", fontSize: 13, marginRight: 5, transform: "translateY(5px)"}}></i>
                                                        <Select 
                                                            options={this.state.projectDatapack}
                                                            className='task-project'
                                                            classNamePrefix='task-select'
                                                            isClearable
                                                            styles={{
                                                                // Fixes the overlapping problem of the component
                                                                menuPortal: provided => ({ ...provided, zIndex: "99999 !important" })
                                                            }}
                                                            menuPortalTarget={document.body}
                                                            value={this.state.project ? {value: this.state.project, label: this.state.project?this.state.project.name:""} : null}
                                                            onChange={(e)=>{
                                                                if (!e) {
                                                                    this.setState({project: null}, ()=>this.state.taskObj.moveTo(null));
                                                                    return;
                                                                }

                                                                this.setState({project: e.value}, ()=>this.state.taskObj.moveTo(e.value));
                                                            }}
                                                        />
                                                    </span>


                                                    <span className="task-tag-container">
                                                        <i className="fas fa-tags" style={{margin: 3, color: "var(--task-icon)", fontSize: 13, transform: "translateY(5px)"}}></i>
                                                        <CreatableSelect
                                                            options={this.state.tagDatapack}
                                                            className='task-tag'
                                                            classNamePrefix='task-select'
                                                            isClearable
                                                            isMulti
                                                            styles={{ menuPortal: base => ({ ...base, zIndex: "99999 !important" }) }}
                                                            menuPortalTarget={document.body}
                                                            value={this.state.tagDatapack.filter(option => this.state.tags.includes(option.value))}
                                                            onChange={async (newValue, _) => {
                                                                let tags = await Promise.all(newValue?newValue.map(async (e) => { // for each tag
                                                                    if (e.__isNew__) {// if it's a new tag
                                                                        // TODO TODO
                                                                        let newTag = await Tag.create(this.props.cm, e.label);
                                                                        this.setState({tagDatapack: [...this.state.tagDatapack, {value: newTag, label:e.label}]});
                                                                        return (newTag);
                                                                    } else {
                                                                        return e.value
                                                                    }
                                                                }):[]);
                                                                this.setState({tags}, ()=>{this.state.taskObj.tags = tags});


                                                                //"tag.create",
                                                                //{
                                                                //uid: view.props.uid,
                                                                //name: e.label,
                                                                //} 
                                                                //)).id;

                                                                //// TODO new tags don't show up to tags pane
                                                                //let originalTags = view.state.possibleTags; // get tags
                                                                //                                                                        originalTags.push({label: e.label, value: tagID}); // add our new tag
                                                                //view.setState({possibleTags: originalTags}); // sax-a-boom!
                                                                //return tagID;
                                                                //} else
                                                                //return e.value;
                                                                //}):[]; // find the correct tags sets, or set it to an empty set
                                                                // TODO TODO
                                                                //                                                                Promise.all(tids).then(tagIDs => {
                                                                //this.setState({tags: tagIDs}); // set the state
                                                                //this.props.gruntman.do(
                                                                //"task.update", 
                                                                //{
                                                                //uid: this.props.uid, 
                                                                //tid: this.props.tid, 
                                                                //query:{tags: tagIDs} // set a taskID
                                                                //}
                                                                //)
                                                                //});
                                                            }}
                                                        />
                                                    </span>
                                                </div>
                                            </animated.div>
                                            </>
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

