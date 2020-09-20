import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton } from '@ionic/react';
import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline } from 'ionicons/icons';
import React from 'react';
import './Home.css';

const Home = () => {
    return (
        <IonPage>
            <IonContent>
              <IonSplitPane id="main-split" contentId="main" when="md">
                <IonMenu id="main-menu" contentId="main">
                    {/*
                    <div id="menu-hero">
                        Condution <span id="version-number" className="menu-decoration">v1.0.0</span>
                    </div>
                    */}
                    <br />
                    <IonContent>
                        <div className="menu-item menu-item-selected"><IonIcon icon={chevronForwardCircle} />Upcoming</div>
                        <div className="menu-item"><IonIcon icon={checkmarkCircle} />Completed</div>
                        <div className="menu-sublabel menu-decoration">Perspectives</div>
                            <div className="menu-item"><IonIcon icon={filterOutline} />Chicken</div>
                            <div className="menu-item"><IonIcon icon={filterOutline} />Noodle</div>
                            <div className="menu-item"><IonIcon icon={filterOutline} />Soup</div>
                        <div className="menu-sublabel menu-decoration">Projects</div>
                            <div className="menu-item"><IonIcon icon={listOutline} />is a delicios</div>
                            <div className="menu-item"><IonIcon icon={listOutline} />metal box</div>
                            <div className="menu-item"><IonIcon icon={listOutline} />that eats</div>
                            <div className="menu-item"><IonIcon icon={listOutline} />a lot of</div>
                            <div className="menu-item"><IonIcon icon={listOutline} />soup</div>
                    </IonContent>
                </IonMenu>

                <IonContent id="main">
                    <IonText>POOP!</IonText>
                        { /* <IonMenuButton></IonMenuButton>> */}
                </IonContent>
              </IonSplitPane>
            </IonContent>
        </IonPage>
  );
};

export default Home;
