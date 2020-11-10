import React, { Component } from 'react';
import Mousetrap from 'mousetrap';
import { IonReactRouter, IonReactHashRouter } from '@ionic/react-router';
import { Redirect, Route, Link, Switch } from 'react-router-dom';
import { createBrowserHistory, createHashHistory } from 'history';
import { withRouter } from "react-router";
import { IonModal, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSearchbar, IonFooter } from '@ionic/react';
import './QuickSwitcher.css'
import '../Pages.css';

const autoBind = require('auto-bind/react');



class QuickSwitcher extends Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
	    searchRef: '',
	    items: this.props.items,
	    options: this.props.items,
	}
	this.searcher = React.createRef();
    }

    componentDidMount() {
	//const timer = setTimeout(() => {
	//    console.log(this.searcher.current)
	//}, 1);
    }

    // HUXLEY TRYING TO MAKE IT FOCUS 
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
	//console.log(this.searcher.current)
	//setInterval(()=>{if (this.searcher.current) {
	//this.searcher.current.setFocus()
	//    console.log(this.searcher.current)
	//}
	//}, 1000)
	//setInterval(async () => {
	//    const el = await this.searcher.current
	//    //console.log(this.searcher)
	//    if (this.searcher.current != null) {
	//        console.log(el)
	//        el.setFocus()
	//        el.focus()
	//    }
	//}, 1000)
	console.log("this should focus it!") 
    }


    filterItems(searchTerm) {
	this.setState({options: this.state.items.filter(item => {
	    return item.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
	})});
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
		<div className='modal-content-wrapper'>
		    <IonSearchbar 
			autoFocus={true}
			ref={this.searcher} 
			animated={true}
			//ref={input => input && input.getInputElement.focus()}
			className='search-bar'
			placeholder="Let's go to.."
			onIonChange={e => this.filterItems(e.detail.value)}
			debounce={0}
			//value={this.searchText}
		    />
		    <div className='option-wrapper'> 
			{this.state.options.map(item => 
			    <p className='option-text'>{item}</p>
			)}
		    </div> 
		</div>

	    </IonModal>
	) 
    }

}

export default QuickSwitcher;



