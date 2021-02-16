import { IonModal, IonContent, IonSelect, IonSelectOption } from '@ionic/react';
import { Dropdown } from 'react-bootstrap';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { createRef, useEffect, useRef } from 'react';
import '../Calendar.css';
//import OutsideClickHandler from 'react-outside-click-handler';
import "react-datepicker/dist/react-datepicker.css";
import * as chrono from 'chrono-node';
import Select from 'react-select'

import Task from '../Components/Task';

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

function newTaskButtonClicked() {
    console.log("amazing");
}
// TODO what the hell is this. Why is this not a class.......
function CalendarTasklistPopover(props) {

    let refs = useRef([]);

    useEffect(()=>{
        refs.current=props.list.map((_)=>createRef());
    }, [props.list]);



    return (
        <IonModal ref={props.reference} isOpen={props.isShown} onDidDismiss={() => {if(props.onDidDismiss) props.onDidDismiss()}} style={{borderRadius: 5}} cssClass="calendar-list-popover">
                <div id="airplane-hanger"></div> {/*to mount the calendar*/}
            <div className="popover-list">
                <span id="calendar-page-header">
                    <div class="calendar-page-count">{props.list.length}</div>
                    <div class="calendar-page-title">tasks due on</div>
                    <div class="calendar-page-date" >{props.currentDate.toLocaleString('en-us', {  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'  })}
        
        </div>                <div className="new-tag-button" onClick={newTaskButtonClicked}>
                    <i class="fas fa-plus" style={{marginLeft: "2px", marginRight: "2px"}}></i>
                </div>
                </span>

                {props.list.map((id, i)=>
                    <div ref={refs.current[i]}>
                        <Task tid={id} key={id} uid={props.uid} engine={props.engine} gruntman={props.gruntman} availability={props.availability[id]} datapack={props.datapack} envelope={refs.current[i]} onModal={true}/>
                    </div>
                )}

                


                <div className="bottom-helper" style={{height: 150}}>&nbsp;</div>
            </div>
        </IonModal>
    )
}

export default CalendarTasklistPopover;

