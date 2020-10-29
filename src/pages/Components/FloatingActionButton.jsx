//import { IonModal, IonContent, IonSelect, IonSelectOption } from '@ionic/react';
import React, { useState } from 'react';
import './FloatingActionButton.css';
import * as chrono from 'chrono-node';
import {useSpring, animated} from 'react-spring'


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

const defaultValue = "Add something to the inbox?";

function handleABTIBInput(value) {
    console.log('abtib reportin to handle input ^-^');
    console.log(value);
    // TODO: nlp it
    // TODO: create the task
}

function ABTIB(props) {
    const [isExpanded, setisExpanded] = useState(false);
    const [isSaving, setisSaving] = useState(false);
    const anim = useSpring({to: (isSaving ? [{width: 280, color:"var(--quickadd-success-text)", backgroundColor: "var(--quickadd-success)", config: {duration: 500}}, {width: 250, color:"var(--quickadd-text)", backgroundColor: "var(--quickadd)"}] : {width: isExpanded ? 280:250, color:"var(--quickadd-text)", backgroundColor: "var(--quickadd)"})})

    return <animated.input id="abtib" readOnly={false} type="text" defaultValue={""} style={anim}
        onClick={
            (event) => {
                event.target.value = "";
                setisExpanded(true);
            }
        }
        onBlur={e=>{
            setisExpanded(false);
            setisSaving(false);
        }}
        onKeyUp={
            (event) => {
                if (event.key === 'Enter') {
                    console.log(event.target.value);
                    setisSaving(true);
                    // TODO: trigger complete animation
                    event.target.value = "";
                    //event.target.blur();
                }
            }
        }
        placeholder={ defaultValue + ((Math.random()*128 < 1) ? " ^-^" : "")}
     />;
}

export default ABTIB;

