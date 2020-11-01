import React, { Component } from 'react';
import Mousetrap from 'mousetrap';
const autoBind = require('auto-bind/react');

class Keybinds extends Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {}
    }

    // define the bindings! 2d array of keybind and function 
    bindings = [
        ["command+shift+j", this.stuffur] // stufferify it!
    ]

    stuffur() { // stuficatin function 
        console.log("stuffer")
    }

    // loop through and bind all our things!
    componentDidMount() {
        this.bindings.map(combo => {
            Mousetrap.bind(...combo)
        })
    }

    // loop through and unbind all our things!
    componentWillUnmount() { 
        this.bindings.map(combo => {
            Mousetrap.unbind(...combo)
        })
    }

    render() { return null }

}

export default Keybinds;

