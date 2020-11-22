// A whole lotta imports


// Ionic components
import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet, isPlatform, IonToast } from '@ionic/react';
import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, calendar } from 'ionicons/icons';

// Routing
import { IonReactRouter, IonReactHashRouter } from '@ionic/react-router';
import { Redirect, Route, Link, Switch } from 'react-router-dom';
import { createBrowserHistory, createHashHistory } from 'history';

// Like, your heart and soul
import React, { Component } from 'react';

// Cool components that we need
import Upcoming from './Upcoming';
import Calendar from './Calendar';
import Completed from './Completed';
import Perspectives from './Perspectives';
import Projects from './Projects';
import ABTIB from './Components/FloatingActionButton';
import Keybinds from './Components/KeybindManager';
import ReleaseNotesModal from './Components/ReleaseNotesModal';

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
            isWorkspace:false, // current workspace
            workspace: this.props.uid, // current workspace/uid
            isWorkspaceRequestShown: [false, null] // is the workspace toast shown
        };

        if (this.state.isWorkspace)
            this.props.engine.workspaceify()
        else
            this.props.engine.userlandify()


        this.props.gruntman.registerGlobalRefresher(this.refresh.bind(this));

        // AutoBind!
        autoBind(this);

        this.abtibRef = React.createRef();

        this.menu = React.createRef();
    }

    switch = (workspaceType, id=this.props.uid) => { 
        if (workspaceType === "workspace")
            this.props.engine.workspaceify();
        else
            this.props.engine.userlandify();
        this.setState({isWorkspace: workspaceType==="workspace", workspace:id});
    }

    paginate = (to, id) => this.setState({itemSelected:{item:to ,id}}) // Does not actually paginate; instead, it... uh... sets the highlighting of the menu

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

        this.refresh()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.to !== this.state.to && this.state.to !== undefined)
             this.setState({sends:{to:undefined, id:undefined}})

        if (prevState.workspace !== this.state.workspace) 
            this.refresh();

/*            if (this.state.isWorkspace)*/
                //this.props.engine.workspaceify()
            //else
                /*this.props.engine.userlandify()*/
    }

    async refresh() {
        // Load the top level projects and perspectives
        // to set into the state and to add to the menu
        let tlp = await this.props.engine.db.getTopLevelProjects(this.state.workspace);
        let psp = await this.props.engine.db.getPerspectives(this.state.workspace);
        
        if (this.props.authType === "firebase") {
            let invites = await this.props.engine.db.getInvitations(this.props.email);
            let top = invites.sort((a, b)=>a.time.seconds<b.time.seconds)[invites.length-1];
            if (top) {
                this.props.gruntman.lockUpdates();
                if (top.type === "revoke") {
                    let newWorkspaces = (await this.props.engine.db.getWorkspaces(this.props.uid)).filter(e=>(e != top.workspace));
                    await this.props.engine.db.updateWorkspaces(this.props.uid, newWorkspaces);
                    await invites.filter(i=>i.workspace===top.workspace).forEach(i=>this.props.engine.db.resolveInvitation(i.id, this.props.email)) // simply accept all rejections and anything that happened before, and...
                    this.switch("userland");
                    // TODO potenially prompt the user
                } else if (top.type === "invite")
                    this.setState({isWorkspaceRequestShown: [true, [top.workspace,  (await this.props.engine.db.getWorkspace(top.workspace)).meta.name, top.id]]});
                this.props.gruntman.unlockUpdates();
            }
        }

        this.setState({projects: tlp[2], perspectives:psp[2]});
    }




    render() {
        const Router = isPlatform("electron") ? IonReactHashRouter : IonReactRouter; // Router workaround for electron
        return (
            <IonPage>
                {/* The central router that controls the routing of views */}
                <Router history={history}>
		    <Keybinds 
			paginate={this.paginate} 
			ref={this.keybindRef} 
			perspectives={this.state.perspectives}
			projects={this.state.projects}
			abtib={this.abtibRef} 
			engine={this.props.engine} 
			uid={this.state.workspace} 
			gruntman={this.props.gruntman} 
		    />
                    {/* OoIp */}
                    <ReactTooltip />
                    {/* App container */}
                    <IonContent noBounce forceOverscroll={false}>
                        {/* Menu pane to control mobile view splitting */}
                        <IonSplitPane id="main-split" contentId="main" mode="md">
                            {/* The left: menu! */}
                            <IonMenu id="main-menu" contentId="main" ref={this.menu}>
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
                                        <div className={"menu-item "+(this.state.itemSelected.item === "upcoming" ? "menu-item-selected" : "")} style={{fontSize: 18}}><IonIcon style={{fontSize: 20}} icon={chevronForwardCircle} />{this.props.localizations.upcoming}</div>
                                    </Link>

                                    {/* Completed button + link */}
                                    <Link to="/completed" onClick={()=>this.setState({itemSelected:{item:"completed", id:undefined}})}> {/* Link to trigger router */}
                                        {/* Completed button */}
                                        <div className={"menu-item "+(this.state.itemSelected.item === "completed" ? "menu-item-selected" : "")} style={{fontSize: 18}}><IonIcon style={{fontSize: 20, transform: "translateY(3.5px)"}} icon={checkmarkCircle} />{this.props.localizations.completed}</div>
                                    </Link>

                                    {/* Calendar button + link */}
                                    <Link to="/calendar" onClick={()=>this.setState({itemSelected:{item:"calendar", id:undefined}})}> {/* Link to trigger router */}
                                        {/* Calendar button */}
                                        <div className={"menu-item "+(this.state.itemSelected.item === "calendar" ? "menu-item-selected" : "")} style={{fontSize: 18}}><IonIcon style={{fontSize: 20, transform: "translateY(3.5px)"}} icon={calendar} />{this.props.localizations.calendar}</div>
                                    </Link>

                                    {/* === Perspectives == */}
                                    <div className="menu-sublabel menu-decoration">{this.props.localizations.perspectives} <a onClick={()=>{
                                        if (this.menu.current)
                                            this.menu.current.close();
                                        let f = (async function() { // minification breaks double-called anonomous functions, so we must declare them explicitly
                                            let npid = (await this.props.gruntman.do(
                                                "perspective.create", {
                                                    uid: this.state.workspace,
                                                },
                                            )).pid;
                                            history.push(`/perspectives/${npid}/do`);
                                            this.paginate("perspectives", npid);
                                            this.refresh();
                                        }).bind(this);
                                        f();

                                    }} className="fa fa-plus add"></a></div>

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
                                    <div className="menu-sublabel menu-decoration">{this.props.localizations.projects}<a onClick={()=>{
                                        if (this.menu.current)
                                            this.menu.current.close();
                                        let f = (async function() { // minification breaks double-called anonomous functions, so we must declare them explicitly
                                            let npid = (await this.props.gruntman.do(
                                                "project.create", {
                                                    uid: this.state.workspace,
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
                                <div className="menu-item" id="logout" onClick={()=>{history.push(`/`);this.props.dispatch({operation: "logout"})}}><i className="fas fa-snowboarding" style={{paddingRight: 5}} />{this.props.localizations.logout}</div>
                            </IonMenu>
                            <IonPage id="main">
                                {/* raise a glass to Workspace Add */}
                                <IonToast
                                    mode="ios"
                                    cssClass="workspace-toast"
                                    isOpen={this.state.isWorkspaceRequestShown[0]}
                                    message={`Invitation to join workspace ${this.state.isWorkspaceRequestShown[1]?this.state.isWorkspaceRequestShown[1][1]:""}`}
                                    position="bottom"
                                    buttons={[
                                        {
                                            text: 'Reject',
                                            role: 'cancel',
                                            handler:  (async function() {
                                                await this.props.engine.db.resolveInvitation(this.state.isWorkspaceRequestShown[1][2], this.props.email)
                                                this.setState({isWorkspaceRequestShown: [false, null]});
                                            }).bind(this)
                                        },
                                        {
                                            text: 'Accept',
                                            handler: (async function() {
                                                let workspace = this.state.isWorkspaceRequestShown[1][0];
                                                let newWorkspaces = [...(await this.props.engine.db.getWorkspaces(this.props.uid)), workspace];
                                                await this.props.engine.db.updateWorkspaces(this.props.uid, newWorkspaces);
                                                await this.props.engine.db.resolveInvitation(this.state.isWorkspaceRequestShown[1][2], this.props.email)
                                                this.setState({isWorkspaceRequestShown: [false, null]});
                                            }).bind(this)
                                        }
                                    ]}
                                />
                                {/* the add button to inbox button*/}
                                <ABTIB reference={this.abtibRef} uid={this.state.workspace} gruntman={this.props.gruntman} localizations={this.props.localizations}/>
                                <ReleaseNotesModal />
                                {/* the portal root for DOM elements to park */}
                                <div id="parking-lot"></div>
                                {/* The actual page */}
                                <IonRouterOutlet>
                                    {/* empty => /upcoming*/}
                                    <Route render={() => <Redirect to="/upcoming"/>}/>
                                    {/* / => /upcoming */}
                                    <Route exact path="/" render={() => <Redirect to="/upcoming" />} />
                                    {/* and the perspective switch */}
                                    <Switch>
                                        {/* upcoming renders upcoming */}
                                        <Route path="/upcoming" exact render={()=><Upcoming engine={this.props.engine} uid={this.state.workspace} gruntman={this.props.gruntman} displayName={this.props.displayName} localizations={this.props.localizations} actualUID={this.props.uid} switch={this.switch} authType={this.props.authType} email={this.props.email}/>} />
                                        {/* completed renders completed */}
                                        <Route path="/calendar" exact render={()=><Calendar engine={this.props.engine} uid={this.state.workspace} gruntman={this.props.gruntman} />} localizations={this.props.localizations} />

                                        {/* completed renders completed */}
                                        <Route path="/completed" exact render={()=><Completed engine={this.props.engine} uid={this.state.workspace} gruntman={this.props.gruntman} localizations={this.props.localizations} />} />

                                        {/* perspective renders perspectives */}
                                        <Route path="/perspectives/:id/:create?" render={({match})=><Perspectives engine={this.props.engine} paginate={this.paginate} id={match.params.id} uid={this.state.workspace}  gruntman={this.props.gruntman}  menuRefresh={this.refresh}  options={match.params.create} localizations={this.props.localizations}/>}  />

                                        {/* project renders perspectives */}
                                        <Route path="/projects/:id/:create?" render={({match})=><Projects engine={this.props.engine} id={match.params.id} uid={this.state.workspace}  gruntman={this.props.gruntman}  menuRefresh={this.refresh} paginate={this.paginate} options={match.params.create} localizations={this.props.localizations}/>}  />
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
