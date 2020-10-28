//import { IonModal, IonContent, IonSelect, IonSelectOption } from '@ionic/react';
import React, { Component } from 'react';
import './FloatingActionButton.css';
import * as chrono from 'chrono-node';


/*
 * Hello human,
 * I don't know why I am doing front end.
 * I don't see the orange floating unicorns I was promised.
 * I don't get to add the add a button to the inbox button i wanted.
 * But I guess they thought the name was too long so heres abtib ^-^
 *
 * @Exr0n
 *
 */

const defaultValue = "Add button to inbox";

function handleABTIBInput(value) {
    console.log('abtib reportin to handle input ^-^');
    console.log(value);
    // TODO: nlp it
    // TODO: create the task
}

function ABTIB(props) {
    return <input id="abtib" readOnly={false} type="text" defaultValue={defaultValue}
    onClick={
        (event) => {
            event.target.value = "";
        }
    }
    onKeyUp={
        (event) => {
            if (event.key === 'Enter') {
                handleABTIBInput(event.target.value);
                // TODO: trigger complete animation
                event.target.value = "";
            }
        }
    }
    onBlur={
        (event) => {
            event.target.value = defaultValue;
        }
    } />;
}

export default ABTIB;

