import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet, IonMenuToggle, isPlatform } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component, useState, useEffect } from 'react';
import {withGetScreen} from 'react-getscreen'
import ReactTooltip from 'react-tooltip';
import { withRouter } from "react-router";

import Task from './Components/Task';
import { Query } from "../backend/src/Objects/Utils.ts";
import T from "../backend/src/Objects/Task.ts";
import CalendarPopover, { CalendarUnit } from './Components/CalendarPopover';
import CalendarTasklistPopover from './Components/CalendarTasklistPopover';

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

let refreshed = 0;

function CalPageBigOllendar(props) {


    function __util_calculate_gradient(left, right, gradientAmount) {
        let color1 = left;
        let color2 = right;
        let ratio = gradientAmount;
        let hex = function(x) {
            x = x.toString(16);
            return (x.length == 1) ? '0' + x : x;
        };

        let r = Math.ceil(parseInt(color1.substring(0,2), 16) * ratio + parseInt(color2.substring(0,2), 16) * (1-ratio));
        let g = Math.ceil(parseInt(color1.substring(2,4), 16) * ratio + parseInt(color2.substring(2,4), 16) * (1-ratio));
        let b = Math.ceil(parseInt(color1.substring(4,6), 16) * ratio + parseInt(color2.substring(4,6), 16) * (1-ratio));

        return hex(r) + hex(g) + hex(b);
    }

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

    let [heat, setHeat] = useState({});

    let [isPopoverShown, setIsPopoverShown] = useState(false);

    let [shownList, setShownList] = useState([]);
    
    Array.prototype.max = function() {
        return Math.max.apply(null, this);
    };

    let refresh = (async function() {
            let map = new Map();
            let names = new Map();
            let ids = new Map();
            let hm = {};
            let q = new Query(props.cm);
            let taskList = await q.execute(T, (tsk => (firstDayMonth <= tsk.due && tsk.due <= lastDayMonth && !tsk.isComplete)));

        await Promise.all(taskList.map(task  => {
                let weight = task.weight;
                let date = task.due;
                date.setHours(0, 0, 0, 0);
                let time = date.getDate();
                if(map.has(time))
                    map.set(time, map.get(time)+weight);
                else
                    map.set(time, weight);
                if(names.has(time))
                    names.set(time, [...names.get(time), task.name]);
                else
                    names.set(time, [task.name]);
                if(ids.has(time))
                    ids.set(time, [...ids.get(time), task.id]);
                else
                ids.set(time, [task.id]);

            }));
            let values = Array.from(map.values());
            let nameList = Array.from(names.values());
            let idList = Array.from(ids.values());
            if (values.length > 0) {
                let max = values.max();
                let style = getComputedStyle(document.body);
                let hexes = values.map(e=>__util_calculate_gradient(style.getPropertyValue('--heatmap-darkest').trim().slice(1), style.getPropertyValue('--heatmap-lightest').trim().slice(1), e/max));
                Array.from(map.keys()).forEach((e, i)=>{hm[e]={color:hexes[i], value:values[i], names:nameList[i], ids: idList[i]}});
            }
            setHeat(hm);
        })

    useEffect(()=>{
        refresh();
    },[dateSelected, refreshed]);

    return (
        <div id="calendar-page-bigol-calendar-wrapper" style={{display: "inline-block", height: "85%", width: "95%", ...props.style}}>
            <CalendarTasklistPopover uid={props.uid} cm={props.cm} isShown={isPopoverShown} onDidDismiss={()=>setIsPopoverShown(false)} list={shownList} localizations={props.localizations} currentDate={dateSelected}/>
            <div id="bigol-calendar-wrapper">
                <div id="bigol-calendar-daterow">
                    <span className="bigol-calendar-daterow-item">Sun</span>
                    <span className="bigol-calendar-daterow-item">Mon</span>
                    <span className="bigol-calendar-daterow-item">Tues</span>
                    <span className="bigol-calendar-daterow-item">Wed</span>
                    <span className="bigol-calendar-daterow-item">Thu</span>
                    <span className="bigol-calendar-daterow-item">Fri</span>
                    <span className="bigol-calendar-daterow-item">Sat</span>
                </div>
                <div id="bigol-calendar-container">
                    {[...daysBefore,...contentDays,...daysAfter].map(i =>
                    <span className={`bigol-calendar-container-item calendar-container-item-${i.type} calendar-container-item-${i.content}`} style={{
                        backgroundColor: ((heat[i.content]&&i.type === "actual") ? 
                            `#${heat[i.content].color}` :
                            "inherit")
                    }}
                        onClick={(e)=>{
                            let date;
                            if (i.type === "pre")
                                date = new Date(lastDayLastMonth.getFullYear(), lastDayLastMonth.getMonth(), i.content);
                            if (i.type === "actual") 
                                date = new Date(firstDayMonth.getFullYear(), firstDayMonth.getMonth(), i.content);
                            if (i.type === "post") 
                                date = new Date(firstDayMonth.getFullYear(), firstDayMonth.getMonth()+1, i.content);
                            setDateSelected(date);
                            if (heat[i.content])
                                setShownList(heat[i.content].ids);
                            else
                                setShownList([]);
                            setIsPopoverShown(true)
                            if (props.onDateSelected)
                                props.onDateSelected(date);
                        }}>
                        <div className="calendar-date-text">
                            {i.content}<span className="calendar-date-value">{(heat[i.content]&&i.type==="actual")?`${heat[i.content].value} ${props.localizations.weighted}`:null}</span></div><div style={{marginLeft: 6, marginRight: 5, marginBottom: 2}}>{((heat[i.content]&&i.type==="actual")?heat[i.content].names:[]).map((name)=><span className="calendar-date-taskname"><div className="calendar-task-circle">&nbsp;</div>{name}</span>)}</div>
                    </span>
                    )}
                </div>
                <div id="bigol-calendar-tools">
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

                    }}>{props.localizations.clbtd}</div>


                </div>

                <div id="bigol-calendar-infopanel">
                    <div id="bigol-calendar-dategroup">
                        <div className="bigol-calendar-infopanel-dateselected">{dateSelected.getDate()}</div>
                        <div className="bigol-calendar-infopanel-datename">{dateSelected.toLocaleString(props.localizations.getLanguage(), {  weekday: 'long' })}</div>
                        <div className="bigol-calendar-infopanel-month">{dateSelected.toLocaleString(props.localizations.getLanguage(), { month: 'long' })}</div>
                        <div className="bigol-calendar-infopanel-year">{dateSelected.getFullYear()}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}



class Calendar extends Component {

    constructor(props) {
        super(props);

        let today = new Date();
        today.setHours(0,0,0,0);

        this.state = {
            currentDate: (today), // new date
            taskList: [],
            popoverIsVisible: false,

        };

        this.updatePrefix = this.random();
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
    }

    async refresh() {
//        projectDB.map(proj=>buildSelectString(proj));

        //let endDate = new Date(this.state.currentDate);
        //endDate.setHours(23,59,59,60);
        //let taskList = await this.props.engine.db.selectTasksInRange(this.props.uid, this.state.currentDate, endDate);

        //refreshed++;

        //this.setState({
            //possibleProjects: pPandT[0][0],	     // set the project stuff
            //possibleTags: pPandT[1][0],		    // set the tag stuff  
            //possibleProjectsRev: pPandT[0][1],	   // set more projects stuff  
            //possibleTagsRev: pPandT[1][1],	  // set more tags stuff  
            //availability: avail,		 // set the avail
            //projectSelects: projectList,	// set the project list  
            //tagSelects: tagsList,	       // set the tag list
            //projectDB, 			      // and the project db 
            //taskList
        //}); // once we finish, set the state
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
                    else 
                        return "windows"; // ummm, it does not know about windows pt.n
                })()}>&nbsp;</div>
                <div className={"page-content " + (()=>{
                    if (!isPlatform("electron")) // if we are not running electron
                        return "normal"; // normal windowing proceeds
                    else if (window.navigator.platform.includes("Mac")){ // macos
                        return "darwin"; // frameless setup
                    }
                    else if (process.platform === "win32") // windows
                        return "windows"; // non-frameless
                    else 
                        return "windows"; // ummm, it does not know about windows pt.n
                })()}>

                    <div className="header-container" >
                        <div style={{display: "inline-block"}}>
                            <div> 
                                <IonMenuToggle>
                                    <i className="fas fa-bars" 
                                        style={{marginLeft: 20, color: "var(--page-header-sandwich)"}} />
                                </IonMenuToggle> 
                                <h1 className="page-title">
                                    <i style={{paddingRight: 10}} 
                                        className="fas fa-calendar-alt">
                                    </i>
                                    {this.props.localizations.calendar}
                                </h1> 
                                <ReactTooltip effect="solid" offset={{top: 3}} backgroundColor="black" className="tooltips" />
                            </div> 
                        </div>
                    </div>
                    <div style={{marginLeft: 10, marginRight: 10, overflowY: "scroll", height: "100%"}}>
                        <div id="calendar-page-wrapper">
                            {(()=>{
                                if (this.props.isMobile())
                                    return <CalendarUnit localizations={this.props.localizations} uid={this.props.uid} cm={this.props.cm} isShown={this.state.popoverIsVisible} onDidDismiss={()=>this.setState({popoverIsVisible: false})}  onDateSelected={(async function(d){
                                        let endDate = new Date(d.getTime());
                                        endDate.setHours(23,59,59,60);
                                        let q = new Query(this.props.cm);
                                        let taskList = (await q.execute(T, (t)=>(d <= t.due && t.due <= endDate)));
                                        this.setState({currentDate: d, taskList});
                                    }).bind(this)}/>
                                else 
                                    return <CalPageBigOllendar localizations={this.props.localizations} uid={this.props.uid} cm={this.props.cm} availability={this.state.availability}/>
                            })()}
                            {(()=>{
                                if (this.props.isMobile())
                            return <div id="calendar-page-taskpage-wrapper">
                                <span id="calendar-page-header">
                                    <div class="calendar-page-count">{this.state.taskList.length}</div>
                                    <div class="calendar-page-title">tasks due on</div>
                                    <div class="calendar-page-date">{this.state.currentDate.toLocaleString('en-us', {  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'  })}</div>
                                </span>
                                {this.state.taskList.map(tsk=>(
                                    <Task cm={this.props.cm} localizations={this.props.localizations} key={tsk.id} taskObject={tsk}  />
                                ))}
                            </div>
                            })()}
                        <div className="bottom-helper">&nbsp;</div>
                        </div>
                    </div>
                </div>
            </IonPage>
        )
    }
}
export default withGetScreen(Calendar, {mobileLimit: 720, tabletLimit:768, shouldListenOnResize: true});

