import React, { Component } from 'react';
import Mousetrap from 'mousetrap';
import { IonReactRouter, IonReactHashRouter } from '@ionic/react-router';
import { Redirect, Route, Link, Switch } from 'react-router-dom';
import { createBrowserHistory, createHashHistory } from 'history';
import { withRouter } from "react-router";


const autoBind = require('auto-bind/react');



// HOW SHOULD THE KEYBINDS WORK?
//
// Prefix? 
// Switching sidebar: cmd -1,2,3?
//
//
//
//
//







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
	["command+shift+j", ()=>{this.switch_to_upcoming(this)}], // nav to upcoming keybind!
	["command+alt+3", ()=>{this.test(this, 0)}], // nav to upcoming keybind!
	["command+alt+4", ()=>{this.test(this, 1)}] // nav to upcoming keybind!
    ]

    switch_to_upcoming(that){
	console.log(that); 
	that.props.history.push("/upcoming"); 
	that.props.paginate("upcoming"); 

    }


    test(that, num){
	const pid = that.props.perspectives[num].id
	//console.log(that.props.perspectives)
	console.log(that.props.perspectives[num].id)
	that.props.history.push(`/perspectives/${pid}/do`);
	that.props.paginate("perspectives", pid);


    }


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

