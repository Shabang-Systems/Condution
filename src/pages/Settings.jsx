import React, { useState } from 'react';
import { IonModal, IonContent, IonButton } from '@ionic/react';
import './Pages.css'
import './Components/TagEditor.css';


const Settings = (props) => {
    const [open, setOpen] = useState(false)
    const [activeBundleIdx, setActiveBundleIdx] = useState(1)
    const [activeTheme, setActiveTheme] = useState(0)

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
				"min-width": "111px",
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
				textAlign: "right",
			    }}
			>
			    <span style={{
				border: "0px solid red",
				textDecoration: "underline",
				fontWeight: 700,
			    }}>{bundles[activeBundleIdx].title}</span>
			    <div class=""
				style={{textAlign: "left"}}>
				{bundles[activeBundleIdx].content(setActiveTheme)}
			    </div>
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
	title: <>
	    Bind 'em keys!
	</>,
	content: <> whee </>
    },
    {
	name: "Theme",
	title: <>
	    Set that theme!
	</>,
	content: (props) => {
		//props(1)
		return (<>
		    <div class="settings-theme-wrapper">
			<div class="settings-theme-option-wrapper">
			    <p class="settings-theme-option-maintext settings-theme-option-highlight">Dark Mode</p>
			    <p class="settings-theme-option-subtext">(recommended)</p>
			</div>

			<div class="settings-theme-option-wrapper">
			    <p class="settings-theme-option-maintext">Light Mode</p>
			    <p class="settings-theme-option-subtext">(not recommended)</p>
			</div>
			<div class="settings-theme-option-wrapper">
			    <p class="settings-theme-option-maintext">System</p>
			    <p class="settings-theme-option-subtext">(should be the same as dark mode.. right?)</p>
			</div>

		    </div>
	    </>)
	}
    },
    {
	name: "Account",
	title: <>
	    Manage that account!
	</>,
	content: <> whee </>


    },
    {
	name: "Tags",
	title: <>
	    Wrangle those tags!
	</>,
	content: <> whee </>
    },
    {
	name: "Experimental",
	title: <>
	    Experimental features 👀
	</>,
	content: <> Coming soon... </>
    },
    {
	name: "Change Log",
	title: <>
	    Check out the Change Log!
	</>,
	content: <> ch-ch-ch-CHANGES</>
    },
]




