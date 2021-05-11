import Head from 'next/head';

import React, { Component } from 'react';

import '@ionic/react/css/core.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import LocalizedStrings from 'react-localization';

import { GloballySelfDestruct } from "../backend/src/CondutionEngine.ts";

import Context from "../utils/ContextWizard";

const autoBind = require('auto-bind');

class App extends Component {
    constructor(props) {
        super(props);
        let localizations = new LocalizedStrings({
            en: require("./static/I18n/main.json"),
            zh: require("./static/I18n/zh-CN.json"),
            de: require("./static/I18n/de-DE.json"),
        });

        this.cm = Context;

        // TODO TODO remove this
        //localizations.setLanguage("zh");

        // We start with setting our state. We don't know our user's UID (duh)
        this.state = {authMode: "loader", uid: "", displayName: "", localizations, workspace: null};

        if (typeof window !== "undefined") {
            // We also set the theme based on the user's media query
            if (window.matchMedia('(prefers-color-scheme:dark)').matces) {
                $("body").removeClass();
                $("body").addClass("condutiontheme-default-dark");
            }
            else {
                $("body").removeClass();
                $("body").addClass("condutiontheme-default-light");
            }

            // Make ourselves a nice gruntman
            //this.gruntman = new Gruntman(Engine);
            //this.gruntman.localizations = localizations;
            // And AutoBind any and all functions

        }
        autoBind(this);
    }

    async componentDidMount() {
        console.log('%cSTOP! ', 'background: #fff0f0; color: #434d5f; font-size: 80px');
        console.log('%cClose this panel now.', "background: #fff0f0;color: transparent; background-image: linear-gradient(to left, violet, indigo, blue, green, yellow, orange, red);   -webkit-background-clip: text; font-size: 40px; ;");
        console.log('%c19/10 chance you are either a terribly smart person and should work with us (hliu@shabang.cf) or are being taken advantanged of by a very terrible person. ', 'background: #fff0f0; color: #434d5f; font-size: 20px');
        console.log('%cPlease help us to help you... Don\'t self XSS yourself.', 'background: #fff0f0; color: #434d5f; font-size: 15px');


        // This IS in fact the view
        let view = this;

        // Light the fire, kick the tires an instance 
        // of {firebase}, and initializing the firebase 
        // and json engines
        //await Engine.start({firebase}, "firebase", "json");

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
                    // Shift the engine into json mode
                    this.cm.useProvider("json");
                    // Load the authenticated state, set the authmode as "json" and supply "hard-storage-user" as UID
                    this.setState({authMode: "json", uid:"hard-storage-user"});
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
        console.log(mode.operation)
        console.log(mode.service)
        console.log("do not delete these console logs above!!!") // TODO: what's actually happining here? why is account creation dud?

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
                            // if we did auth, load it up and get the party going
                        case "firebase":
                            return <Home cm={this.cm} dispatch={this.authDispatch} displayName={this.state.displayName} localizations={this.state.localizations} authType={this.state.authMode}/>;
                            //email={firebase.auth().currentUser.email}
                        case "workspace":
                            return <Home cm={this.cm} dispatch={this.authDispatch} displayName={this.state.displayName} localizations={this.state.localizations} authType={this.state.authMode} workspace={this.state.workspace}/>;
                        case "json":
                            //return <Home engine={Engine} uid={this.state.uid} dispatch={this.authDispatch} gruntman={this.gruntman} displayName={this.state.displayName} localizations={this.state.localizations} authType={this.state.authMode}/>;
                            // wut esta this auth mode? load the loader with an error
                        case "FI":
                            return <FirstInteraction localizations={this.state.localizations} dispatch={this.authDispatch}/>
                        default:
                            console.error(`CentralDispatchError: Wut Esta ${this.state.authMode}`);
                            return <Loader isError={true} error={this.state.authMode}/>
                    }
                })}        
            </>
        )
    }
}

//

//function App({ Component, pageProps }) {
//return (
//<>
//<Head>
//<meta
//name="viewport"
//content="width=device-width, initial-scale=1.0, viewport-fit=cover"
//></meta>
//<script src="https://unpkg.com/ionicons@5.2.3/dist/ionicons.js"></script>
//</Head>
//<Component {...pageProps} />
//</>
//);
//}

export default App;

//export default App;
