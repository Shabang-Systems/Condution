import React, { Component } from 'react';
import { Plugins } from '@capacitor/core';
import $ from "jquery";

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
        Storage.get({key: 'condution_stotype'}).then((dbType) => {
            this.setState({authMode: dbType.value ? dbType.value : "none"});
        })


    }
    /*if (window.matchMedia('(prefers-color-scheme:dark)').matches) {*/
        //currentTheme = "condutiontheme-default-dark";
        //$("body").removeClass();
        //$("body").addClass(currentTheme);
    //}
    //else {
        //currentTheme = "condutiontheme-default-light";
        //$("body").removeClass();
        //$("body").addClass(currentTheme);
    /*}*/



    render() {
        // Check for onboarding here
        // then continue
        switch (this.state.authMode) {
            case "none":
                return (
                    <Auth />
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
