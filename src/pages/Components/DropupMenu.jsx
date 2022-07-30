import { IonFab, IonFabButton, IonFabList, IonIcon } from '@ionic/react';
import { useKBar } from 'kbar';

export default function DropUpMenu({ settingsButtonComponent, activateQuickSwitcher,localizations }) {
    const { query } = useKBar();

    const launchCommandPalette = _ => query.toggle();

    return <IonFab vertical="bottom" horizontal="end" className="">
        <div><div
               style={{"transform": "translateY(-20px) !important"}}
              id="settings"
                alt={localizations.settings}
                className="menu-item bottomitem"><i className="fas fa-cog" style={{paddingRight: 5}} /></div></div>
        <IonFabList side="top">
            {
                settingsButtonComponent
            }
            <IonFabButton color="light" onClick={activateQuickSwitcher} >
                <i className="fas fa-directions" />
            </IonFabButton>
            <IonFabButton color="light" onClick={launchCommandPalette} >
                <i className="fas fa-palette" />
            </IonFabButton>
        </IonFabList>
    </IonFab>
}

