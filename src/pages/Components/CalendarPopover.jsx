import { IonModal, IonContent, IonSelect, IonSelectOption } from '@ionic/react';
import { Dropdown } from 'react-bootstrap';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component, useState, useEffect } from 'react';
import '../Calendar.css';
//import OutsideClickHandler from 'react-outside-click-handler';
import "react-datepicker/dist/react-datepicker.css";
import * as chrono from 'chrono-node';
import Select from 'react-select'


/*
 * Hello human,
 * good morning.
 *
 * I am the repeat UI
 *
 * Rule denotes the repeat major rule: {no repeat, daily, weekly: yearly}
 * Advanced denotes whether the user is using fancy repeat
 * On denotes the advanced repeat signals. (like mon, tue, sat or something.)
 *
 * @jemoka
 *
 */


function CalendarPopover(props) {
    let [dateSelected, setDateSelected] = useState(props.initialDate ? props.initialDate : new Date());

    let currentMonth = dateSelected.getMonth();
    let currentYear = dateSelected.getFullYear();

    let firstDayMonth = new Date(currentYear, currentMonth, 1);
    let lastDayMonth = new Date(currentYear, currentMonth+1, 0);
    let lastDayLastMonth = new Date(currentYear, currentMonth, 0);

    let firstDayDayname = firstDayMonth.getDay()+1;

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

    let daysBefore = [...new Array(firstDayDayname-1)].map((_, i)=>{return {type: "pre", content: i+lastDayLastMonth.getDate()-(firstDayDayname-1)+1}});

    let daysAfter = [...new Array((6-lastDayMonth.getDay()===-1)?6:6-lastDayMonth.getDay())].map((_, i)=>{return {type:"post", content:i+1}});

    let contentDays = [...new Array(lastDayMonth.getDate())].map((_, i)=>{return {type:"actual", content:i+1}});

    
    let [heat, setHeat] = useState({});
    
 
    Array.prototype.max = function() {
        return Math.max.apply(null, this);
    };

    
    useEffect(()=>{
        (async function() {
            let map = new Map();
            let hm = {};
            let taskList = await props.engine.db.selectTasksInRange(props.uid, firstDayMonth, lastDayMonth, true);
            taskList.forEach(([_, val])=>{
                let date = new Date(val.due.seconds*1000);
                date.setHours(0, 0, 0, 0);
                let time = date.getDate();
                if(map.has(time))
                    map.set(time, map.get(time)+1);
                else
                    map.set(time, 1);
            });
            let values = Array.from(map.values());
            if (values.length > 0) {
                let max = values.max();
                let style = getComputedStyle(document.body);
                let hexes = values.map(e=>__util_calculate_gradient(style.getPropertyValue('--heatmap-darkest').trim().slice(1), style.getPropertyValue('--heatmap-lightest').trim().slice(1), e/max));
                Array.from(map.keys()).forEach((e, i)=>{hm[e]=hexes[i]});
            }
            setHeat(hm);
        })();
    },[dateSelected, props.initialDate]);
    return (
        <IonModal ref={props.reference} isOpen={props.isShown} onDidDismiss={() => {if(props.onDidDismiss) props.onDidDismiss()}} style={{borderRadius: 5}} cssClass="calendar-popover">
            <div id="calendar-page-calendar-wrapper" style={{display: "inline-block", ...props.style}}>
                <div id="calendar-wrapper-popover">
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
                        <span className={`calendar-container-item calendar-container-item-${i.type} calendar-container-item-${i.content}`} style={{
                            backgroundColor: ((heat[i.content]&&i.type === "actual") ? 
                                `#${heat[i.content]}` :
                                "inherit"),
                            border:  (i.type === "actual" && i.content === dateSelected.getDate()) ? 
                            "2px solid var(--decorative-light)" :
                            "0"}} 

                            onClick={(e)=>{

                                let date;
                                if (i.type === "pre")
                                    date = new Date(lastDayLastMonth.getFullYear(), lastDayLastMonth.getMonth(), i.content);
                                if (i.type === "actual") 
                                    date = new Date(firstDayMonth.getFullYear(), firstDayMonth.getMonth(), i.content);
                                if (i.type === "post") 
                                    date = new Date(firstDayMonth.getFullYear(), firstDayMonth.getMonth()+1, i.content);
                                setDateSelected(date);
                                if (props.onDateSelected && !props.disableOnclick)
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
                    {(()=>{
                        if (props.useTime)
                            return <div className="calendar-timeunit">   
                                <span className="calendar-time">
                                    Time
                                </span>
                                <input
                                    className="calendar-timebox"
                                    defaultValue={dateSelected.toLocaleTimeString()}
                                    onKeyPress={e => {
                                        // TIMEHANDLING is here. If you are searching for that, it's here.
                                        // But anyway, on change, parse the time
                                        let d = chrono.parseDate(e.target.value); //TODO bad?
                                        // ...and throw away the date 
                                        if (d && e.key === "Enter") {
                                            let newDate = new Date(dateSelected.getFullYear(), dateSelected.getMonth(), dateSelected.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
                                            setDateSelected(newDate); // TODO make this with the onChange API
                                            e.target.value = newDate.toLocaleTimeString();
                                            if (props.onDateSelected && !props.disableOnclick)
                                                props.onDateSelected(newDate);

                                        }
                                    }}
                                />
                            </div>
                    })()}
                    <div id="calendar-tools">
                    <a className="fas fa-caret-left calendar-button" onClick={()=>{
                        let date = new Date(firstDayMonth.getFullYear(), firstDayMonth.getMonth()-1, 1);
                        setDateSelected(date);
                        if (props.onDateSelected && !props.disableOnclick)
                            props.onDateSelected(date);

                    }}></a>
                    <a className="fas fa-caret-right calendar-button" onClick={()=>{
                        let date = new Date(firstDayMonth.getFullYear(), firstDayMonth.getMonth()+1, 1);
                        setDateSelected(date);
                        if (props.onDateSelected && !props.disableOnclick)
                            props.onDateSelected(date);

                    }}></a>
                    <div className="calendar-today" onClick={()=>{
                        setDateSelected(new Date());
                        if (props.onDateSelected && !props.disableOnclick)
                            props.onDateSelected(new Date());

                    }}>Today</div>
                        <div className="calendar-today" style={{marginRight: 10, float: "right"}} onClick={()=>{
                            if (dateSelected)
                                props.onDateSelected(dateSelected);
                            props.onDidDismiss()
                        }}>Done</div>
                </div>
                </div>
            </div>
        </IonModal>
    )
}



export default CalendarPopover;

