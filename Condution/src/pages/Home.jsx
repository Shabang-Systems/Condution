import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
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
                        {/* === Built Ins == */}
                        <div className="menu-item menu-item-selected"><IonIcon icon={chevronForwardCircle} />Upcoming</div>
                        <div className="menu-item"><IonIcon icon={checkmarkCircle} />Completed</div>

                        {/* === Perspectives == */}
                        <div className="menu-sublabel menu-decoration">Perspectives</div>
                            {/* === Perspective Contents == */}
                            <div className="menu-item"><IonIcon icon={filterOutline} />Soup</div>

                        {/* === Projects == */}
                        <div className="menu-sublabel menu-decoration">Projects</div>
                            {/* === Project Contents == */}
                            <div className="menu-item"><IonIcon icon={listOutline} />soup</div>
                    </IonContent>
                </IonMenu>

                <IonContent id="main">
                    <IonReactRouter>
                        <IonRouterOutlet>
                            {/*<Route path="/" component={Home} exact={true} />*/}
                        </IonRouterOutlet>
                    </IonReactRouter>
                </IonContent>
              </IonSplitPane>
            </IonContent>
        </IonPage>
  );
};

export default Home;
