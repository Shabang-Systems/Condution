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

    const rec = (e) => {
	if (e.key == "Escape") {
	    setKeybindInput("")
	    e.stopPropagation()
	}
	e.preventDefault()
	setKeybindInput(keybindInput? keybindInput+"+"+e.key : e.key)
    }

    const clear = () => {
	setKeybindInput("")
    }

    return (
	<>
	    <p
		style={{
		    display: "flex",

		}}
	    >
		<p
		    contentEditable="true"
		    onKeyDown={rec}
		    onChange={(e) => {e.preventDefault()}}
		    className="keybind-display"
		>
		    {keybindInput}
		</p>
		<div className="keybind-deleter">x</div>

		{/*<button onClick={clear}
		>Clear</button>
		<button onClick={() => {}}
		>Done</button>*/}
	    </p>
	</>
    );
};

export default KeybindInput
