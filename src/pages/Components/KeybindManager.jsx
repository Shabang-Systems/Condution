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
        autoBind(this);

        this.state = {
	    sidebar_list: [],
	    prop_store: ""
	}
    }

    // define the bindings! 2d array of keybind and function 
    bindings = [
	["alt+1", ()=>{this.sidebar_switcher(this, 0)}], // nav to upcoming keybind
	["alt+2", ()=>{this.sidebar_switcher(this, 1)}], // nav to completed keybind
	["alt+3", ()=>{this.sidebar_switcher(this, 2)}], // nav to item 3 keybind
	["alt+4", ()=>{this.sidebar_switcher(this, 3)}], // nav to item 4 keybind
	["alt+5", ()=>{this.sidebar_switcher(this, 4)}], // nav to item 5 keybind
	["alt+6", ()=>{this.sidebar_switcher(this, 5)}], // nav to item 6 keybind
	["alt+7", ()=>{this.sidebar_switcher(this, 6)}], // nav to item 7 keybind
	["alt+8", ()=>{this.sidebar_switcher(this, 7)}], // nav to item 8 keybind
	["alt+9", ()=>{this.sidebar_switcher(this, 'l')}], // nav to last item keybind
    ]

    sidebar_switcher(that, num){
	// set our location to index in sidebar, unless you pass it 'l' which switches to the last item 
	const loca = (num == 'l')? this.state.sidebar_list[this.state.sidebar_list.length-1] : this.state.sidebar_list[num];
	that.props.history.push(`/${loca[0]}/${loca[1]}`) // push to the history
	that.props.paginate(...loca); // paginate-ify it!
    }

    componentDidUpdate(){
	// update the props
	if (this.state.prop_store != this.props) { // if the props have changed, 
	    this.setState({
		sidebar_list: [
		    ['upcoming', ''], // set the first item to upcoming 
		    // (i could do + but i think thats less efficent 
		    ['completed', ''], // set the second item to completed
		    ...this.props.perspectives.map(o => ['perspectives', o.id]), // map the perspectives
		    ...this.props.projects.map(o => ['projects', o.id]) // and the projects 
		], 
		prop_store: this.props //  and update the props 
	    })
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


