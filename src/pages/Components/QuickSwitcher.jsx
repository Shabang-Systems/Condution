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
    }

    focusRef() {
       if (this.searcher.current)
            this.searcher.current.setFocus();
    }


    filterItems(searchTerm) {
	let filteredItems = this.state.items.filter(item => {
	    return item[0].toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
	});
	//this.setState({firstItem: filteredItems[0]});
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
	    if (!firstItem) {
		console.log(firstItem)
		firstItem = [".upcoming", "upcoming", ""]
	    }
	    this.props.history.push(`/${firstItem[1]}/${firstItem[2]}`) // push to the history
	    this.props.paginate(...firstItem.slice(1)); // paginate-ify it!
	    this.props.dismiss()
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
			placeholder="Let's go to.."
			onIonChange={e => this.setState({query: e.detail.value})}
			debounce={0}
			onSubmit={()=>{console.log("wheee")}}
			onKeyDown={this.handleSubmit}
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

export default withRouter(QuickSwitcher);



