import { IonContent, IonPage, IonSplitPane, IonMenu, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonText } from '@ionic/react';
import React from 'react';
import './Home.css';

const Home = () => {
    return (
        <IonPage>
            <IonContent>
              <IonSplitPane contentId="main" when="md">
                <IonMenu contentId="main">
                  <IonHeader>
                    <IonToolbar>
                      <IonTitle>Menu</IonTitle>
                    </IonToolbar>
                  </IonHeader>
                    <IonContent>
                    <IonList>
                      <IonItem>Menu Item</IonItem>
                      <IonItem>Menu Item</IonItem>
                      <IonItem>Menu Item</IonItem>
                      <IonItem>Menu Item</IonItem>
                      <IonItem>Menu Item</IonItem>
                    </IonList>
                  </IonContent>
                </IonMenu>

                <IonContent id="main">
                    <IonText>POOP!</IonText>
                </IonContent>
              </IonSplitPane>
            </IonContent>
        </IonPage>
  );
};

export default Home;
