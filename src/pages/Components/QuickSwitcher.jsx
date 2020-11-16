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
	    filteredList: [],
	    query: '',
	    firstItem: '',
	    direction: true, 
	    selected: 0,
	    prop_store: '',
	    initialRenderingDone: false, 
	}
	this.searcher = React.createRef();
	this.currentlySelected = React.createRef();
    }

    componentDidUpdate() {
	if (this.state.prop_store != this.props) { // if the props have changed, 
	    this.processItems() // process the items 
	}

    }

    componentDidMount() {
	this.processItems() // when we mount, process the items. probs delete this. 
	this.setState({prop_store: this.props, options: this.state.items, initialRenderingDone: true}) // set the prop store and the items 
    }

    focusRef() {
       if (this.searcher.current) // if the ref exists, 
            this.searcher.current.setFocus(); // focus it 
	this.setState({query: '', selected: 0}) // and reset the query 
    }


    filterItems(searchTerm, org) {
	let filteredItems = this.state.items.filter(item => {
	    return item[0].toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
	});
	return filteredItems
    }


    processItems() {
	// name, url prefix, id
	this.setState({items: 
	    [
		[':upcoming', 'upcoming', ''], // set the first item to upcoming 
		// (i could do + but i think thats less efficent 
		[':completed', 'completed', ''], // set the second item to completed
		[':calendar', 'calendar', ''], // set the third item to calendar
		...this.props.items[0].map(o => ['!'+o.name, 'perspectives', o.id]), // map the perspectives
		...this.props.items[1].map(o => ['.'+o.name, 'projects', o.id]) // and the projects 
	    ],
	    prop_store: this.props //  and update the props 
	})
    }


    handleKeydown(e) {
	const keyname = e.key;
	if (keyname == "Enter") {
	    let selectedItem = this.filterItems(this.state.query)[this.state.selected]
	    // TODO: jack make the sidebar styling work 
	    if ((!selectedItem || !this.state.query) && this.state.selected == 0) {
		if (this.state.direction && this.props.history.length > 2) { 
		    this.props.history.goBack() 
		} 
		else if (this.props.history.length > 2) { this.props.history.goForward() }
		this.setState({direction: !this.state.direction})
		
	    } else {
		const slicedSelectedItem = selectedItem.slice(1)
		this.props.history.push(`/${selectedItem[1]}/${selectedItem[2]}`) // push to the history
		this.props.paginate(...slicedSelectedItem); // paginate-ify it!
		this.props.updateIdx(slicedSelectedItem)
	    }
	    this.props.dismiss() // dismiss the modal
	} else {
	    const idx = this.state.selected
	    const len = this.filterItems(this.state.query).length-1
	    if (keyname == "ArrowUp" || (e.ctrlKey && keyname == "p")) {
		if (idx > 0) {
		    this.setState({selected: idx-1})
		} else { this.setState({selected: len})}
		if (this.currentlySelected) {this.currentlySelected.current.scrollIntoView({
		    behavior: "smooth",
		    block: "end"
		})}
	    } else if (keyname == "ArrowDown" || (e.ctrlKey && keyname == "n")) {
		if (idx == len) {
		    this.setState({selected: 0})
		} else { this.setState({selected: idx+1}) }
		if (this.currentlySelected) {this.currentlySelected.current.scrollIntoView({
		    behavior: "smooth",
		    block: "start",
		})}
	    }
	    console.log(this.state.selected)

	}

    }


    render() { 
	return (
	    <IonModal 
		isOpen={this.props.qs_show} 
		animated={false}
		cssClass='qs_modal'
		autoFocus={true}
		onDidPresent={ this.focusRef }
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
			onIonChange={e => this.setState({query: e.detail.value, selected: 0})}
			debounce={0}
			onKeyDown={this.handleKeydown}
		    />
		    <div className='option-wrapper'> 
			{this.filterItems(this.state.query).map((item, i) => {
			    return (
				<p 
				    className= {`option-text ${(this.state.selected == i)? 'option-text-hover' : ''}`}
				    ref={(this.state.selected == i)? this.currentlySelected : null}

				    onMouseEnter={() => {
					this.setState({selected: i}); 
				    }}
				    onClick={()=>{
					this.props.history.push(`/${item[1]}/${item[2]}`) // push to the history
					this.props.paginate(...item.slice(1)); // paginate-ify it!
					this.props.dismiss()
				    }}
				>{item[0]}</p>
				)

			    }
			)}

		    </div> 
		</div>

	    </IonModal>
	) 
    }

}

export default withRouter(QuickSwitcher);



