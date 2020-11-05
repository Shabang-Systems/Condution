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
	    sidebar_list: [],
	    prop_store: ""
	}

	//this.keybindRef = React.createRef()

    }

    // define the bindings! 2d array of keybind and function 
    bindings = [
	["alt+1", ()=>{this.switch_to_upcoming(this)}], // nav to upcoming keybind
	["alt+3", ()=>{this.perspective_switcher(this, 0)}], // nav to perspective 1 keybind
	["alt+4", ()=>{this.perspective_switcher(this, 1)}] // nav to perspective 2 keybind
    ]

    switch_to_upcoming(that){
	console.log(that); 
	that.props.history.push("/upcoming"); 
	that.props.paginate("upcoming"); 

    }


    perspective_switcher(that, num){
	//const pid = that.props.perspectives[num].id
	//console.log(that.props.perspectives[num].id)
	//that.props.history.push(`/perspectives/${pid}`);
	//that.props.paginate("perspectives", pid);
	

	console.log(this.state.sidebar_list)

    }

    componentDidUpdate(){
	console.log(this.props)
	if (this.state.prop_store != this.props) {
	    this.setState({sidebar_list: [this.props.perspectives.map(o => ['perspectives', o.id])], prop_store: this.props})
	}
    }

    // loop through and bind all our things!
    componentDidMount() {
	this.setState({prop_store: this.props})

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

