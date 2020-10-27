// A whole lotta imports

// Ionic components
import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet, isPlatform } from '@ionic/react';
import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';

// Routing
import { IonReactRouter, IonReactHashRouter } from '@ionic/react-router';
import { Redirect, Route, Link, Switch } from 'react-router-dom';
import { createBrowserHistory, createHashHistory } from 'history';

// Like, your heart and soul
import React, { Component } from 'react';

// Cool components that we need
import Upcoming from './Upcoming';
import Completed from './Completed';
import Perspectives from './Perspectives';
import Projects from './Projects';

// Our very own CSS
import './Home.css';

// Tootips
import ReactTooltip from 'react-tooltip';

// autobind those functions
const autoBind = require('auto-bind/react');
const history = isPlatform("electron") ? createHashHistory() : createBrowserHistory();

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

// Welp. The Home.
class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            projects:[], // list of top level projects
            perspectives:[], // list of perspectives
            itemSelected:{item:"upcoming", id:undefined}, // so what did we actually select
        };
        // AutoBind!
        autoBind(this);
    }

    paginate = (to, id) => this.setState({itemSelected:{item:to ,id}})

    componentDidMount() {
        // This is, indeed, the view
        // Get the current URI to set which view is selected
        let url = (new URL(document.URL))
        let uri = url.pathname.split("/");
        let hash = url.hash.split("/");
        if (uri[1] === "")
            this.setState({itemSelected:{item:"upcoming", id:""}});
        else if (isPlatform("electron"))
            this.setState({itemSelected:{item:hash[1], id:hash[2]}});
        else
            this.setState({itemSelected:{item:uri[1], id:uri[2]}});
        /*
         * TODO TODO TODO
         * very very very bad practice below
         * shield your eyes
         *
         * Basically, database warms up slower
         * than does this function gets called. so
         * we wait 500ms 
         *
         */
        const refreshTimer = setTimeout(() => {this.refresh()}, 500);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.to !== this.state.to && this.state.to !== undefined)
             this.setState({sends:{to:undefined, id:undefined}})
    }

    async refresh() {
        // Load the top level projects and perspectives
        // to set into the state and to add to the menu
        let tlp = await this.props.engine.db.getTopLevelProjects(this.props.uid);
        let psp = await this.props.engine.db.getPerspectives(this.props.uid);

        this.setState({projects: tlp[2], perspectives:psp[2]});
    }




    render() {
        const Router = isPlatform("electron") ? IonReactHashRouter : IonReactRouter; // Router workaround for electron
        return (
            <IonPage>
                {/* The central router that controls the routing of views */}
                <Router history={history}>
                    {/* OoIp */}
                    <ReactTooltip />
                    {/* App container */}
                    <IonContent noBounce>
                        {/* Menu pane to control mobile view splitting */}
                        <IonSplitPane id="main-split" contentId="main" when="md">
                            {/* The left: menu! */}
                            <IonMenu id="main-menu" contentId="main">
                                <br />
                                <IonContent id="menu-content" className={(()=>{
                                    if (!isPlatform("electron")) // if we are not running electron
                                        return "normal"; // normal windowing proceeds
                                    else if (window.navigator.platform.includes("Mac")){ // macos
                                        return "darwin"; // frameless setup
                                    }
                                    else if (process.platform === "win32") // windows
                                        return "windows"; // non-frameless

                                })()}>
                                    {/* === Built Ins: upcoming + completed == */}
                                    {/* Upcoming button + link */}
                                    <Link to="/upcoming" onClick={()=>this.setState({itemSelected:{item:"upcoming", id:undefined}})}> {/* Link to trigger router */}
                                        {/* Upcoming button */}
                                        <div className={"menu-item "+(this.state.itemSelected.item === "upcoming" ? "menu-item-selected" : "")} style={{fontSize: 18}}><IonIcon style={{fontSize: 20}} icon={chevronForwardCircle} />Upcoming</div>
                                    </Link>

                                    {/* Completed button + link */}
                                    <Link to="/completed" onClick={()=>this.setState({itemSelected:{item:"completed", id:undefined}})}> {/* Link to trigger router */}
                                        {/* Completed button */}
                                        <div className={"menu-item "+(this.state.itemSelected.item === "completed" ? "menu-item-selected" : "")} style={{fontSize: 18}}><IonIcon style={{fontSize: 20}} icon={checkmarkCircle} />Completed</div>
                                    </Link>

                                    {/* === Perspectives == */}
                                    <div className="menu-sublabel menu-decoration">Perspectives</div>

                                    {/* === Perspective button + link == */}
                                                                {this.state.perspectives.map((psp) => {
                                                                    return (
                                                                        <Link key={psp.id} to={`/perspectives/${psp.id}`} onClick={()=>this.setState({itemSelected:{item:"perspectives", id:psp.id}})}> {/* Link to trigger router */}
                                                                            {/* Perspective button */}
                                                                            <div className={"menu-item "+(this.state.itemSelected.item === "perspectives" && this.state.itemSelected.id === psp.id ? "menu-item-selected" : "")}><i className="fas fa-layer-group" style={{paddingRight: 2}}></i> {psp.name}</div> 
                                                                        </Link>
                                                                    )
                                                                })}


                                    {/* === Projects == */}
                                    <div className="menu-sublabel menu-decoration">Projects <a onClick={()=>{
                                        let f = (async function() { // minification breaks double-called anonomous functions, so we must declare them explicitly
                                            let npid = (await this.props.gruntman.do(
                                                "project.create", {
                                                    uid: this.props.uid,
                                                },
                                            )).pid;
                                            history.push(`/projects/${npid}/do`);
                                            this.paginate("projects", npid);
                                            this.refresh();
                                        }).bind(this);
                                        f();

                                    }} className="fa fa-plus add"></a></div>
                                    {/* === Project Contents == */}
                                    {this.state.projects.map((proj) => {
                                        return (
                                            <Link key={proj.id} to={`/projects/${proj.id}`} onClick={()=>this.setState({itemSelected:{item:"projects", id:proj.id}})}> {/* Link to trigger router */}
                                                {/* Perspective button */}
                                                <div className={"menu-item "+(this.state.itemSelected.item === "projects" && this.state.itemSelected.id === proj.id ? "menu-item-selected" : "")}><IonIcon icon={listOutline}/>{proj.name}</div></Link> 
                                        )                            
                                    })}

                                </IonContent>

                                {/* Logout button */}
                                <div className="menu-item" id="logout" onClick={()=>(this.props.dispatch({operation: "logout"}))}><i className="fas fa-snowboarding" style={{paddingRight: 5}} />Logout</div>
                            </IonMenu>
                            <IonPage id="main">
                                {/* The actual page */}
                                <IonRouterOutlet>
                                    {/* empty => /upcoming*/}
                                    <Route render={() => <Redirect to="/upcoming"/>}/>
                                    {/* / => /upcoming */}
                                    <Route exact path="/" render={() => <Redirect to="/upcoming" />} />
                                    {/* and the perspective switch */}
                                    <Switch>
                                        {/* upcoming renders upcoming */}
                                        <Route path="/upcoming" exact render={()=><Upcoming engine={this.props.engine} uid={this.props.uid} gruntman={this.props.gruntman} />} />

                                        {/* completed renders completed */}
                                        <Route path="/completed" exact render={()=><Completed engine={this.props.engine} uid={this.props.uid} gruntman={this.props.gruntman} />} />

                                        {/* perspective renders perspectives */}
                                        <Route path="/perspectives/:id" render={({match})=><Perspectives engine={this.props.engine} id={match.params.id} uid={this.props.uid}  gruntman={this.props.gruntman}  menuRefresh={this.refresh} />}  />

                                        {/* project renders perspectives */}
                                        <Route path="/projects/:id/:create?" render={({match})=><Projects engine={this.props.engine} id={match.params.id} uid={this.props.uid}  gruntman={this.props.gruntman}  menuRefresh={this.refresh} paginate={this.paginate} options={match.params.create}/>}  />
                                        {/* TODO projects */}
                                    </Switch>
                                </IonRouterOutlet>
                            </IonPage>
                        </IonSplitPane>
                    </IonContent>
                </Router>
            </IonPage>
        );
    }
};

export default Home;
