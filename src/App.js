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

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {authMode: "none"};
        if (window.matchMedia('(prefers-color-scheme:dark)').matches) {
            $("body").removeClass();
            $("body").addClass("condutiontheme-default-dark");
        }
        else {
            $("body").removeClass();
            $("body").addClass("condutiontheme-default-light");
        }
    }

    componentDidMount() {
        this.engine = Engine.start({firebase}, "firebase", "json");
        Storage.get({key: 'condution_stotype'}).then((dbType) => {
            this.setState({authMode: dbType.value ? dbType.value : "none"});
        })


    }

    centralDispatch(mode) {
        console.log(`Dispatching ${mode.operation}`);
    }

    render() {
        // Check for onboarding here
        // then continue
        switch (this.state.authMode) {
            case "none":
                return (
                    <Auth dispatch={this.centralDispatch} engine={this.engine}/>
                );

            case "firebase":
                // now, verify firebase auth state
                return (
                    <div>
                        baaah
                    </div>
                );

            case "json":
                return (
                    <div>
                        sooh
                    </div>
                );

            default:
                console.log(this.state.authMode);
        }
    }
}

export default App;
