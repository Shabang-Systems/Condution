import React, { Component } from 'react';
import Mousetrap from 'mousetrap';
import { IonReactRouter, IonReactHashRouter } from '@ionic/react-router';
import { Redirect, Route, Link, Switch } from 'react-router-dom';
import { createBrowserHistory, createHashHistory } from 'history';
import { withRouter } from "react-router";
import { IonModal, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSearchbar, IonFooter } from '@ionic/react';
import './QuickSwitcher.css'

const autoBind = require('auto-bind/react');



class QuickSwitcher extends Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
	    searchRef: ''
	}
	this.searcher = React.createRef();
    }

    componentDidMount() {
	//const timer = setTimeout(() => {
	//    console.log(this.searcher.current)
	//}, 1);
    }


    //focusRef() {
    //    const timer = setTimeout(() => {
    //        if (this.searcher.current) {
    //            const el = this.searcher.current.getInputElement()
    //            el.focus(); 
    //            console.log(this.searcher, "tmeo")
    //        } else {console.log("no good")}
    //    }, 1);

    //}

    //async focusRef() {
    //    console.log("yes")
    //    if (this.searcher.current != null) {
    //        console.log(this.searcher.current.getInputElement())
    //    }


    //}
    //

    focusRef() {
	setInterval(async () => {
	    //console.log(this.searcher)
	    if (this.searcher.current != null) {
		const el = await this.searcher.current
		console.log(el)
		el.setFocus()
	    }
	}, 1000)
    }


    render() { 
	return (
	    <IonModal 
		//ref={this.props.reference} 
		isOpen={this.props.qs_show} 
		ionModalDidPresent={this.focusRef()}
		animated={false}
		cssClass='qs_modal'
		onDidDismiss={this.props.dismiss}
	    >
		<IonSearchbar 
		    autoFocus={true}
		    ref={this.searcher} 
		    //ref={input => input && input.getInputElement.focus()}
		    className='search-bar'
		/>

	    </IonModal>
	) 
    }

}

export default QuickSwitcher;



