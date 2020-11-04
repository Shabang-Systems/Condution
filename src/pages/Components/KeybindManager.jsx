import React, { Component } from 'react';
import Mousetrap from 'mousetrap';
import { IonReactRouter, IonReactHashRouter } from '@ionic/react-router';
import { Redirect, Route, Link, Switch } from 'react-router-dom';
import { createBrowserHistory, createHashHistory } from 'history';
import { withRouter } from "react-router";


const autoBind = require('auto-bind/react');


class Keybinds extends Component {
    constructor(props) {
        super(props);
	//this.stuffur = this.stuffur.bind(this);
        autoBind(this);

        this.state = {
	    test: "yy"

	}

	//this.keybindRef = React.createRef()

    }

    // define the bindings! 2d array of keybind and function 
    bindings = [
	["command+shift+j", () => {
	    console.log(this); 
	    this.props.history.push("/upcoming"); 
	    this.props.paginate("upcoming"); 
	}] // nav to upcoming keybind!
    ]


    // loop through and bind all our things!
    componentDidMount() {
	console.log(this)
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

export default withRouter(Keybinds);

