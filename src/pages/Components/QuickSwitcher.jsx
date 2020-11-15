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
	    firstItem: '',
	    direction: true, 
	    prop_store: '',
	}
	this.searcher = React.createRef();
    }

    componentDidUpdate() {
	if (this.state.prop_store != this.props) { // if the props have changed, 
	    this.processItems() // process the items 
	}

    }

    componentDidMount() {
	this.processItems() // when we mount, process the items. probs delete this. 
	this.setState({prop_store: this.props, options: this.state.items}) // set the prop store and the items 
    }

    focusRef() {
       if (this.searcher.current) // if the ref exists, 
            this.searcher.current.setFocus(); // focus it 
	    this.setState({query: ''}) // and reset the query 
    }


    filterItems(searchTerm) {
	let filteredItems = this.state.items.filter(item => {
	    return item[0].toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
	});
	return filteredItems
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
    }


    handleSubmit(e) {
	if (e.key == "Enter") {
	    let firstItem = this.filterItems(this.state.query)[0]
	    // TODO: jack make the sidebar styling work 
	    if (!firstItem || !this.state.query) {
		if (this.state.direction && this.props.history.length > 2) { 
		    this.props.history.goBack() 
		} 
		else if (this.props.history.length > 2) { this.props.history.goForward() }
		this.setState({direction: !this.state.direction})
		
	    } else {
		const slicedFirstItem = firstItem.slice(1)
		this.props.history.push(`/${firstItem[1]}/${firstItem[2]}`) // push to the history
		this.props.paginate(...slicedFirstItem); // paginate-ify it!
		this.props.updateIdx(slicedFirstItem)
	    }
	    this.props.dismiss() // dismiss the modal
	}
    }


    render() { 
	return (
	    <IonModal 
		isOpen={this.props.qs_show} 
		animated={false}
		cssClass='qs_modal'
		autoFocus={true}
		onDidPresent={this.focusRef}
		onDidDismiss={this.props.dismiss}
	    >
		<div className='modal-content-wrapper'>
		    <IonSearchbar 
			autoFocus={true}
			ref={this.searcher} 
			animated={true}
			spellcheck={true}
			className='search-bar'
			placeholder="Previous  |  Let's go to.." // TODO: jack do you like this? 
			onIonChange={e => this.setState({query: e.detail.value})}
			debounce={0}
			onSubmit={()=>{console.log("wheee")}}
			onKeyDown={this.handleSubmit}
			//value={this.searchText}
		    />
			<div className='option-wrapper'> 
			    {this.filterItems(this.state.query).map(item => 
			    <p className='option-text' 
				onClick={()=>{
				    console.log(item)
				    this.props.history.push(`/${item[1]}/${item[2]}`) // push to the history
				    this.props.paginate(...item.slice(1)); // paginate-ify it!
				    this.props.dismiss()
				}}
			    >{item[0]}</p>
			    )}
			    
			</div> 
		</div>

	    </IonModal>
	) 
    }

}

export default withRouter(QuickSwitcher);



