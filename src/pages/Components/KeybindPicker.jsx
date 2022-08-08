import React, { useState, useEffect } from 'react';
import { IonModal, IonContent, IonButton, isPlatform } from '@ionic/react';

import { createBrowserHistory, createHashHistory } from 'history';
import { withShortcut, ShortcutProvider, ShortcutConsumer } from '../../static/react-keybind'
import keybindHandler from "./KeybindHandler"
import ShortcutPicker from "react-shortcut-picker";
import KeybindInput from "./KeybindInput"
import "./Keybinds.css"
import keybindSource from "./KeybindSource"
//import Mousetrap from 'mousetrap';
//import 'mousetrap-record';

//var Mousetrap = require('mousetrap-record')(require('mousetrap'));

// TODO @jemoka
// the height of this needs to be set so that scrolling works, but i don;t know how to set the height correctly?
// 	line 117
// the getActions function should read from some static thing which contains all possible keybinds
// 	currently, it is dependant on the currently mounted keybind
// three functions: 
// 	handleAdd,
// 	handleDelete,
// 	and then a function called rec in KeybindInput.jsx
// 	these need to hook into the static whatever storage and change things.

const KeybindPicker = (props) => {
    const [keybindActions, setActions] = useState([]);
    const [render, triggerRender] = useState(0);


    const getActions = async () => {
	let ks = await keybindSource;
	ks = Object.entries(ks)
	ks = ks.map(([k, v]) => {
	    return [k, Object.entries(v)]
	})
	return ks
    }

    useEffect(async () => {
	let actions = await getActions()
	console.log(actions)
	setActions(actions)
    }, [])

    const handleDelete = (i, j, catIdx) => { // man, this function sucks
	const temp = keybindActions
	temp[catIdx][1][i][1].splice(j, 1)
	setActions([...temp])
    }

    const handleAdd = (i, catIdx) => {
	const temp = keybindActions
	//console.log(temp[catIdx][1][i][1])
	temp[catIdx][1][i][1].push("")
	setActions([...temp])
    }


    return (
	<>
	    <div
		style={{
		    overflow: "scroll",
		    //border: "1px solid red",
		    height: "500px", // TODO @jemoka
                    width: "100%",
		    marginTop: "1.5rem"
		}}
	    >
	    {keybindActions.map((cat, catIdx) => {
		//console.log(cat)
		return (<> 
		    {cat[0]}
		    {cat[1].map((s, i) => {
			console.log(s)
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
			    > {s[0]} </p> 
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
				{s[1].map((k, j) => {
				    console.log(k == "ctrl+i")
				    return (
				<> {(k != "‎") &&
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
						<KeybindInput 
						    keys={k}
						    handleDelete={() => handleDelete(i, j, catIdx)}
						/> 
					    </div>
					</p>} 
					</>)
				})}


				<p className="keybind-display round-right"
				    onClick={() => handleAdd(i, catIdx)}
				>
				    +
				</p>


			    </div>
			</div>
		    </>
		    )
		})
		    }</>)
	    })}
		<div> save </div>
	    </div>
	</>
    );
};

export default withShortcut(KeybindPicker)
