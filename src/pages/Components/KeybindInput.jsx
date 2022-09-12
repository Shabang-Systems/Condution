import React, { useState, useEffect } from 'react';
import { IonModal, IonContent, IonButton, isPlatform } from '@ionic/react';

import { createBrowserHistory, createHashHistory } from 'history';
import { withShortcut, ShortcutProvider, ShortcutConsumer } from '../../static/react-keybind'
import keybindHandler from "./KeybindHandler"
import ShortcutPicker from "react-shortcut-picker";
import "./Keybinds.css"
//import Mousetrap from 'mousetrap';
//import 'mousetrap-record';

//var Mousetrap = require('mousetrap-record')(require('mousetrap'));

const KeybindInput = (props) => {
    const [keybindInput, setKeybindInput] = useState(props.keys);

    useEffect(() => {
	setKeybindInput(props.keys);
    }, [props.keys]);

    const rec = (e) => {
	e.preventDefault()
	let input = e.key
	input = input.toLowerCase()
	input = input.replace("Control", "ctrl")

	let temp_old = (keybindInput? "+"+keybindInput+"+" : "")
	if (!temp_old.includes("+"+input+"+")) {
	    input = (keybindInput? keybindInput+"+"+input : input)
	    setKeybindInput(input)
	}
    }

    return (
	<>
	    <p
		style={{
		    display: "flex",

		}}
	    >
		<p
		    contentEditable
		    onKeyDown={rec}
		    onBlur={(e) => {
			props.editCallback(keybindInput);
		    }}
		    className="keybind-display"
		>
		    {keybindInput}
		</p>
		<div className="keybind-deleter"
		    onClick={props.handleDelete}
		>x</div>
	    </p>
	</>
    );
};

export default KeybindInput
