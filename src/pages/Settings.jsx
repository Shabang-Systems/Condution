import React, { useState } from 'react';
import { IonModal, IonContent, IonButton } from '@ionic/react';

const Settings = ({ router }) => {
    const [open, setOpen] = useState(false)

    return (
	<>
	    <div onClick={() => {
		setOpen(!open)
		console.log("going")
	    }}> Settings </div>
	    {/* Default */}
	    {/*<IonModal isOpen={true}>
		<IonContent>Modal Content</IonContent>
	    </IonModal>*/}

	    {/* Use a trigger */}
	    {/*<IonButton id="trigger-button">Click to open modal</IonButton>
	    <IonModal trigger="trigger-button">
		<IonContent>Modal Content</IonContent>
	    </IonModal>*/}

	    {/* Sheet Modal */}
	    {/*<IonModal
		isOpen={true}
		breakpoints={[0.1, 0.5, 1]}
		initialBreakpoint={0.5}
	    >
		<IonContent>Modal Content</IonContent>
	    </IonModal>*/}

	    {/* Card Modal */}
	    {/*<IonModal
		isOpen={true}
		swipeToClose={true}
		presentingElement={router || undefined}
	    >
		<IonContent>Modal Content</IonContent>
	    </IonModal>*/}

	    {/* Passing Props */}
	    <IonModal isOpen={open}>
		init settings!
	    </IonModal>
	</>
    );
};

export default Settings
