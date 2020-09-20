import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline } from 'ionicons/icons';
import React, { Component } from 'react';
import './Home.css';

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {projects:[], perspectives:[]};
    }

    componentDidMount() {
        let view = this;
        (async function() {
            let tlp = await view.props.engine.db.getTopLevelProjects(view.props.uid);
            let psp = await view.props.engine.db.getPerspectives(view.props.uid);
            view.setState({projects: tlp[2], perspectives:psp[2]});
        })();
    }

    render() {
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
                        <div className="menu-item menu-item-selected" style={{fontSize: 18}} ><IonIcon icon={chevronForwardCircle} />Upcoming</div>
                        <div className="menu-item" style={{fontSize: 18}}><IonIcon icon={checkmarkCircle} />Completed</div>

                        {/* === Perspectives == */}
                        <div className="menu-sublabel menu-decoration">Perspectives</div>
                            {/* === Perspective Contents == */}
                            {this.state.perspectives.map((psp) => {
                                    return (<div className="menu-item" key={psp.id}><IonIcon icon={filterOutline} />{psp.name}</div>)
                            })}


                        {/* === Projects == */}
                        <div className="menu-sublabel menu-decoration">Projects</div>
                            {/* === Project Contents == */}
                            {this.state.projects.map((proj) => {
                                    return ( <div className="menu-item" key={proj.id}><IonIcon icon={listOutline} />{proj.name}</div> )
                            })}
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
    }
};

export default Home;
