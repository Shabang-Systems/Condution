import { IonFab, IonFabButton, IonFabList, IonIcon } from '@ionic/react';
import { useKBar } from 'kbar';

// Detect whether is mobile
import { getPlatforms } from '@ionic/react';

export default function DropUpMenu({ settingsButtonComponent, activateQuickSwitcher,localizations }) {
    const { query } = useKBar();

    const launchCommandPalette = _ => query.toggle();

    return <IonFab vertical="bottom" horizontal="end" className="">
        <div><div
               style={{"transform": "translateY(-20px) !important"}}
              id="settings"
                alt={localizations.settings}
                className="menu-item bottomitem"><i className="fas fa-bars" style={{paddingRight: 5}} /></div></div>
        <IonFabList side="top" description={false}>
            <IonFabButton color="light" onClick={activateQuickSwitcher}
		style={{display: "none"}}
	    >
                <i className="fas fa-none" />
            </IonFabButton>
            {!getPlatforms().includes("mobile")? settingsButtonComponent: <div/>}
            <IonFabButton color="light" onClick={activateQuickSwitcher} >
                <i className="fas fa-plane-departure"/>
            </IonFabButton>
            <IonFabButton color="light" onClick={launchCommandPalette} >
                <i className="fas fa-terminal" />
            </IonFabButton>
        </IonFabList>
    </IonFab>
}

