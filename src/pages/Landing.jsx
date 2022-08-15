import React, { Component } from 'react';
import { Plugins } from '@capacitor/core';

import Particles from 'react-particles-js';


import './Landing.css';


import '../themefiles/condutiontheme-default.css';
import '../themefiles/condutiontheme-default-dark.css';
import '../themefiles/condutiontheme-default-light.css';
import '../themefiles/condutiontheme-default-adapter.css';



const autoBind = require('auto-bind/react');


const { Storage } = Plugins; // Unbelievably deprecated

class Landing extends Component {
    constructor(props) {
        super(props);

        autoBind(this);
    }
    render() {
        return (
            <div id="landing-content-wrapper">
                <div id="landing-content">
                    Baam!
                </div>
                <div className="particles">&nbsp;</div>
            </div>
        );
    }
}

export default Landing;
