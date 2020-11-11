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
	    items: [],
	    query: '',
	    prop_store: '',
	}
	this.searcher = React.createRef();
    }

    componentDidUpdate() {
	if (this.state.prop_store != this.props) { // if the props have changed, 
	    this.processItems()
	}

    }

    componentDidMount() {
	this.processItems()
	this.setState({prop_store: this.props, options: this.state.items})

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
	return(this.state.items.filter(item => {
	    return item[0].toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
	}));
    }


    processItems() {
	// name, url prefix, id
	this.setState({items: 
	    [
		['.upcoming', 'upcoming', ''], // set the first item to upcoming 
		// (i could do + but i think thats less efficent 
		['.completed', 'completed', ''], // set the second item to completed
		['.calendar', 'calendar', ''], // set the third item to calendar
		...this.props.items[0].map(o => ['#'+o.name, 'perspectives', o.id]), // map the perspectives
		...this.props.items[1].map(o => [':'+o.name, 'projects', o.id]) // and the projects 
	    ],
	    prop_store: this.props //  and update the props 
	})
	//if (this.state.items[0] != undefined) {
	//    console.log(this.state.items[0][0], "heree") // and the projects 
	//} else {console.log(this.state.items[0], "else?")}

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
			onIonChange={e => this.setState({query: e.detail.value})}
			debounce={0}
			//value={this.searchText}
		    />
		    <div className='option-wrapper'> 
			{this.filterItems(this.state.query).map(item => 
			    <p className='option-text'>{item[0]}</p>
			)}
			
		    </div> 
		</div>

	    </IonModal>
	) 
    }

}

export default QuickSwitcher;



