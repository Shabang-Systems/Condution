import React, { useState } from 'react';
import { IonModal, IonContent, IonButton } from '@ionic/react';
import './Pages.css'
import './Components/TagEditor.css';


const Settings = (props) => {
    const [open, setOpen] = useState(false)
    const [activeBundleIdx, setActiveBundleIdx] = useState(0)

    return (
	<>
	    <div
		onClick={() => { setOpen(!open) }}
		style={{"border":"1px solid grey", "padding": "1rem"}}
	    > Settings </div>

	    <IonModal isOpen={open}
		onDidDismiss={() => setOpen(false)}
		cssClass="settings-modal"
	    >
		<div class="settings-main">
		    <div class="settings-esc"
			onClick={() => {
			    setOpen(!open)
			}}
		    >
			<i class="far fa-times-circle esc-button" style={{
			    color: "var(--content-normal-alt)",
			    marginRight: 24,
			    marginTop: 24,
			    fontSize: "30px",
			    textAlign: "right",
			    }}>
			</i>
			<span style={{
			    textAlign: "right", marginRight: 24+3,
			    marginTop: 3,
			    color: "var(--ion-color-medium-shade)",
			}}>esc</span>
		    </div>



		    <div class="settings-floating">
			<div class="settings-sidebar">
			    <p style={{
				"font-weight": "900",
				"font-size": "20px",
			    }}> Settings </p>
			    {bundles.map( (b,i) => {
				return <p
				    onClick={() => {
					setActiveBundleIdx(i)
				    }}
				    className="settings-option"
				    style={{
					fontWeight: (i == activeBundleIdx)? 900 : 200,
					//transition: "0.3s"
				    }}
				    >{b.name}</p>
			    })}
			</div>
			<div class="settings-content"
			    style={{
				width: "100%",
				marginRight: "20%",
				//border: "1px solid teal"
				textAlign: "right"
			    }}
			>
			    {bundles[activeBundleIdx].content}
			</div>
		    </div>
		</div>
	    </IonModal>
	</>
    );
};

export default Settings



const bundles = [
    {
	name: "Keybinds",
	content: <>
	    Bind 'em keys!
	</>
    },
    {
	name: "Theme",
	content: <>
	    Set that theme!
	</>
    },
    {
	name: "Account",
	content: <>
	    Manage that account!
	</>
    },
    {
	name: "Tags",
	content: <>
	    Wrangle those tags!
	</>
    },
    {
	name: "Experimental",
	content: <>
	    Experimental features 👀
	</>
    },
]




