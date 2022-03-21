import React, { useState } from 'react';
import { IonModal, IonContent, IonButton } from '@ionic/react';
import './Pages.css'

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
