/* Global Imports */
import React, { Component } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonMenu, setupConfig } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Themefiles */
import './themefiles/condutiontheme-default-adapter.css';
import './themefiles/condutiontheme-default.css';
import './themefiles/condutiontheme-default-dark.css';
import './themefiles/condutiontheme-default-light.css';
//import './themefiles/condutiontheme-default-new.css';
import './themefiles/condutiontheme-black-n-red.css';

/* Font awesome */
import './static/fa/scripts/all.min.css';

/* Theme variables */
import './theme/variables.css';

/* Capacitor core plugins + jQuery */
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Storage } from '@capacitor/storage';

/* Keybinds! */
import { withShortcut, ShortcutProvider, ShortcutConsumer } from './static/react-keybind'

import $ from "jquery";

/* Our Lovley Core Engine */
//import Engine from './backend/CondutionEngine';
//import Gruntman from './gruntman';

import { CustomJSONProvider, FirebaseProvider, Context, ReferenceManager, GloballySelfDestruct, Hookifier } from "./backend/src/CondutionEngine";


/* Firebase */
//import * as firebase from "firebase/app";

/* Auth and store modules */
//import "firebase/auth";
//import "firebase/firestore";

/* Views that we need */
import Auth from './pages/Auth';
import Loader from './pages/Loader';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import FirstInteraction from './pages/FirstInteraction';

/* Localization Toolkit */
import LocalizedStrings from 'react-localization';

/* AutoBind */
const autoBind = require('auto-bind/react');

/* 
 * Hello human, good morning.
 *
 * Hope you are doing well. Thanks (why are you) visiting App.jsx?
 *
 * I manage global routing, auth handling, and all that jazz.
 * You should not touch me to change the interface.
 * But I guess I change the interface. So.
 *
 * I kind of change the interface?
 *
 * Anyways, I return one of Loader, Auth, or Home depending on auth state.
 *
 * And check for the auth state to determine which one to return
 *
 * It's not really a poem, isn't it.
 *
 * @Jemoka
 *
 */

setupConfig({ swipeBackEnabled: false, }); // globally disable swipe b/c we implemented our own

const dbRoot = Directory.Data;
const dbPath = 'condution.json'; // TODO: use capacitor storage api

async function readJSON() {
    let contents;
    try {
        contents = (await Filesystem.readFile({
            path: dbPath,
            directory: dbRoot,
            encoding: Encoding.UTF8
        })).data;
    } catch(e) {
        contents = "{}";
        await Filesystem.writeFile({
            path: dbPath,
            directory: dbRoot,
            data: JSON.stringify({}),
            encoding: Encoding.UTF8
        })
    }
    return JSON.parse(contents);
}

async function writeJSON(data) {
    await Filesystem.writeFile({
        path: dbPath,
        directory: dbRoot,
        data: JSON.stringify(data),
        encoding: Encoding.UTF8
    });
}

async function readPort(portID=18230) {
    try {
        let res = await (await fetch(`http://localhost:${portID}/`)).json();
        return res;
    } catch {
        console.log('CondutionEngine: Failed to access Self-Hosted Backend server; we likely are running on an official build. Disabling self-hosting.');
        return {};
    }
}

async function writePort(data, portID=18230) {
    try {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
        await fetch(`http://localhost:${portID}/`, requestOptions);
    } catch {
        return {};
    }
}

//async function writeJSON(data) {
    //await Filesystem.writeFile({
        //path: dbPath,
        //directory: dbRoot,
        //data: JSON.stringify(data),
        //encoding: FilesystemEncoding.UTF8
    //});
//}


class App extends Component {
    constructor(props) {
        super(props);
        let localizations = new LocalizedStrings({
            en: require("./static/I18n/main.json"),
            zh: require("./static/I18n/zh-CN.json"),
            de: require("./static/I18n/de-DE.json"),
        });

        
        // TODO TODO remove this
        //localizations.setLanguage("zh");

            // We start with setting our state. We don't know our user's UID (duh)
            this.state = {authMode: "loader", uid: "", displayName: "", localizations, workspace: null};
            
            // We also set the theme based on the user's media query
            if (window.matchMedia('(prefers-color-scheme:dark)').matches) {
                $("body").removeClass();
                $("body").addClass("condutiontheme-default-dark");
            }
            else {
                $("body").removeClass();
                $("body").addClass("condutiontheme-default-light");
            }

            this.jsondata = {};
            this.portdata = {};

            // Make ourselves a nice gruntman
            //this.gruntman = new Gruntman(Engine);
            //this.gruntman.localizations = localizations;
            // And AutoBind any and all functions
        
            autoBind(this);
        }

        async componentDidMount() {
            console.log("Hello world. This is Condution.");
            console.log("Reading JSON and self-hosting data into memory.");
            this.jsondata = await readJSON();
            this.portdata = await readPort();

            const providers = {
                "firebase": new FirebaseProvider(),
                "json": new CustomJSONProvider("json", () => {
                    return this.jsondata;
                }, (data) => {
                    this.jsondata = data;
                    writeJSON(data);
                }),
                "portjson": new CustomJSONProvider("portjson", () => {
                    return this.portdata;
                }, (data) => {
                    this.portdata = data;
                    writePort(data);
                })
            }

            console.log("Done! Initializing References and yo' Context.");
            let refMgr = new ReferenceManager([providers["firebase"], providers["json"], providers["portjson"]]);
            this.cm = new Context(refMgr);


            // This IS in fact the view
            let view = this;

            // Light the fire, kick the tires an instance 
            // of {firebase}, and initializing the firebase 
            // and json engines
            //await Engine.start({firebase}, "firebase", "json");

            console.log("Beautiful! Loading Workspace URL info.");
            let url = (new URL(document.URL))
            let uri = url.pathname.split("/");

            let ret = await Storage.get({key: 'condution_onboarding'})
            let val = undefined;
            try {
                val = JSON.parse(ret.value);
            } catch(e) {} finally {
                if (ret.value !== "done" && val !== "done" && uri[1] !== "workspaces") {
                    view.setState({authMode: "FI"});
                    return;
                }
            }
            console.log("Printing the XSS warning.");
            console.log('%cSTOP! ', 'background: #fff0f0; color: #434d5f; font-size: 80px');
            console.log('%cClose this panel now.', "background: #fff0f0;color: transparent; background-image: linear-gradient(to left, violet, indigo, blue, green, yellow, orange, red);   -webkit-background-clip: text; font-size: 40px; ;");
            console.log('%c19/10 chance you are either a terribly smart person and should work with us (hliu@shabang.cf) or are being taken advantanged of by a very terrible person. ', 'background: #fff0f0; color: #434d5f; font-size: 20px');
            console.log('%cPlease help us to help you... Don\'t self XSS yourself.', 'background: #fff0f0; color: #434d5f; font-size: 15px');

            console.log("It's dispatch time, dispathing!");
            // ==Handling cached dispatch==
            // So, do we have a condution_stotype? 
            Storage.get({key: 'condution_stotype'}).then((async function(dbType) {
                switch (dbType.value) {
                        // If its firebase 
                    case "firebase":
                        // Check if we actually has a user
                        //firebase.auth().onAuthStateChanged(function(user) {
                            //if (!user)
                                //view.authDispatch({operation:"logout"});
                            // If we have one, shift the engine into firebase mode
                            //else {
                        view.cm.useProvider("firebase");
                                // Load the authenticated state, set authmode as "firebase" and supply the UID
                        await view.cm.start();
                        view.setState({authMode: "firebase"});
                        //uid: user.uid, displayName: user.displayName
                            //}
                        //})
                        break;
                        // If its json
                    case "json":
                    case "portjson":
                        // Shift the engine into json mode
                        this.cm.useProvider(dbType.value);
                        await this.cm.start();
                        // Load the authenticated state, set the authmode as "json" and supply "hard-storage-user" as UID
                        this.setState({authMode: dbType.value, uid:"hard-storage-user"});
                        break;
                        // If its workspace preload
                    case "workspace":
                        if (uri[1] !== "workspaces") {
                            this.cm.useProvider("firebase");
                            let workspace = (await Storage.get({key: 'condution_workspace'})).value;
                            await view.cm.start(workspace);
                            this.setState({authMode: "workspace", workspace});
                            break;
                        }
                        // If there is nothing, well, set the authmode as "none"
                    default:
                        if (uri[1] !== "workspaces")
                            this.setState({authMode: "none", uid:undefined});
                        else {
                            this.cm.useProvider("firebase");
                            Storage.set({key: 'condution_stotype', value: "workspace"});
                            Storage.set({key: 'condution_workspace', value: uri[2]});
                            await view.cm.start(uri[2]);
                            this.setState({authMode: "workspace", workspace:uri[2]});
                        }
                        break;
                }
            }).bind(this));

    }

    // authDispatch handles the dispatching of auth operations. {login, create, and logout}
    authDispatch(mode) {
        console.log("Auth dispatch requested for", mode.operation, mode.service)

        // TODO: that's a state machine! @zbuster05
        let uid;
        let name;
        switch (mode.operation) {
            // operation mode login
            case "login":
                // shift the engine into whatever mode we just logged into
                //Engine.use(mode.service, this.gruntman.requestRefresh);
                //this.cm.useProvider(mode.service);
                // write the login state into cookies
                Storage.set({key: 'condution_stotype', value: mode.service});
                // get the UID

                //switch (mode.service) {
                    // if its firebase
                    //case "firebase":
                        // set the UID as the UID
                        //uid = this.props.cm.auth.currentUser
                        //name = firebase.auth().currentUser.displayName
                        //break;
                    //default:
                        // set the UID as "hard-storage-user"
                        //uid = "hard-storage-user";
                        //name = ""
                        //break;
                //}
                // load the authenicated state and supply the UID
                this.cm.start().then((_) => {
                    this.setState({authMode: mode.service});
                });
                break;
            // operation mode create
            case "create":
                // setthe engine as whatever service
                //Engine.use(mode.service, this.gruntman.requestRefresh);
                this.cm.useProvider(mode.service);
                Storage.set({key: 'condution_stotype', value: mode.service});
//                switch (mode.service) {
                    //// if its firebase
                    //case "firebase":
                        //// set the UID as the UID
                        ////uid = firebase.auth().currentUser.uid;
                        ////name = firebase.auth().currentUser.displayName
                        //break;
                    //default:
                        //// set the UID as "hard-storage-user"
                        ////uid = "hard-storage-user";
                        ////name = ""
                        //break;
                //}
                this.cm.start().then((_) => {
                    this.setState({authMode: mode.service, uid, displayName: name});
                });

                // Here
                //this.setState({authMode: "onboarding", uid, displayName: name});
                //Engine.db.onBoard(uid, Intl.DateTimeFormat().resolvedOptions().timeZone, this.gruntman.localizations.getLanguage()==="en" ? "there": "", this.gruntman.localizations.onboarding_content).then(e=>this.setState({authMode: mode.service, uid, displayName: name}));
                // TODO: be done with onboarding
                // Set the storage type and write it into cookies
                // load the authenicated state and TODO supply the UID
                break;
            case "logout":
                GloballySelfDestruct();
                // Set the storage type to nada and write it into cookies
                Storage.set({key: 'condution_stotype', value: "none"});
                // Sign out if we are signed in
                //firebase.auth().signOut();
                Hookifier.SelfDestruct();
                if (this.cm.auth)
                    this.cm.auth.deauthenticate();
                // Load the auth view
                this.setState({authMode: "none", name: ""});
                break;
            case "auth":
                Storage.set({key: 'condution_stotype', value: "none"});
                this.setState({authMode: "none", name: ""});
                break;
            case "form":
                Storage.set({key: 'condution_stotype', value: "none"});
                this.setState({authMode: "form", name: ""});
                break;

        }
    }

    render() {
        // Check for onboarding here
        // then continue
        // Which authmode?
        return (
            <>
                {(()=>{
                switch (this.state.authMode) {
                    // if we are at the first-paint load mode, do this:
                    case "loader":
                        return <Loader />
                    // if we did not authenticate yet, load the auth view:
                    case "none":
                        return <Auth dispatch={this.authDispatch} localizations={this.state.localizations} cm={this.cm} />;
                    case "form":
                        return <Auth dispatch={this.authDispatch} localizations={this.state.localizations} cm={this.cm} startOnForm={true} />;
                        //return <Auth gruntman={this.gruntman} dispatch={this.authDispatch} localizations={this.state.localizations} startOnForm={true} engine={Engine}/>;
                    // if we did auth, load it up and get the party going
                    case "firebase":
                    case "json":
                    case "portjson":
			return <ShortcutProvider> <Home cm={this.cm} dispatch={this.authDispatch} displayName={this.state.displayName} localizations={this.state.localizations} authType={this.state.authMode}/> </ShortcutProvider>;
         //email={firebase.auth().currentUser.email}
                    case "workspace":
			return <ShortcutProvider> <Home cm={this.cm} dispatch={this.authDispatch} displayName={this.state.displayName} localizations={this.state.localizations} authType={this.state.authMode} workspace={this.state.workspace}/> </ShortcutProvider>;
                        //return <Home engine={Engine} uid={this.state.uid} dispatch={this.authDispatch} gruntman={this.gruntman} displayName={this.state.displayName} localizations={this.state.localizations} authType={this.state.authMode} workspace={this.state.workspace}/>;
                    case "json":
                        //return <Home engine={Engine} uid={this.state.uid} dispatch={this.authDispatch} gruntman={this.gruntman} displayName={this.state.displayName} localizations={this.state.localizations} authType={this.state.authMode}/>;
                    // wut esta this auth mode? load the loader with an error
                    case "onboarding":
                        return <Onboarding  localizations={this.state.localizations}/>
                    case "FI":
                        return <FirstInteraction localizations={this.state.localizations} dispatch={this.authDispatch}/>
                    default:
                        console.error(`CentralDispatchError: Wut Esta ${this.state.authMode}`);
                        return <Loader isError={true} error={this.state.authMode}/>
                }
                })()}
                </>
        )
    }
}

export default withShortcut(App);
//class App extends Component {
//render() {
//return (
//<IonApp>
//<Home />
//</IonApp>
//);
//}
//}

/*export default App;*/
