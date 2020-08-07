import React, { Component } from 'react';
import { Plugins } from '@capacitor/core';
import $ from "jquery";

import Engine from './backend/CondutionEngine';

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

        this.state = {authMode: "loader"};
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
        this.engine = Engine.start({firebase}, "firebase", "json");
        Storage.get({key: 'condution_stotype'}).then((dbType) => {
            this.setState({authMode: dbType.value ? dbType.value : "none"});
        })
    }

    centralDispatch(mode) {
        switch (mode.operation) {
            case "login":
                this.engine.use(mode.service);
                Storage.set({key: 'condution_stotype', value: mode.service});
                this.setState({authMode: mode.service});
                break;
            case "create":
                this.engine.use(mode.service);
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
                return (
                    <Auth dispatch={this.centralDispatch} engine={this.engine}/>
                );

            case "firebase":
                // now, verify firebase auth state
                return (
                    <div>
                        I am firebase login
                    </div>
                );

            case "json":
                return (
                    <div>
                        I am JSON login
                    </div>
                );

            default:
                console.log(this.state.authMode);
        }
    }
}

export default App;
