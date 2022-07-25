import { IonFab, IonFabButton, IonFabList, IonIcon } from '@ionic/react';
import { useKBar } from 'kbar';

export default function DropUpMenu({ settingsButtonComponent, activateQuickSwitcher }) {
    const { query } = useKBar();

    const launchCommandPalette = _ => query.toggle();

    return <IonFab vertical="bottom" horizontal="end" className="menu-item bottomitem">
        <IonFabButton color="dark">
{/*<IonIcon md="caret-up" ios="chevron-up-circle-outline"></IonIcon>*/}
            <IonIcon name="chevron-up-circle-outline"></IonIcon>
        </IonFabButton>
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

