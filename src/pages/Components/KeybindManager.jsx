import React, { Component } from 'react';
import Mousetrap from 'mousetrap';
import bindGlobal from 'mousetrap-global-bind';
import { IonReactRouter, IonReactHashRouter } from '@ionic/react-router';
import { Redirect, Route, Link, Switch } from 'react-router-dom';
import { createBrowserHistory, createHashHistory } from 'history';
import { withRouter } from "react-router";
import QuickSwitcher from './QuickSwitcher'

const autoBind = require('auto-bind/react');


class Keybinds extends Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
	    sidebar_list: [], // what's in the sidebar? 
	    sidebar_index: 0, // how far down the sidebar are we? 
	    prop_store: '', // store props so we can check if they have changed 
	    qs_show: false // is the quick switcher shown? 
	}
    }

    // define the bindings! 2d array of keybind and function 
    // TODO TODO: for some reason binding works now, so replace that later? 
    // TODO: expand these keybinds. ie, n/p and up/down arrows
    bindings = [
	["alt+1", ()=>{this.sidebar_switcher(this, 0)}], // nav to upcoming keybind
	["alt+2", ()=>{this.sidebar_switcher(this, 1)}], // nav to completed keybind
	["alt+3", ()=>{this.sidebar_switcher(this, 2)}], // nav to item 3 keybind
	["alt+4", ()=>{this.sidebar_switcher(this, 3)}], // nav to item 4 keybind
	["alt+5", ()=>{this.sidebar_switcher(this, 4)}], // nav to item 5 keybind
	["alt+6", ()=>{this.sidebar_switcher(this, 5)}], // nav to item 6 keybind
	["alt+7", ()=>{this.sidebar_switcher(this, 6)}], // nav to item 7 keybind
	["alt+8", ()=>{this.sidebar_switcher(this, 7)}], // nav to item 8 keybind
	["alt+9", ()=>{this.sidebar_switcher(this, 8)}], // nav to item 9 keybind
	["alt+0", ()=>{this.sidebar_switcher(this, this.state.sidebar_list.length-1)}], // nav to last item keybind
	["alt+j", ()=>{this.sidebar_incrimentor(this, 1)}], // nav down keybind 
	["alt+k", ()=>{this.sidebar_incrimentor(this, -1)}], // nav up keybind 
	["mod+shift+p", ()=>{this.props.onPaletteActivate()}], // palette keybind
	//["mod+enter", ()=>{this.focusElement(this.props.abtib)}], // focus the FAB
    ]

    globalBindings = [
	["mod+k", ()=>{this.props.activateQuickSwitcher(false)}], // toggle quick swithcher keybind 
    ]

    //TODO: this doesnt work with clicking or like anything else but eh

    sidebar_switcher(that, num){
	const loca = this.state.sidebar_list[num]; // set our location to index in sidebar
	that.props.history.push(`/${loca[0]}/${loca[1]}`) // push to the history
	that.props.paginate(...loca); // paginate-ify it!
	this.setState({sidebar_index: num}) // update the sidebar index 
    }

    sidebar_incrimentor(that, num) {
	const next_loca = this.state.sidebar_list[this.state.sidebar_index+num] // store the variable -- we can delet this. 
	if (next_loca) { // if its defined, 
	    this.sidebar_switcher(that, this.state.sidebar_index+num) // go there
	    // if it's not defined and it's at the end, 
	} else if (this.state.sidebar_index == this.state.sidebar_list.length-1) {
	    this.sidebar_switcher(that, 0) // wrap around and go back to the beginning 
	} else { // if it's not defined and not at the end, then it must be at the beginning,
	    this.sidebar_switcher(that, this.state.sidebar_list.length-1) // so go to the end 
	}
    }

    setSidebarIndex(item) { // manage the quickswitcher sidebar index changing 
	let idx
	this.state.sidebar_list.forEach((sidebarItem, i) => { // get passed an item, find the item 
	    if (this.arraysAreIdentical(sidebarItem, item)) {
		idx = i
	    }
	})
	this.setState({sidebar_index: idx})
    }

    arraysAreIdentical(arr1, arr2){ // helper function cus js bad 
	for (let i = 0, len = arr1.length; i < len; i++){
	    if (arr1[i] !== arr2[i]){
		return false;
	    }
	}
	return true; 
    }


    manageQs(that) {
	this.setState({qs_show: !this.state.qs_show}); 
    }

    focusElement(ref) { // another helper function 
	if (ref) {
	    ref.current.focus()
	}
    }

    componentDidUpdate(){
	//TODO: safe-proof(?) this
	// update the props
	if (this.state.prop_store != this.props) { // if the props have changed, 
	    this.setState({
		sidebar_list: [
		    ['upcoming', ''], // set the first item to upcoming 
		    // (i could do + but i think thats less efficent 
		    ['completed', ''], // set the second item to completed
		    ['calendar', ''], // set the third item to calendar
		    ...this.props.perspectives.map(o => ['perspectives', o.id]), // map the perspectives
		    ...this.props.projects.map(o => ['projects', o.id]) // and the projects 
		], 
		prop_store: this.props //  and update the props 
	    })
	}

	// TODO: get the current url and set the index that way 
	//if (!this.state.sidebar_index) {
	//    this.setState({sidebar_index: side

	//}
    }

    // loop through and bind all our things!
    componentDidMount() {
	this.setState({prop_store: this.props})

        this.bindings.map(combo => {
		Mousetrap.bind(...combo)
        })

	this.globalBindings.map(combo => {
		Mousetrap.bindGlobal(...combo)
	})
    }

    // loop through and unbind all our things!
    componentWillUnmount() { 
        this.bindings.map(combo => {
            Mousetrap.unbind(...combo)
        })
    }

    render() { 
	return (
	    <QuickSwitcher 
		//qs_show={this.state.qs_show} 
		qs_show={this.props.qs_show} 
		dismiss={this.props.dismissQs}
		items={[this.props.perspectives]}
		paginate={this.props.paginate}
		updateIdx={this.setSidebarIndex}
		localizations={this.props.localizations}
		cm={this.props.cm}

		launchedWithButton={this.props.qs_launched_with_button}

		//engine={this.props.engine} 
	    //    uid={this.props.uid} 
	    //    gruntman={this.props.gruntman} 


	    /> 
	)
    }

}

export default withRouter(Keybinds);
