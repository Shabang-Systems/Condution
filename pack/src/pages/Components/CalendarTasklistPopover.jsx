import { IonModal, IonContent, IonSelect, IonSelectOption } from '@ionic/react';
import { Dropdown } from 'react-bootstrap';
import React, { createRef, useEffect, useRef, useState } from 'react';
import '../Calendar.css';
//import OutsideClickHandler from 'react-outside-click-handler';
import "react-datepicker/dist/react-datepicker.css";
import * as chrono from 'chrono-node';
import Select from 'react-select'

import Task from '../Components/Task';
import T from '../../backend/src/Objects/Task.ts';

/*
 * Hello human,
 * good morning.
 *
 * I am the calendar popover
 *
 * Rule denotes the repeat major rule: {no repeat, daily, weekly: yearly}
 * Advanced denotes whether the user is using fancy repeat
 * On denotes the advanced repeat signals. (like mon, tue, sat or something.)
 *
 * @jemoka
 *
 */


function CalendarTasklistPopover(props) {

    let refs = useRef([]);
    let [tasks, setTasks] = useState([]);

    useEffect(()=>{
        refs.current=props.list.map((_)=>createRef());
        Promise.all(props.list.map(async (i)=> await T.fetch(props.cm, i))).then(l => setTasks(l));
    }, [props.list]);

    return (
        <IonModal ref={props.reference} isOpen={props.isShown} onDidDismiss={() => {if(props.onDidDismiss) props.onDidDismiss()}} style={{borderRadius: 5}} cssClass="calendar-list-popover">
                <div id="airplane-hanger"></div> {/*to mount the calendar*/}
            <div className="popover-list">
                <span id="calendar-page-header">
                    <div class="calendar-page-count">{props.list.length}</div>
                    <div class="calendar-page-title">tasks due on</div>
                    <div class="calendar-page-date" >{props.currentDate.toLocaleString('en-us', {  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'  })}</div>
                </span>

                {tasks.map((item, i)=>
                    <div ref={refs.current[i]}>
                        <Task cm={props.cm} localizations={props.localizations} key={item.id} taskObject={item} envelope={refs.current[i]} onModal={true}/>
                    </div>
                )}

                <div className="bottom-helper" style={{height: 150}}>&nbsp;</div>
            </div>
        </IonModal>
    )
}

export default CalendarTasklistPopover;

