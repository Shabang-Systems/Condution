import React, { useState, useEffect } from 'react';
import { IonModal, IonContent, IonButton, isPlatform } from '@ionic/react';

import { createBrowserHistory, createHashHistory } from 'history';
import { withShortcut, ShortcutProvider, ShortcutConsumer } from '../../static/react-keybind'
import keybindHandler from "./KeybindHandler"
import ShortcutPicker from "react-shortcut-picker";
import KeybindInput from "./KeybindInput"
import "./Keybinds.css"
//import Mousetrap from 'mousetrap';
//import 'mousetrap-record';

//var Mousetrap = require('mousetrap-record')(require('mousetrap'));

const KeybindPicker = (props) => {

    const getActions = () => {

	let actionDict = {}

	let actions = []

	const { shortcut } = props;
	// check if keybind already exists
	// if so, push the new shortcut keys to the existing shortcut keys, 
	// otherwise, create a new keybind
	for (const [idx, s] of shortcut.shortcuts.entries()) {
	    const [,registerType, registerId] = s.description.split("&")[1].split("/")
	    const [,currentType, currentId] = window.location.pathname.split("/")
	    // if we are in a project,
	    // ignore perspective keybinds
	    // ignore keybinds that are not in the current project
	    // if we are in a perspective,
	    // ignore project keybinds
	    // ignore keybinds that are not in the current perspective
	    // if we are not in either, ignore keybinds from both

	    //if (registerType === "project" && currentType === "project") {
	    //console.log(registerType, currentType, ["project", "perspective"].includes(registerType))
	    if (
		(["projects", "perspectives"].includes(registerType)) && 
		(["projects", "perspectives"].includes(currentType)) // if we are in either a project or perspective,
	    ) {
		if (registerType != currentType) { // if we are in diff types
		    //console.log("no good", registerId, currentId, s, 1)
		    continue;
		}

		if (registerId != currentId  // if we are in diff ids
		    && currentType != "projects")  // projects don't seem to err?
		{
		    //console.log("no good", registerId, currentId, s, 2)
		    continue;
		}
	    } 

	    if (!["projects", "perspectives"].includes(currentType)) { // if we are not in either,
		if (["projects", "perspectives"].includes(registerType)) { // and we registered in one
		    //console.log("no good", registerId, currentId, s, 3)
		    continue
		}

		// if register type is different and not home, then don't show it
		if (
		    s.description.split("&").length != 3  && // not registered in home
		    (["completed", "upcoming", "calendar"].includes(registerType)) && 
		    (["completed", "upcoming", "calendar"].includes(currentType)) && // both in one of the constant pages
		    registerType != currentType) // but the constant pages dont match
		{
		    //console.log("no good", registerId, currentId, s, 4)
		    continue
		}
	    }

	    if (s.title in actionDict) {
		if (!actions[actionDict[s.title]].keys.includes(...s.keys)) {
		    actions[actionDict[s.title]].keys.push(...s.keys)
		    //console.log(s.keys, "whee", actions[actionDict[s.title]].keys)
		}
	    } else {
		actionDict[s.title] = actions.length
		actions.push(s)
	    }
	}
	return actions
    }

    const [keybindInput, setKeybindInput] = useState("");
    
    const rec = (e) => {
	setKeybindInput(keybindInput? keybindInput+"+"+e.key : e.key)
    }
    const clear = () => {
	setKeybindInput("")
    }

    const { shortcut } = props;

    return (
	<>
	    <div
		style={{
		    overflow: "scroll",
		    //border: "1px solid red",
		    height: "500px", // TODO
                    width: "100%",
		    marginTop: "1.5rem"
		}}
	    >
	    {getActions().map((s, i) => {
		return (<> 
		    <div 
			style={{
			    display: "flex",
                            width: "100%",
			    marginTop: "1.5rem",
			}}
		    >
			<p
			    style={{
				"max-height": "1.8em",
				"line-height": "1.8em",
				"text-overflow": "ellipsis",
				"word-wrap": "break-word",
				border: "0px solid red",
				minWidth: "8rem",
			    }}
			> {s.title} </p> 
			<div
			    style={{
				display: "inline-flex",
                                /* width: "100%", */
				overflowX: "hidden",
				"text-overflow": "ellipsis",
				"word-wrap": "break-word",
                                "flex-wrap": "wrap",
			    }}
			>
			    {s.keys.map((k, j) => {
				return (
				    <p
					style={{
					    display: "flex",
					    flexDirection: "row",
					    //border: "1px solid red",
					    maxHeight: "1.8em",
					}}
				    > 
					<div
					    style={{
						marginLeft: "auto",
					    }}
					> 
					    <KeybindInput keys={k}/> 
					</div>
				    </p>
				)	
			    })}


			    <p className="keybind-display round-right">
				+
			    </p>


			</div>
		    </div>
		</>
		)
	    })}
	    </div>
	</>
    );
};

export default withShortcut(KeybindPicker)
