import React, { Component } from 'react';
import { Plugins } from '@capacitor/core';
import $ from "jquery";

import Engine from './backend/CondutionEngine';
import Main from './Pages/Main';

import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

import Auth from './Pages/Auth';
import './App.css';

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
                return <Main engine={Engine} uid={this.state.uid}/>;
            case "json":
                return <Main engine={Engine} uid={this.state.uid}/>;
            default:
                console.error(`CentralDispatchError: Wut Esta ${this.state.authMode}`);
        }
    }
}

export default App;
