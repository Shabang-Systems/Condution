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
import { Plugins } from '@capacitor/core';
import $ from "jquery";

/* Our Lovley Core Engine */
import Engine from './backend/CondutionEngine';
import Gruntman from './gruntman';

/* Firebase */
import * as firebase from "firebase/app";

/* Auth and store modules */
import "firebase/auth";
import "firebase/firestore";

/* Views that we need */
import Auth from './pages/Auth';
import Loader from './pages/Loader';
import Home from './pages/Home';

/* Localization Toolkit */
import LocalizedStrings from 'react-localization';

/* AutoBind */
const autoBind = require('auto-bind/react');


/* Storage Plugins */
const { Storage } = Plugins;


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


class App extends Component {
    constructor(props) {
        super(props);

        let localizations = new LocalizedStrings({
            en: require("./static/I18n/en-US.json"),
            zh: require("./static/I18n/zh-CN.json"),
            de: require("./static/I18n/de-DE.json"),
        });

        // TODO TODO remove this
        //localizations.setLanguage("zh");

        // We start with setting our state. We don't know our user's UID (duh)
        this.state = {authMode: "loader", uid: "", displayName: "", localizations};
        
        // We also set the theme based on the user's media query
        if (window.matchMedia('(prefers-color-scheme:dark)').matches) {
            $("body").removeClass();
            $("body").addClass("condutiontheme-default-dark");
        }
        else {
            $("body").removeClass();
            $("body").addClass("condutiontheme-default-light");
        }

        // Make ourselves a nice gruntman
        this.gruntman = new Gruntman(Engine);
        this.gruntman.localizations = localizations;
        // And AutoBind any and all functions
        autoBind(this);
    }

    async componentDidMount() {
        // This IS in fact the view
        let view = this;

        // Light the fire, kick the tires an instance 
        // of {firebase}, and initializing the firebase 
        // and json engines
        await Engine.start({firebase}, "firebase", "json");


        // ==Handling cached dispatch==
        // So, do we have a condution_stotype? 
        Storage.get({key: 'condution_stotype'}).then((dbType) => {
            switch (dbType.value) {
                // If its firebase 
                case "firebase":
                    // Check if we actually has a user
                    firebase.auth().onAuthStateChanged(function(user) {
                        if (!user)
                            view.authDispatch({operation:"logout"});
                        // If we have one, shift the engine into firebase mode
                        else {
                            Engine.use("firebase", view.gruntman.requestRefresh);
                            // Load the authenticated state, set authmode as "firebase" and supply the UID
                            view.setState({authMode: "firebase", uid: user.uid, displayName: user.displayName});
                        }
                    })
                    break;
                // If its json
                case "json":
                    // Shift the engine into json mode
                    Engine.use("json", view.gruntman.requestRefresh);
                    // Load the authenticated state, set the authmode as "json" and supply "hard-storage-user" as UID
                    this.setState({authMode: "json", uid:"hard-storage-user"});
                    break;
                // If there is nothing, well, set the authmode as "none"
                default:
                    this.setState({authMode: "none", uid:undefined});
                    break;
            }
        });
    }

    // authDispatch handles the dispatching of auth operations. {login, create, and logout}
    authDispatch(mode) {
        // TODO: that's a state machine! @zbuster05
        let uid;
        let name;
        switch (mode.operation) {
            // operation mode login
            case "login":
                // shift the engine into whatever mode we just logged into
                Engine.use(mode.service, this.gruntman.requestRefresh);
                // write the login state into cookies
                Storage.set({key: 'condution_stotype', value: mode.service});
                // get the UID

                switch (mode.service) {
                    // if its firebase
                    case "firebase":
                        // set the UID as the UID
                        uid = firebase.auth().currentUser.uid;
                        name = firebase.auth().currentUser.displayName
                        break;
                    default:
                        // set the UID as "hard-storage-user"
                        uid = "hard-storage-user";
                        name = ""
                        break;
                }
                // load the authenicated state and supply the UID
                this.setState({authMode: mode.service, uid, displayName: name});
                break;
            // operation mode create
            case "create":
                // setthe engine as whatever service
                Engine.use(mode.service, this.gruntman.requestRefresh);
                Storage.set({key: 'condution_stotype', value: mode.service});
                switch (mode.service) {
                    // if its firebase
                    case "firebase":
                        // set the UID as the UID
                        uid = firebase.auth().currentUser.uid;
                        name = firebase.auth().currentUser.displayName
                        break;
                    default:
                        // set the UID as "hard-storage-user"
                        uid = "hard-storage-user";
                        name = ""
                        break;
                }

                // TODO: do onboarding
                // Here
                console.log("I would be onboarding, but... alas.");
                // TODO: be done with onboarding
                // Set the storage type and write it into cookies
                // load the authenicated state and TODO supply the UID
                this.setState({authMode: mode.service, uid, displayName: name});
                break;
            case "logout":
                // Set the storage type to nada and write it into cookies
                Storage.set({key: 'condution_stotype', value: "none"});
                // Sign out if we are signed in
                firebase.auth().signOut();
                // Load the auth view
                this.setState({authMode: "none", name: ""});
                break;
        }
    }

    render() {
        // Check for onboarding here
        // then continue
        // Which authmode?
        switch (this.state.authMode) {
            // if we are at the first-paint load mode, do this:
            case "loader":
                return <Loader />
            // if we did not authenticate yet, load the auth view:
            case "none":
                return <Auth dispatch={this.authDispatch} localizations={this.state.localizations}/>;
            // if we did auth, load it up and get the party going
            case "firebase":
            case "json":
                return <Home engine={Engine} uid={this.state.uid} dispatch={this.authDispatch} gruntman={this.gruntman} displayName={this.state.displayName} localizations={this.state.localizations}/>;
            // wut esta this auth mode? load the loader with an error
            default:
                console.error(`CentralDispatchError: Wut Esta ${this.state.authMode}`);
                return <Loader isError={true} error={this.state.authMode}/>
        }
    }
}

export default App;
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
