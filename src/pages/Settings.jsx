import React, { useState } from 'react';
import { IonModal, IonContent, IonButton } from '@ionic/react';
import './Pages.css'
import './Components/TagEditor.css';


const Settings = (props) => {
    const [open, setOpen] = useState(false)

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
		    {/*<p class="settings-esc">wwfj:w</p>*/}
		    <div class="settings-esc"
			onClick={() => {
			    //console.log("w")
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

		    {/*<i class="fas fa-weight-hanging" style={{color: "var(--content-normal-alt)", marginRight: 1}} />*/}


		    <div class="settings-floating">
			<div class="settings-sidebar">
			    <p style={{
				"font-weight": "900",
				"font-size": "20px",
			    }}> Settings </p>
			    <p> Location </p>
			    <p> Location </p>
			    <p> Location </p>
			    <p> Location </p>
			    <p> Location </p>
			</div>
			<div class="settings-content">
			    content
			    this is more contents
			    wheee more content fdsakfjklasjdflkajsdklfjakl;sjdfl;jaslkdfjasd
			</div>
		    </div>
		</div>
	    </IonModal>
	</>
    );
};

export default Settings
