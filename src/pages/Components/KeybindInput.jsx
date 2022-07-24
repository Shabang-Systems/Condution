import React, { useState, useEffect } from 'react';
import { IonModal, IonContent, IonButton, isPlatform } from '@ionic/react';

import { createBrowserHistory, createHashHistory } from 'history';
import { withShortcut, ShortcutProvider, ShortcutConsumer } from '../../static/react-keybind'
import keybindHandler from "./KeybindHandler"
import ShortcutPicker from "react-shortcut-picker";
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
		    style={{
			marginLeft: "10px",
			background: "var(--background-feature)",
			maxWidth: "200px",
			minWidth: "10px",
			//maxHeight: "20px",
			"text-overflow": "ellipsis",
			"word-wrap": "break-word",
			"max-height": "1.8em",
			"line-height": "1.8em",
			display: "block",
			overflow: "scroll",
			"align-content": "space-between",
			"border-radius": "5px",
			paddingLeft: "10px",
			paddingRight: "10px",
			//paddingBottom: "20px",

		    }}
		>
		    {keybindInput}
		</p>

		{/*<button onClick={clear}
		>Clear</button>
		<button onClick={() => {}}
		>Done</button>*/}
	    </p>
	</>
    );
};

export default KeybindInput
