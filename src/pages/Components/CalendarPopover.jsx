import { IonModal, IonContent, IonSelect, IonSelectOption } from '@ionic/react';
import { Dropdown } from 'react-bootstrap';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component, useState } from 'react';
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
        </IonModal>
    )
}



export default CalendarPopover;

