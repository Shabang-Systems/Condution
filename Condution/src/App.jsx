import React, { Component } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonMenu } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';

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

import './themefiles/condutiontheme-default.css';
import './themefiles/condutiontheme-default-dark.css';
import './themefiles/condutiontheme-default-light.css';

import './static/fa/scripts/all.min.css';

/* Theme variables */
import './theme/variables.css';

import { Plugins } from '@capacitor/core';
import $ from "jquery";

import Engine from './backend/CondutionEngine';

import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

import Auth from './pages/Auth';

const { Storage } = Plugins;

const autoBind = require('auto-bind/react');

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {authMode: "loader", uid: ""};
        if (window.matchMedia('(prefers-color-scheme:dark)').matches) {
            $("body").removeClass();
            $("body").addClass("condutiontheme-default-dark");
        }
        else {
            $("body").removeClass();
            $("body").addClass("condutiontheme-default-light");
        }

        autoBind(this);
    }

    componentDidMount() {
        let view = this;
        Engine.start({firebase}, "firebase", "json");


        // Handling cached dispatch
        Storage.get({key: 'condution_stotype'}).then((dbType) => {
            switch (dbType.value) {
                case "firebase":
                    firebase.auth().onAuthStateChanged(function(user) {
                        Engine.use("firebase");
                        view.setState({authMode: "firebase", uid: user.uid});
                    })
                    break;
                case "json":
                    Engine.use("json");
                    this.setState({authMode: "json", uid:"hard-storage-user"});
                    break;
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
        switch (this.state.authMode) {
            case "loader":
                return <div>TODO Quick and dirty loader</div>
            case "none":
                return <Auth dispatch={this.authDispatch}/>;
            case "firebase":
                return <Home engine={Engine} uid={this.state.uid} dispatch={this.authDispatch}/>;
            case "json":
                return <Home engine={Engine} uid={this.state.uid} dispatch={this.authDispatch}/>;
            default:
                console.error(`CentralDispatchError: Wut Esta ${this.state.authMode}`);
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
