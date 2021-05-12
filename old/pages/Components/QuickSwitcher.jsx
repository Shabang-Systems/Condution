import React, { Component } from 'react';
import Mousetrap from 'mousetrap';
import { IonReactRouter, IonReactHashRouter } from '@ionic/react-router';
import { Redirect, Route, Link, Switch } from 'react-router-dom';
import { createBrowserHistory, createHashHistory } from 'history';
import { withRouter } from "react-router";
import { IonModal, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSearchbar, IonFooter } from '@ionic/react';
import './QuickSwitcher.css'
import '../Pages.css';
import { Query } from "../../backend/src/Objects/Utils.ts";
//import Project from "../backend/src/Objects/Project";
import Project from "../../backend/src/Objects/Project";

const autoBind = require('auto-bind/react');


/*
 * I am the quick switcher.
 *
 * With me you switch quickly!
 *
 * but be warned:
 *
 * The code upon which I am built
 *
 * Often sends those who see it
 *
 * Into horror.
 *
 *
 * @enquirer
 */


// TODO: subprojects and icon 


class QuickSwitcher extends Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
	    items: [], // processed items I get passed
	    filteredList: [], // my items filtered base upon query 
	    query: '', // my query! 
	    direction: true, // should I go back in history, or forward? (for back toggle)
	    selected: 0, // what is my selected item index?
	    prop_store: '', // store my props so we can check if they have changed 
	    projs: [],
	}
	this.searcher = React.createRef(); // searchbar input ref 
	this.currentlySelected = React.createRef(); // selected item ref 
    }

    componentDidUpdate() {
	if (this.state.prop_store != this.props) { // if the props have changed, TODO: fix this
	    this.getProjs() // get our sub projects 
	    this.processItems() // process the items 
	}
    }

    componentDidMount() {
	this.processItems() // when we mount, process the items.
	this.setState({prop_store: this.props}) // set the prop store and the items 
	this.getProjs() // get our sub projects 
    }

    async getProjs() { // get our projects 
	let q = new Query(this.props.cm);
	let subs = await q.execute(Project, (i)=>!i.isComplete)

	//const subs = (await this.props.engine.db.getProjectsandTags(this.props.uid))[0][0] // hit the cache 
	//const mod = Object.entries(subs).map(([key, value]) => { // process it 
	//    return ['.' + value, 'projects', key, 'fas fa-tasks']
	//});
	const mod = subs.map((i) => {
	    return ['.' + i.name, 'projects', i.id, 'fas fa-tasks']
	})
	this.setState({projs: mod}) // and set our state 
    }

    focusRef() { // focus the ref!
	if (this.searcher.current) // if the ref exists,
            this.searcher.current.setFocus(); // focus it 
	this.setState({query: '', selected: 0}) // and reset the query 
	this.getProjs() // and get our projects
    }


    filterItems(searchTerm) { // filter the items!
	let filteredItems = this.state.items.filter(item => {
	    return item[0].toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
	});
	return filteredItems
    }

    processItems() { // process our items!
	// name, url prefix, id, icon classname 
	this.setState({items: 
	    [
		[this.props.localizations.qs_upcoming, 'upcoming', '', 'fas fa-chevron-circle-right'], // set the first item to upcoming 
		// (i could do + but i think thats less efficent 
		[this.props.localizations.qs_completed, 'completed', '', 'fas fa-check-circle'], // set the second item to completed
		[this.props.localizations.qs_calendar, 'calendar', '', 'fas fa-calendar-alt'], // set the third item to calendar
		...this.props.items[0].map(o => ['!'+o.name, 'perspectives', o.id, 'fas fa-layer-group']), // map the perspectives
		...this.state.projs // the projects! 
	    ],
	    prop_store: this.props //  and update the props 
	})
    }

    handleKeydown(e) { // handle the keydown... avert your eyes
	const keyname = e.key; // store the keyname
	if (keyname == "Enter") { // if we submit, 
	    let selectedItem = this.filterItems(this.state.query)[this.state.selected] // store the selected item
	    // TODO: jack make the sidebar styling work 
	    // if we are selectiong the first item and we have no query, 
	    if ((!selectedItem || !this.state.query) && this.state.selected == 0) {  
		if (this.state.direction && this.props.history.length > 2) { // check our direction, 
		    this.props.history.goBack() // then navigate back accordingly. 
		} 
		else if (this.props.history.length > 2) { this.props.history.goForward() }
		this.setState({direction: !this.state.direction}) // and flip the direction 

	    } else {
		const slicedSelectedItem = selectedItem.slice(1) // store the sliced item!
		this.props.history.push(`/${selectedItem[1]}/${selectedItem[2]}`) // push to the history
		this.props.paginate(...slicedSelectedItem); // paginate-ify it!
		this.props.updateIdx(slicedSelectedItem) // make our homebar keybinds work by giving it the index
	    }
	    this.props.dismiss() // dismiss the modal
	} else { // if we havent pressed submit, 
	    const idx = this.state.selected // store the index 
	    const len = this.filterItems(this.state.query).length-1 // and the filtered items cus react lifecyle bd 
	    if (keyname == "ArrowUp" || (e.ctrlKey && keyname == "p")) { // if we are navigating up, 
		if (idx > 0) { // and we selecting something greater than the first element, 
		    this.setState({selected: idx-1}) // subtract from our index 
		} else { this.setState({selected: len})} // if we are selection the first element, wrap to the last
		if (this.currentlySelected) {this.currentlySelected.current.scrollIntoView({ // and scroll it into view 
		    behavior: "smooth", // make it smooooth 
		    block: "end" // make it not get covered by the searchbar 
		})}
	    } else if (keyname == "ArrowDown" || (e.ctrlKey && keyname == "n")) { // if we are scrolling down, 
		if (idx == len) { // handle wrapping 
		    this.setState({selected: 0})
		} else { this.setState({selected: idx+1}) } 
		if (this.currentlySelected) {this.currentlySelected.current.scrollIntoView({
		    behavior: "smooth", // smooooooooooth
		    block: "start", // make it work better. their might be a better option for this 
		})}
		// TODO: try this: https://stackoverflow.com/questions/56688002/javascript-scrollintoview-only-in-immediate-parent/56688719 (check last answer)
	    }
	}
    }


    render() { 
	return (
	    <IonModal 
		isOpen={this.props.qs_show}  // are we open? 
		animated={false} // don't animate the opening. 
		cssClass='qs_modal' // give it a class! 
		autoFocus={true} // this doesnt do anything, but like, wishful thinking? 
		onDidPresent={this.focusRef} // focus our input when we present the modal, and some other stuff
		onDidDismiss={this.props.dismiss} // set the state toggle when we dismiss the modal
	    >
		<div className='modal-content-wrapper'>
		    <IonSearchbar 
			autoFocus={true} // more wishful thinking?
			ref={this.searcher} // give it a ref!
			animated={true} // idk what this does
			spellcheck={true} // spellcheck
			className='search-bar'
			// if we are on the first item and with no query, then add a 'Previous' to the end
			placeholder={`Let's go to..${(this.state.selected == 0 && this.state.query == '')?"   |   Previous" : ""}`} // TODO: jack do you like this? 
			// when we change, set the query, then set the selected to the first item 
			onIonChange={e => this.setState({query: e.detail.value, selected: 0})}
			debounce={0} // update for every update
			onKeyDown={this.handleKeydown} // call our gross function 

		    ////////
		    // loop through our filtered items, highlight if the index is right
		    // onclick nav there, on hover set the index and the styling
		    ////////

		    />
		    <div className='option-wrapper'> 
			{this.filterItems(this.state.query).map((item, i) => {
			    return (
				<div 
                    key={i}
				    className="option-line"
				    className= {`option-line ${(this.state.selected == i)? 'option-text-hover' : ''}`}
				    ref={(this.state.selected == i)? this.currentlySelected : null}
				    onMouseEnter={() => {
					this.setState({selected: i}); 
				    }}
				    onClick={()=>{
					this.props.history.push(`/${item[1]}/${item[2]}`) // push to the history
					this.props.paginate(...item.slice(1)); // paginate-ify it!
					this.props.dismiss()
				    }}

				>
				    <i className={`${item[3]} option-icon`} style={{
				    }}></i>
				    <p 
					className= {`option-text`}
				    >{item[0]}</p>
				</div>
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



