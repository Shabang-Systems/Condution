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
    const anim = useSpring({to: (isSaving ? {width: 280, color:"var(--quickadd-successtext)", backgroundColor: "var(--quickadd-success)"} : {width: isExpanded ? 280:250, color:"var(--quickadd-text)", backgroundColor: "var(--quickadd)"})})

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
            e.target.value = "";
        }}
        onKeyUp={
            (event) => {
                if (event.key === 'Enter') {
                    event.persist(); //https://reactjs.org/docs/events.html#event-pooling
                    setisSaving(true);
                    let taskName = event.target.value;
                    let dateInfo = chrono.parse(taskName);
                    let due = undefined;
                    let defer = undefined;
                    if (dateInfo.length > 0) {
                        // we got a date!
                        if (dateInfo[0].end) {
                            // both start (defer) and end (due)
                            // get end (due) date
                            due = dateInfo[0].end.date();
                            defer = dateInfo[0].start.date();
                            // strip the due date string
                            taskName = taskName.replace(dateInfo[0].text, "").trim();

                        }
                        else {
                            // only start (due)
                            due = dateInfo[0].start.date();
                            // strip the due date string
                            taskName = taskName.replace(dateInfo[0].text, "").trim();
                        }
                    }
                    let npobj = { 
                            uid: props.uid, // pass it the things vvv
                            pid: "",
                            due,
                            defer,
                            name: taskName
                    };
                    props.gruntman.do( // call a gruntman function
                        "task.create", npobj,
                    ).then(()=>{
                        event.target.blur();
                    });
                }
            }
        }
        placeholder={ defaultValue + ((Math.random()*128 < 1) ? " ^-^" : "")}
     />;
}

export default ABTIB;

