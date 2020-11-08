import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet, IonMenuToggle, isPlatform } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component, useState } from 'react';
import './Calendar.css'
import './Pages.css';
import ReactTooltip from 'react-tooltip';
import { withRouter } from "react-router";

import Task from './Components/Task';

const autoBind = require('auto-bind/react');



/* 
 *
 * Apparently,
 * People like calendars.
 *
 * WHY?
 *
 * People don't respect 
 * the existance 
 * of the whole idea of GTD.
 *
 * Seriously.
 *
 * Why. A calendar?! in a GTD app.
 *
 * FINE. Here's your calendar.
 *
 * @jemoka
 *
 *
 */

function CalPagelendar(props) {
    let [dateSelected, setDateSelected] = useState(new Date());

    let currentMonth = dateSelected.getMonth();
    let currentYear = dateSelected.getFullYear();

    let firstDayMonth = new Date(currentYear, currentMonth, 1);
    let lastDayMonth = new Date(currentYear, currentMonth+1, 0);
    let lastDayLastMonth = new Date(currentYear, currentMonth, 0);

    let firstDayDayname = firstDayMonth.getDay()+1;

    let daysBefore = [...new Array(firstDayDayname-1)].map((_, i)=>{return {type: "pre", content: i+lastDayLastMonth.getDate()-(firstDayDayname-1)+1}});

    let daysAfter = [...new Array((6-lastDayMonth.getDay()===-1)?6:6-lastDayMonth.getDay())].map((_, i)=>{return {type:"post", content:i+1}});

    let contentDays = [...new Array(lastDayMonth.getDate())].map((_, i)=>{return {type:"actual", content:i+1}});

    return (
        <div id="calendar-page-calendar-wrapper" style={{display: "inline-block", ...props.style}}>
            <div id="calendar-wrapper">
                <div id="calendar-daterow">
                    <span className="calendar-daterow-item">Sun</span>
                    <span className="calendar-daterow-item">Mon</span>
                    <span className="calendar-daterow-item">Tues</span>
                    <span className="calendar-daterow-item">Wed</span>
                    <span className="calendar-daterow-item">Thu</span>
                    <span className="calendar-daterow-item">Fri</span>
                    <span className="calendar-daterow-item">Sat</span>
                </div>
                <div id="calendar-container">
                    {[...daysBefore,...contentDays,...daysAfter].map(i =>
                    <span className={`calendar-container-item calendar-container-item-${i.type} calendar-container-item-${i.content}`} style={{backgroundColor: (i.type === "actual" && i.content === dateSelected.getDate()) ? "var(--decorative-light)":"inherit"}} onClick={(e)=>{
                        let date;
                        if (i.type === "pre")
                            date = new Date(lastDayLastMonth.getFullYear(), lastDayLastMonth.getMonth(), i.content);
                        if (i.type === "actual") 
                            date = new Date(firstDayMonth.getFullYear(), firstDayMonth.getMonth(), i.content);
                        if (i.type === "post") 
                            date = new Date(firstDayMonth.getFullYear(), firstDayMonth.getMonth()+1, i.content);
                        setDateSelected(date);
                        if (props.onDateSelected)
                            props.onDateSelected(date);
                    }}>{i.content}</span>
                    )}
                </div>
                <div id="calendar-infopanel">
                    <div className="calendar-infopanel-dateselected">{dateSelected.getDate()}</div>
                    <div className="calendar-infopanel-datename">{dateSelected.toLocaleString('en-us', {  weekday: 'long' })}</div>
                    <div className="calendar-infopanel-month">{dateSelected.toLocaleString('en-us', { month: 'long' })}</div>
                    <div className="calendar-infopanel-year">{dateSelected.getFullYear()}</div>
                </div>
                <div id="calendar-tools">
                    <a className="fas fa-caret-left calendar-button" onClick={()=>{
                        let date = new Date(firstDayMonth.getFullYear(), firstDayMonth.getMonth()-1, 1);
                        setDateSelected(date);
                        if (props.onDateSelected)
                            props.onDateSelected(date);

                    }}></a>
                    <a className="fas fa-caret-right calendar-button" onClick={()=>{
                        let date = new Date(firstDayMonth.getFullYear(), firstDayMonth.getMonth()+1, 1);
                        setDateSelected(date);
                        if (props.onDateSelected)
                            props.onDateSelected(date);

                    }}></a>
                    <div className="calendar-today" onClick={()=>{
                        setDateSelected(new Date());
                        if (props.onDateSelected)
                            props.onDateSelected(new Date());

                    }}>Today</div>

                </div>
            </div>
        </div>
    )
}



class Calendar extends Component {

    constructor(props) {
        super(props);

        let today = new Date();
        today.setTime(0,0,0,0);

        this.state = {
            possibleProjects:{}, // stuff for tasks and projects to work: see jacks comments in upcoming 
            possibleTags:{}, 
            possibleProjectsRev:{}, 
            possibleTagsRev:{}, 
            availability: [], 
            projectSelects:[], 
            tagSelects: [], 
            projectDB: {},
            currentDate: (today), // new date
            taskList: []

        };

        this.updatePrefix = this.random();
        this.props.gruntman.registerRefresher((this.refresh).bind(this));
        this.repeater = React.createRef(); // what's my repeater? | i.. i dont know what this does...

        // AutoBind!
        autoBind(this);
    }
    showEdit() {
        this.setState({showEdit: true})
    } // util func for showing repeat
    hideEdit() {
        this.setState({showEdit: false});
    } // util func for hiding repeat

    componentWillUnmount() {
        this.props.gruntman.halt(); // when we unmount, halt gruntman? idk what this does  
    }

    async refresh() {
        let avail = await this.props.engine.db.getItemAvailability(this.props.uid) // get availability of items
        let pPandT = await this.props.engine.db.getProjectsandTags(this.props.uid); // get projects and tags


        let projectList = []; // define the project list
        let tagsList = []; // define the tag list

        for (let pid in pPandT[1][0]) // tag nd project stuff 
            tagsList.push({value: pid, label: pPandT[1][0][pid]});
        let views = this;
        let projectDB = await (async function() {
            let pdb = [];
            let topLevels = (await views.props.engine.db.getTopLevelProjects(views.props.uid))[0];
            for (let key in topLevels) {
                pdb.push(await views.props.engine.db.getProjectStructure(views.props.uid, key, true));
            }
            return pdb;
        }());

        let buildSelectString = function(p, level) {
            if (!level)
                level = ""
            projectList.push({value: p.id, label: level+pPandT[0][0][p.id]})
            if (p.children)
                for (let e of p.children)
                    if (e.type === "project")
                        buildSelectString(e.content, level+":: ");
        };

        projectDB.map(proj=>buildSelectString(proj));

        let endDate = this.state.currentDate;
        endDate.setTime(23,59,59,59);

        let taskList = await this.props.engine.db.selectTasksInRange(this.props.uid, this.state.currentDate, endDate);

        this.setState({
            possibleProjects: pPandT[0][0],	     // set the project stuff
            possibleTags: pPandT[1][0],		    // set the tag stuff  
            possibleProjectsRev: pPandT[0][1],	   // set more projects stuff  
            possibleTagsRev: pPandT[1][1],	  // set more tags stuff  
            availability: avail,		 // set the avail
            projectSelects: projectList,	// set the project list  
            tagSelects: tagsList,	       // set the tag list
            projectDB, 			      // and the project db 
            currentDate: (new Date()), // new date
            taskList
        }); // once we finish, set the state
    }

    componentDidMount() {
        this.refresh()
    }

    random() { return (((1+Math.random())*0x10000)|0).toString(16)+"-"+(((1+Math.random())*0x10000)|0).toString(16);}

    render() {
        return (
            <IonPage>
                {/* the perspective editor! */}
                <div className={"page-invis-drag " + (()=>{
                    if (!isPlatform("electron")) // if we are not running electron
                        return "normal"; // normal windowing proceeds
                    else if (window.navigator.platform.includes("Mac")){ // macos
                        return "darwin"; // frameless setup
                    }
                    else if (process.platform === "win32") // windows
                        return "windows"; // non-frameless

                })()}>&nbsp;</div>
                <div className={"page-content " + (()=>{
                    if (!isPlatform("electron")) // if we are not running electron
                        return "normal"; // normal windowing proceeds
                    else if (window.navigator.platform.includes("Mac")){ // macos
                        return "darwin"; // frameless setup
                    }
                    else if (process.platform === "win32") // windows
                        return "windows"; // non-frameless

                })()}>

                    <div className="header-container" >
                        <div style={{display: "inline-block"}}>
                            <div> 
                                <IonMenuToggle>
                                    <i className="fas fa-bars" 
                                        style={{marginLeft: 20, color: "var(--decorative-light-alt"}} />
                                </IonMenuToggle> 
                                <h1 className="page-title">
                                    <i style={{paddingRight: 10}} 
                                        className="fas fa-layer-group">
                                    </i>
                                    Calendar
                                </h1> 
                                <ReactTooltip effect="solid" offset={{top: 3}} backgroundColor="black" className="tooltips" />
                            </div> 
                        </div>
                    </div>

                    <div style={{marginLeft: 10, marginRight: 10, overflowY: "scroll"}}>
                        <div id="calendar-page-wrapper">
                            <CalPagelendar onDateSelected={(async function(d){
                                let endDate = new Date(d.getTime());;
                                endDate.setTime(23,59,59,59);
                                let taskList = await this.props.engine.db.selectTasksInRange(this.props.uid, d, endDate);
                                console.log(taskList, d, endDate)
                                this.setState({currentDate: d, taskList});
                            }).bind(this)}/>
                            <div id="calendar-page-taskpage-wrapper">
                                {this.state.taskList.map(e=><span>{e}</span>)}
                            </div>
                        </div>
                        <div className="bottom-helper">&nbsp;</div>
                    </div>
                </div>
            </IonPage>
        )
    }
}
export default Calendar;

