import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route, Link } from 'react-router-dom';
import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline } from 'ionicons/icons';
import React, { Component } from 'react';
import './Home.css';

const autoBind = require('auto-bind/react');

/* 
 *
 * Hello, human
 * Good morning
 * Read me please.
 *
 * Use the **state**'s itemSelected 
 *     to manage the menu
 * use the **React Router URL** 
 *     to manage the page
 *
 * Otherwise, unreload-reload won't work.
 *
 * Thanks. @jemoka.
 *
 */

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {projects:[], perspectives:[], itemSelected:{item:"upcoming", id:undefined}};

        autoBind(this);
    }

    componentDidMount() {
        let view = this;
        let uri = (new URL(document.URL)).pathname.split("/");
        if (uri[1] === "")
            this.setState({itemSelected:{item:"upcoming", id:""}});
        else
            this.setState({itemSelected:{item:uri[1], id:uri[2]}});
        (async function() {
            let tlp = await view.props.engine.db.getTopLevelProjects(view.props.uid);
            let psp = await view.props.engine.db.getPerspectives(view.props.uid);
            view.setState({projects: tlp[2], perspectives:psp[2]});
        })();
    }

    render() {
    return (
    <IonPage>
        <IonReactRouter>
            <IonContent>
              <IonSplitPane id="main-split" contentId="main" when="sm">
                <IonMenu id="main-menu" contentId="main">
                    {/*
                    <div id="menu-hero">
                        Condution <span id="version-number" className="menu-decoration">v1.0.0</span>
                    </div>
                    */}
                        
                    <br />
                    <IonContent>
                        {/* === Built Ins == */}
                        <Link to="/upcoming" onClick={()=>this.setState({itemSelected:{item:"upcoming", id:undefined}})}><div className={"menu-item "+(this.state.itemSelected.item === "upcoming" ? "menu-item-selected" : "")} style={{fontSize: 18}}><IonIcon icon={chevronForwardCircle} />Upcoming</div></Link>
                            <Link to="/completed" onClick={()=>this.setState({itemSelected:{item:"completed", id:undefined}})}><div className={"menu-item "+(this.state.itemSelected.item === "completed" ? "menu-item-selected" : "")} style={{fontSize: 18}}><IonIcon icon={checkmarkCircle} />Completed</div></Link>
                        {/* === Perspectives == */}
                        <div className="menu-sublabel menu-decoration">Perspectives</div>
                            {/* === Perspective Contents == */}
                            {this.state.perspectives.map((psp) => {
                                return (<Link key={psp.id} to={`/perspectives/${psp.id}`} onClick={()=>this.setState({itemSelected:{item:"perspectives", id:psp.id}})}><div className={"menu-item "+(this.state.itemSelected.item === "perspectives" && this.state.itemSelected.id === psp.id ? "menu-item-selected" : "")}><IonIcon icon={filterOutline} />{psp.name}</div></Link>)
                            })}


                        {/* === Projects == */}
                        <div className="menu-sublabel menu-decoration">Projects</div>
                            {/* === Project Contents == */}
                            {this.state.projects.map((proj) => {
                                return (<Link key={proj.id} to={`/projects/${proj.id}`} onClick={()=>this.setState({itemSelected:{item:"projects", id:proj.id}})}><div className={"menu-item "+(this.state.itemSelected.item === "projects" && this.state.itemSelected.id === proj.id ? "menu-item-selected" : "")}><IonIcon icon={listOutline} />{proj.name}</div></Link> )
                            })}
                    </IonContent>
                </IonMenu>
                <IonContent id="main">
                        <IonRouterOutlet>
                            {/*<Route path="/" component={Home} exact={true} />*/}
                             <Route exact path="/" render={() => <Redirect to="/upcoming" />} />
                                
                        </IonRouterOutlet>
                </IonContent>
              </IonSplitPane>
            </IonContent>
        </IonReactRouter>
    </IonPage>
  );
    }
};

export default Home;
