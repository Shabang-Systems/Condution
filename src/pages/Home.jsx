// A whole lotta imports

// Ionic components
import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet, isPlatform, IonToast, IonFab, IonFabButton, IonFabList } from '@ionic/react';
import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, calendar } from 'ionicons/icons';

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

/* Keybinds! */
import { withShortcut, ShortcutProvider, ShortcutConsumer } from '../static/react-keybind'

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
import WorkspaceWelcome from './WorkspaceWelcome';
import ABTIB from './Components/FloatingActionButton';
import Keybinds from './Components/KeybindManager';
import ReleaseNotesModal from './Components/ReleaseNotesModal';
import Settings from './Settings';
import DropupMenu from './Components/DropupMenu';


import { MenuWidget } from "../backend/src/Widget";
import Project from "../backend/src/Objects/Project";
import Perspective from "../backend/src/Objects/Perspective";
import keybindHandler from "./Components/KeybindHandler"

import { KBarProvider , KBarPortal, KBarPositioner, KBarAnimator, KBarSearch, useMatches, NO_GROUP, KBarResults } from "kbar";
import CommandPalette from "./Components/CommandPalette";
import { nanoid } from 'nanoid'
import keybindSource from "./Components/KeybindSource";

// Our very own CSS
import './Home.css';

// Tootips
import ReactTooltip from 'react-tooltip';

// autobind those functions
const autoBind = require('auto-bind/react');
const history = isPlatform("electron") ? createHashHistory() : createBrowserHistory({basename: process.env.PUBLIC_URL});

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

        // AutoBind!
        autoBind(this);

        this.state = {
            projects:[], // list of top level projects
            perspectives:[], // list of perspectives
            itemSelected:{item:"upcoming", id:undefined}, // so what did we actually select
            isWorkspace:false, // current workspace
            workspace: this.props.authType==="workspace" ? this.props.workspace : this.props.uid, // current workspace/uid
            pendingAcceptances: [], // pending acceptance toasts to show
            menuWidget: new MenuWidget(this.props.cm),

	    keybinds: [],
	    mounted: false,

	    activatingPalette: false,
	    qs_show: false,
	    qs_launched_with_button: false,
	    goBackSkip: false,
	    goForwardSkip: false,
	    allKeybinds: null,
        };


        //this.perspectivemenuWidget = new PerspectivesMenuWidget(this.props.cm);
        //this.projectmenuWidget = new ProjectMenuWidget(this.props.cm);

        // Execute the datapacks to cache them

        //this.perspectivemenuWidget.hook(this.refresh);
        //this.projectmenuWidget.hook(this.refresh);

        this.props.cm.hookInvite(this.updateInvites);


        this.abtibRef = React.createRef();

        this.menu = React.createRef();
        this.menuContent = React.createRef();
    }

    //switch = (workspaceType, id=this.props.uid) => { 
    //if (workspaceType === "workspace")
    //this.props.engine.workspaceify();
    //else
    //this.props.engine.userlandify();
    //this.setState({isWorkspace: workspaceType==="workspace", workspace:id});
    //}

    paginate = (to, id) => this.setState({itemSelected:{item:to ,id}}) // Does not actually paginate; instead, it... uh... sets the highlighting of the menu

    handleHistoryBack = () => {
	if (this.state.goForwardSkip == true) {
	    this.setState({goForwardSkip: false});
	    return
	}
	this.setState({goForwardSkip: true});
	//this.setState({itemSelected: {item:"perspectives", id:psp.id}});
	//if (this.menu.current)
	//    this.menu.current.close();
	//console.log(String(history.location.pathname).split("/"))
	history.goBack() // TODO this doesnt highlight the sides?
	// TODO fix later! w/ @jemoka
	const locals = String(history.location.pathname).split("/")
	this.setState({itemSelected: {item: locals[1], id: locals[2]}})
	if (this.menu.current)
	    this.menu.current.close();
    }

    handleHistoryForward = () => {
	if (this.state.goBackSkip == true) {
	    this.setState({goBackSkip: false});
	    return
	}
	this.setState({goBackSkip: true});
	history.goForward()
    }

    focusFab = () => {
	//console.log("Focusing fab")
	if (this.abtibRef.current) this.abtibRef.current.focus()
    }

    handleLogout = () => {
	history.push(`/`)
	this.props.dispatch({operation: "logout"})
    }


    handleNewPerspective = () => {
	if (this.menu.current)
	    this.menu.current.close();
	let f = (async function() { // minification breaks double-called anonomous functions, so we must declare them explicitly
	    let np = await Perspective.create(this.props.cm)
	    let npid = np.id

	    history.push(`/perspectives/${npid}/do`);
	    this.paginate("perspectives", npid);
	    this.refresh();
	}).bind(this);
	f();
    }


    async componentDidMount() {
	const content = this.menuContent.current;
        const styles = document.createElement('style');
        styles.textContent = `
            .scroll-y::-webkit-scrollbar {
                display: none;
            }
        `;
        if(content)
            content.shadowRoot.appendChild(styles);

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
        this.state.menuWidget.hook(this.refresh);

	await keybindSource.then(k => {
	    if (k.Global) {
		this.setState({allKeybinds: k})
		keybindHandler(this, [
		    [this.handleHistoryBack, k.Global["Go back"], 'Go back', 'Navigates backward in history'],
		    [this.handleHistoryForward, k.Global["Go forwards"], 'Go forwards', 'Navigates forward in history'],
		    [this.handleLogout, k.Global['Logout'], 'Logout', 'Logout of Condution'],
		    [this.handleNewPerspective, k.Global['New perspective'], 'New perspective', 'Create a new perspective'],
		    [this.focusFab, k.Global['Add to inbox'], 'Add to inbox', 'Focus the Add to Inbox button', true, true],
		])
	    }
	});

	//console.log(shortcut.shortcuts, "da shortcuts")
        this.refresh();
	this.setState({ mounted: true });
    }

    updateInvites() {
        let inviteNotes = this.props.cm.pendingAcceptances;
        this.setState({pendingAcceptances: inviteNotes});
    }

    componentWillUnmount() {
        this.state.menuWidget.unhook(this.refresh);
        this.props.cm.unhookInvite(this.updateInvites);
	const { shortcut } = this.props
	for (const i in this.state.keybinds) {
	    shortcut.unregisterShortcut(this.state.keybinds[i])
	}
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
        let res = await this.state.menuWidget.execute();
        this.setState({
            projects: res[0],
            perspectives: res[1],
        });
    }


    onDragEndPsp = result => {

        if (!result.destination || (result.destination.droppableId == result.source.droppableId && result.destination.index == result.source.index)) {
            return
        }

	let pspOrder = this.state.perspectives

	let inDrag = pspOrder[result.source.index]
	pspOrder.splice(result.source.index, 1);
	pspOrder.splice(result.destination.index, 0, inDrag);


	pspOrder.forEach((v,i) => {
	    if (v.order != i) { v.order = i }
	})

	this.setState({perspectives: pspOrder})
    }

    onDragEndPrj = result => {
        if (!result.destination || (result.destination.droppableId == result.source.droppableId && result.destination.index == result.source.index)) {
            return
        }

        let prjOrder = this.state.projects

        let inDrag = prjOrder[result.source.index]
        prjOrder.splice(result.source.index, 1);
        prjOrder.splice(result.destination.index, 0, inDrag);

	prjOrder.forEach(async (v,i) => {
	    if (v.order != i) { await v.reorder(i) }
	})


        this.setState({projects: prjOrder})
    }

    onPaletteActivate() {
	this.setState({activatingPalette: nanoid()})
    }

    activateQuickSwitcher(launched_with_button) {
        this.setState({qs_show: !this.state.qs_show, qs_launched_with_button: launched_with_button}); 
    }

    dismissQs() {
        this.setState({qs_show: false}); 
    }

    render() {
        const Router = isPlatform("electron") ? IonReactHashRouter : IonReactRouter; // Router workaround for electron
        return (
	    <IonPage>
		<KBarProvider
		    actions = {[]}
		    options = {{
			toggleShortcut: "$mod+Shift+P",
			enableHistory: true,
		    }}
		>
		    <CommandPalette
			historyPath = {history.location.pathname}
			mounted = {this.state.mounted}
			shouldUpdate = {this.state.activatingPalette}
			activateQuickSwitcher = {this.activateQuickSwitcher}
		    />

		    {/*<ShortcutProvider>*/}
		    {/* The central router that controls the routing of views */}
		    <Router history={history}>
			{/* @TheEnquirer TODO
			*/}
			<Keybinds 
			    paginate={this.paginate} 
			    ref={this.keybindRef} 
			    perspectives={this.state.perspectives}
			    projects={this.state.projects}
			    abtib={this.abtibRef} 
			    localizations={this.props.localizations}
			    cm={this.props.cm}
			    onPaletteActivate={this.onPaletteActivate}
			    activateQuickSwitcher={this.activateQuickSwitcher}
			    qs_show={this.state.qs_show}
			    qs_launched_with_button={this.state.qs_launched_with_button}
			    dismissQs={this.dismissQs}
			    /*engine={this.props.engine} */
			    /*uid={this.state.workspace} */
			    /*gruntman={this.props.gruntman} */
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
				    <IonContent id="menu-content" ref={this.menuContent} className={(()=>{
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
					<Link to="/upcoming" onClick={()=>{
					    this.setState({itemSelected:{item:"upcoming", id:undefined}});
					    if (this.menu.current)
						this.menu.current.close();

					}}> {/* Link to trigger router */}
					    {/* Upcoming button */}
					    <div className={"menu-item "+(this.state.itemSelected.item === "upcoming" ? "menu-item-selected" : "")} style={{fontSize: 18}}><IonIcon style={{fontSize: 20}} icon={chevronForwardCircle} />{this.props.localizations.upcoming}</div>
					</Link>

					{/* Completed button + link */}
					<Link to="/completed" onClick={()=>{
					    this.setState({itemSelected:{item:"completed", id:undefined}});
					    if (this.menu.current)
						this.menu.current.close();
					}}> {/* Link to trigger router */}
					    {/* Completed button */}
					    <div className={"menu-item "+(this.state.itemSelected.item === "completed" ? "menu-item-selected" : "")} style={{fontSize: 18}}><IonIcon style={{fontSize: 20, transform: "translateY(3.5px)"}} icon={checkmarkCircle} />{this.props.localizations.completed}</div>
					</Link>

					{/* Calendar button + link */}
					<Link to="/calendar" onClick={()=>{
					    this.setState({itemSelected:{item:"calendar", id:undefined}})
					    if (this.menu.current)
						this.menu.current.close();

					}}> {/* Link to trigger router */}
					    {/* Calendar button */}
					    <div className={"menu-item "+(this.state.itemSelected.item === "calendar" ? "menu-item-selected" : "")} style={{fontSize: 18}}><IonIcon style={{fontSize: 20, transform: "translateY(3.5px)"}} icon={calendar} />{this.props.localizations.calendar}</div>
					</Link>

					{/* === Perspectives == */}
					<div className="menu-sublabel menu-decoration">{this.props.localizations.perspectives} <a onClick={()=>{
					    if (this.menu.current)
						this.menu.current.close();
					    let f = (async function() { // minification breaks double-called anonomous functions, so we must declare them explicitly
						let np = await Perspective.create(this.props.cm)
						let npid = np.id

						history.push(`/perspectives/${npid}/do`);
						this.paginate("perspectives", npid);
						this.refresh();
					    }).bind(this);
					    f();
					    //if (this.menu.current)
					    //this.menu.current.close();
					    //let f = (async function() { // minification breaks double-called anonomous functions, so we must declare them explicitly
					    //let npid = (await this.props.gruntman.do(
					    //"perspective.create", {
					    //uid: this.state.workspace,
					    //},
					    //true
					    //)).pid;
					    //history.push(`/perspectives/${npid}/do`);
					    //this.paginate("perspectives", npid);
					    //this.refresh();
					    //}).bind(this);
					    //f();

					}
					} className="fa fa-plus add"></a></div>

					{/* === Perspective button + link == */}



					<DragDropContext onDragEnd={this.onDragEndPsp}>
					    <Droppable droppableId={"psp"}>
						{provided => (
						    <div
							ref = {provided.innerRef}
							{...provided.droppableProps}
							style = {{
							    //height: 500


							}}
						    >

							{this.state.perspectives.map((psp, i) => (
							    <Draggable draggableId={psp.id} key={psp.id} index={i}>
								{(provided, snapshot) => (
								    <div
									{...provided.draggableProps}
									{...provided.dragHandleProps}
									ref={provided.innerRef}
									key={psp.id}

								    >
									<Link key={psp.id} to={`/perspectives/${psp.id}`} 

									    onClick={()=>{
										this.setState({itemSelected:{item:"perspectives", id:psp.id}});
										if (this.menu.current)
										    this.menu.current.close();
									    }}> {/* Link to trigger router */}
									    {/* Perspective button */}
									    <div className={"menu-item "+(this.state.itemSelected.item === "perspectives" && this.state.itemSelected.id === psp.id ? "menu-item-selected" : "")}
										style = {{
										    //border: "1px solid red"
										    background: `${snapshot.isDragging ? "var(--menu-semiaccent-background)" : ""}`

										}}

									    >
										<i className="fas fa-layer-group" 
										    style={{
											paddingRight: 2,
											//backgroundColor: "red"
										    }}>
										</i> {psp.name}
									    </div> 
									</Link>
								    </div>
								)}
							    </Draggable>
							)
							)}
							{provided.placeholder}
						    </div> )
						}
					    </Droppable>
					</DragDropContext>


					{/* === Projects == */}
					<div className="menu-sublabel menu-decoration">{this.props.localizations.projects}<a onClick={()=>{
					    if (this.menu.current)
						this.menu.current.close();
					    let f = (async function() { // minification breaks double-called anonomous functions, so we must declare them explicitly
						let np = await Project.create(this.props.cm)
						let npid = np.id

						history.push(`/projects/${npid}/do`);
						this.paginate("projects", npid);
						this.refresh();
					    }).bind(this);
					    f();

					}} className="fa fa-plus add"></a></div>

					{/* === Project Contents == */}
					<DragDropContext onDragEnd={this.onDragEndPrj}> 
					    <Droppable droppableId={"prj"}>
						{provided => (
						    <div 
							ref = {provided.innerRef}
							{...provided.droppableProps}
						    >
							{this.state.projects.map((proj, i) => (
							    <Draggable draggableId={proj.id} key={proj.id} index={i}>
								{(provided, snapshot) => (
								    <div
									{...provided.draggableProps}
									{...provided.dragHandleProps}
									ref={provided.innerRef}
									key={proj.id}
								    >
									<Link key={proj.id} to={`/projects/${proj.id}`} onClick={()=>{
									    this.setState({itemSelected:{item:"projects", id:proj.id}})
									    //console.log(proj)
									    if (this.menu.current)
										this.menu.current.close();
									}}> {/* Link to trigger router */}
									    {/* Perspective button */}
									    <div className={"menu-item "+(this.state.itemSelected.item === "projects" && this.state.itemSelected.id === proj.id ? "menu-item-selected" : "")}
										style = {{
										    background: `${snapshot.isDragging ? "var(--menu-semiaccent-background)" : ""}`
										}}

									    ><IonIcon icon={listOutline}/>{proj.name}</div></Link>
								    </div>
								)}
							    </Draggable>
							)
							)}
							{provided.placeholder}
						    </div> )}
					    </Droppable>
					</DragDropContext>

				    </IonContent>
                <div id="bottombar">
				    <div className="menu-item bottomitem" id="logout" onClick={this.handleLogout}><i className="fas fa-snowboarding" style={{paddingRight: 5}} />{this.props.authType == "workspace" ? this.props.localizations.exitworkspace : this.props.localizations.logout}</div>
                    <div className="">
                        <DropupMenu

                            localizations={this.props.localizations} 
                            settingsButtonComponent={
                                <Settings 
                                    authType={this.props.authType} 
                                    localizations={this.props.localizations} 
                                    cm={this.props.cm}
                                    dispatch={this.props.dispatch}
                                    isSettings={true}
				    allKeybinds={this.state.allKeybinds}
                                />
                            }
                            activateQuickSwitcher={this.activateQuickSwitcher}
                        />
                    </div>
                </div>
				</IonMenu>
				<IonPage id="main">
				    {/* raise a glass to Workspace Add */}
				    <IonToast
					mode="ios"
					cssClass="workspace-toast"
					isOpen={this.state.pendingAcceptances.length > 0}
					message={`Invitation to join workspace ${this.state.pendingAcceptances[0]? this.state.pendingAcceptances[0].ws.name: ""}`}
					position="bottom"
					buttons={[
					    {
						text: 'Reject',
						    role: 'cancel',
						    handler: (async function () {
							this.props.cm.rescindWorkspace(this.state.pendingAcceptances[0].ws.id, this.state.pendingAcceptances[0].inviteID);
							//await this.props.engine.db.resolveInvitation(this.state.isWorkspaceRequestShown[1][2], this.props.email)
							//this.setState({isWorkspaceRequestShown: [false, null]});
						    }).bind(this)
					    },
					    {
						text: 'Accept',
						handler: (async function () {
						    this.props.cm.acceptWorkspace(this.state.pendingAcceptances[0].ws.id, this.state.pendingAcceptances[0].inviteID);

						    //                                                let workspace = this.state.isWorkspaceRequestShown[1][0];
						    //let newWorkspaces = [...(await this.props.engine.db.getWorkspaces(this.props.uid)), workspace];
						    //await this.props.engine.db.updateWorkspaces(this.props.uid, newWorkspaces);
						    //await this.props.engine.db.resolveInvitation(this.state.isWorkspaceRequestShown[1][2], this.props.email)
						    //this.setState({isWorkspaceRequestShown: [false, null]});
						}).bind(this)
					    }
					]}
				    />
				    {/* the add button to inbox button*/}
				    <ABTIB reference={this.abtibRef} cm={this.props.cm} localizations={this.props.localizations} />
				    <ReleaseNotesModal authType={this.props.authType} />
				    {/* the portal root for DOM elements to park */}
				    <div id="parking-lot"></div>
				    {/* The actual page */}
				    <IonRouterOutlet>
					{/* empty => /upcoming*/}
					<Route render={() => <Redirect to="/upcoming" />} />
					{/* / => /upcoming */}
					<Route exact path="/" render={() => <Redirect to="/upcoming" />} />
					{/* and the perspective switch */}
					<Switch>
					    {/* upcoming renders upcoming */}

					    <Route path="/workspaces/:id" render={({match}) => <WorkspaceWelcome cm={this.props.cm} paginate={this.paginate} id={match.params.id} actualUID={this.props.uid} menuRefresh={this.refresh} localizations={this.props.localizations} authType={this.props.authType} />} />

					    <Route path="/upcoming" exact render={() => <Upcoming cm={this.props.cm} uid={this.state.workspace} allKeybinds={this.state.allKeybinds} displayName={this.props.displayName} localizations={this.props.localizations} actualUID={this.props.uid} switch={this.switch} authType={this.props.authType} email={this.props.email} />} />
					    <Route path="/calendar" exact render={() => <Calendar cm={this.props.cm} uid={this.state.workspace} allKeybinds={this.state.allKeybinds} localizations={this.props.localizations} />} />
					    <Route path="/completed" exact render={() => <Completed history={history} paginate={this.paginate} allKeybinds={this.state.allKeybinds} localizations={this.props.localizations} cm={this.props.cm} />} />

					    <Route path="/perspectives/:id/:create?" render={({match}) => <Perspectives cm={this.props.cm} paginate={this.paginate} id={match.params.id} menuRefresh={this.refresh} options={match.params.create} localizations={this.props.localizations} history={history} allKeybinds={this.state.allKeybinds}/>} />

					    <Route 
						path="/projects/:id/:create?" 
						render={({match}) => 
						    <Projects 
							cm={this.props.cm}
							id={match.params.id} 
							//engine={this.props.engine} 
							//uid={this.state.workspace} 
							//gruntman={this.props.gruntman} 
							menuRefresh={this.refresh} 
							paginate={this.paginate} 
							options={match.params.create} 
							localizations={this.props.localizations} 
							history={history}
							allKeybinds={this.state.allKeybinds}

						    />
						} 
					    />

					</Switch>
				    </IonRouterOutlet>
				</IonPage>
			    </IonSplitPane>
			</IonContent>
		    </Router>
		{/*</ShortcutProvider>*/}
		</KBarProvider>
	    </IonPage>
        );
    }
};

export default withShortcut(Home);
