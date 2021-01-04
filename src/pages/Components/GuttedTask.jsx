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
    // Incomplete->complete animation for static
    staticComplete: [
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
		taskOpacity: 0.5,
                taskMargin: "0px 8px", 
            },
            config: {
                tension: 800,
                friction: 50,
                mass: 1
            },
        }
    ],
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
class GuttedTask extends Component {

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
            haveBeenExpanded: (this.props.startOpen !== undefined && this.props.startOpen !== false), // did we render the edit part yet? optimization
            notificationPopoverShown: [false, null], // is our notification popover shown?
            notificationCalendarShown: false, // is the notification calendar shown?
            hasNotification: false, // do we have a notification scheudled?
            delegations: [], // task is delegated to...
            delegatedWorkspace: "", // task is delegated to workspace...
            delegatedTaskID: "" // the ID of the shadow task
        }
        this.initialRenderDone = true; // wait for data to load to make animation decisions
        this.me = React.createRef(); // who am I? what am I?
        this.checkbox = React.createRef(); // who am I? what am I?
        this.actualCheck = React.createRef(); // who am I? what am I?
    }

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
					: 
					    (this.props.isStatic? 
						"staticComplete" : "complete")) // if we are complete,  and don't start completed, complete. 
                                        : // if we arnt complete, 
                                this.state.startingCompleted ?  // and we start complete 
				(this.props.isStatic? "staticComplete" : "complete" )
				    //"complete" :
				    :
                                (this.state.expanded? "show":"hide")):"hide"
                    } // if we are incomplete, and we start incomplete, then show or hide based on expanded 

                >
                    {animatedProps => {
                        return (
                            // Actual task container, now
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
                                            if (this.state.isComplete && this.props.uncomplete) {
                                                this.props.uncomplete();
                                                this.setState({isComplete: false})
						console.log("uncomp", this.props.tid)
                                            }
                                            // If we are completing a task (that is, currently task is incomplete)
                                            else if (!this.state.isComplete && this.props.complete) {
                                                this.props.complete();
                                                this.setState({isComplete: true})
						console.log("comping", this.props.tid)
                                            }
                                        }} 
                                    />

                                    {/* Oh yeah, that checkmark above you can't actually see */}
                                    {/* Here's what the user actually clicks on, the label! */}
                                    <label ref={this.checkbox} className={"task-pseudocheck "+this.state.decoration} id={"task-pseudocheck-"+this.props.tid} htmlFor={"task-check-"+this.props.tid}>&zwnj;</label>
                                </div>

                                {/* The animated input box */}
                                <animated.input 
                                    value={this.props.name} 
				    className={
					`task-name no-select ${this.props.inputStyle?
					    this.props.inputStyle : ""}`} 
                                    readOnly={true} 
                                    type="text" 
                                    autoComplete="off" 
				    placeholder={this.props.localizations.nt} 
                                    style={{
					opacity: this.state.availability?1:0.35, 
					textDecoration: animatedProps.taskNameDecoration,
					//fontWeight: 100,
				    }}
                                />
                            </animated.div>
                        )}
                    } 
                </AnimationFactory>
            </div >


        )
    }
}

export default GuttedTask;

