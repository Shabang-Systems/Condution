//import { IonModal, IonContent, IonSelect, IonSelectOption } from '@ionic/react';
import React, { Component } from 'react';
import './FloatingActionButton.css';
import * as chrono from 'chrono-node';


/*
 * Hello human,
 * You know I'm not Jack because my pen has no nib
 * You know I'm not Huxley because I can't adlib
 * If I said I could do frqnt end, I'd be telling a fib
 * And now, as punishment, I've lost a rib
 * But alas, here is abtib ^-^
 *
 * ~~@Exr0n~~
 * @Ex-rib
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
            event.target.value = defaultValue + ((Math.random()*128 < 1) ? " ^-^" : "");
        }
    } />;
}

export default ABTIB;

