import React, { useState, useEffect } from 'react';
import { IonModal, IonContent, IonButton, isPlatform } from '@ionic/react';

import { createBrowserHistory, createHashHistory } from 'history';
import { withShortcut, ShortcutProvider, ShortcutConsumer } from '../../static/react-keybind'
import keybindHandler from "./KeybindHandler"
import KeybindInput from "./KeybindInput"
import "./Keybinds.css"
import keybindSource from "./KeybindSource"
import { Preferences } from '@capacitor/preferences';
import "../Upcoming.scss"
import "../Projects.css"
//import Mousetrap from 'mousetrap';
//import 'mousetrap-record';

//var Mousetrap = require('mousetrap-record')(require('mousetrap'));

// TODO @jemoka
// the height of this needs to be set so that scrolling works, but i don;t know how to set the height correctly?
// 	line 117
// the getActions function should read from some static thing which contains all possible keybinds
// 	currently, it is dependant on the currently mounted keybinds
// 	nvm!
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
	setActions(actions)
    }, [])

    const handleDelete = (i, j, catIdx) => { // man, this function sucks
	const temp = keybindActions
	temp[catIdx][1][i][1].splice(j, 1)
	setActions([...temp])
    }

    const handleAdd = (i, catIdx) => {
	const temp = keybindActions
	temp[catIdx][1][i][1].push("")
	setActions([...temp])
    }

    const handleEdit = (val, i, j, catIdx) => {
	const temp = keybindActions
	temp[catIdx][1][i][1][j] = [val]
	setActions([...temp])
    }

    const handleSave = async () => {
	// reconstruct the actions object
	let obj = {}
	for (const cat of keybindActions) {
	    obj[cat[0]] = {}
	    for (const bind of cat[1]) {
		obj[cat[0]][bind[0]] = bind[1]
	    }
	}
	await Preferences.set({ key: 'keybinds', value: JSON.stringify(obj) });
	//console.log(JSON.stringify(obj))
	window.location.reload()
	// save it to preferences, then reload
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
		return (<> 
		    <div className="timeline-box">
			<div className="timeline-line-container">
			    <div className="timeline-line">&nbsp;</div>
			</div>
			<div className="timeline-text">
			    <span className="timeline-weekname">
				{cat[0]}
			    </span>
			</div>
		    </div>




		    {cat[1].map((s, i) => {
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
						    editCallback={(val) => handleEdit(val, i, j, catIdx)}
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


	    </div>
	    <div className="complete-container" style={{marginTop: "-1.5rem", marginRight: "-0.5rem", zIndex: "200"}}onClick={handleSave}>
			<a
			    className="complete-name"
			    style={{color: "var(--page-title)"}}
			>
			    Save
			</a>
		    </div>
	</>
    );
};




export default withShortcut(KeybindPicker)
