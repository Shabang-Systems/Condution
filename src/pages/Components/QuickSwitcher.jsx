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

        this.state = {}
	this.searcher = React.createRef();
    }

    componentDidMount() {}


    async focusRef(ref) {
	if (ref) {
	    const el = await ref.getInputElement(); 
	    el.focus(); 
	} else {console.log(ref)}
    }


    render() { 
	return (
	    <IonModal 
		//ref={this.props.reference} 
		isOpen={this.props.qs_show} 
		ionModalDidPresent={this.focusRef(this.searcher.current)}
		animated={false}
		cssClass='qs_modal'
		onDidDismiss={this.props.dismiss}
	    >
		<IonSearchbar ref={this.searcher} className='search-bar'/>

	    </IonModal>
	) 
    }

}

export default QuickSwitcher;



