/* Global Imports */
import React, { Component } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonMenu } from '@ionic/react';
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
import './themefiles/condutiontheme-default.css';
import './themefiles/condutiontheme-default-dark.css';
import './themefiles/condutiontheme-default-light.css';

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


class App extends Component {
    constructor(props) {
        super(props);

        // We start with setting our state. We don't know our user's UID (duh)
        this.state = {authMode: "loader", uid: ""};
        
        // We also set the theme based on the user's media query
        if (window.matchMedia('(prefers-color-scheme:dark)').matches) {
            $("body").removeClass();
            $("body").addClass("condutiontheme-default-dark");
        }
        else {
            $("body").removeClass();
            $("body").addClass("condutiontheme-default-light");
        }
        
        // And AutoBind any and all functions
        autoBind(this);
    }

    componentDidMount() {
        // This IS in fact the view
        let view = this;

        // Light the fire, kick the tires an instance 
        // of {firebase}, and initializing the firebase 
        // and json engines
        Engine.start({firebase}, "firebase", "json");


        // ==Handling cached dispatch==
        // So, do we have a condution_stotype? 
        Storage.get({key: 'condution_stotype'}).then((dbType) => {
            switch (dbType.value) {
                // If its firebase 
                case "firebase":
                    // Check if we actually has a user
                    firebase.auth().onAuthStateChanged(function(user) {
                        // If we have one, shift the engine into firebase mode
                        Engine.use("firebase");
                        // Set the authmode as "firebase" and supply the UID
                        view.setState({authMode: "firebase", uid: user.uid});
                    })
                    break;
                // If its json
                case "json":
                    Engine.use("json");
                    this.setState({authMode: "json", uid:"hard-storage-user"});
                    break;
                // If there is nothing, well, set the authmode as "none"
                default:
                    this.setState({authMode: "none", uid:undefined});
                    break;
            }
        });
    }

    authDispatch(mode) {
        switch (mode.operation) {
            case "login":
                Engine.use(mode.service);
                Storage.set({key: 'condution_stotype', value: mode.service});
                let uid;
                switch (mode.service) {
                    case "firebase":
                        uid = firebase.auth().currentUser.uid;
                        break;
                    default:
                        uid = "hard-storage-user";
                        break;
                }
                this.setState({authMode: mode.service, uid});
                break;
            case "create":
                Engine.use(mode.service);
                // TODO: do onboarding
                // Here
                // TODO: be done with onboarding
                Storage.set({key: 'condution_stotype', value: mode.service});
                this.setState({authMode: mode.service});
                break;
            case "logout":
                Storage.set({key: 'condution_stotype', value: "none"});
                firebase.auth().signOut();
                this.setState({authMode: "none"});
                break;
        }
    }

    render() {
        // Check for onboarding here
        // then continue
        let grunt = new Gruntman(Engine);
        switch (this.state.authMode) {
            case "loader":
                return <Loader />
            case "none":
                return <Auth dispatch={this.authDispatch}/>;
            case "firebase":
                return <Home engine={Engine} uid={this.state.uid} dispatch={this.authDispatch} gruntman={grunt}/>;
            case "json":
                return <Home engine={Engine} uid={this.state.uid} dispatch={this.authDispatch} gruntman={grunt}/>;
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
