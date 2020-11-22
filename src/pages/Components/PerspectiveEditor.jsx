import { IonModal, IonContent, IonSearchbar, IonPage, IonSelect, IonSelectOption } from '@ionic/react';
import { Dropdown } from 'react-bootstrap';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Repeat.css';
import '../Perspectives.css';
import "react-datepicker/dist/react-datepicker.css";
import * as chrono from 'chrono-node';
import Select from 'react-select'

const autoBind = require('auto-bind/react');


/* 
 * perspectives are amazing 
 *
 * dab on them haters 
 *
 * I just said the cringiest thing ever
 *
 * oh my god huxley i swear to god 
 *
 * i will rebase your commits 
 *
 *
 * - @zbuster05, recorded by @enquirer
 *
 */

class PerspectiveEdit extends Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            inputEvent: "", // define our input event for the perspective title 
	    expanded: false,
	    items: [],
	    inited: false,
	    query: '',
	    selected: 0,
	    inputValue: this.props.query,
        }

        this.name = React.createRef();
    }

    componentDidMount() {
        if (this.props.startHighlighted) // if we are trying to create
            this.name.current.focus(); // focus the name
	this.setState({inputValue: this.props.query})
	console.log(this.props.query)
    }

    componentDidUpdate() {
	if (this.props.query != this.state.inputValue && !this.state.inited) {
	    console.log("updatinggg homebrewwwwww")
	    this.setState({inputValue: this.props.query, inited: true})
	}
    }

    async getItems(){
	const subs = (await this.props.engine.db.getProjectsandTags(this.props.uid)) // hit the cache 
	let items = []
	items.push(...Object.entries(subs[1][0]).map(([key, value]) => { // process it 
	    return ['#' + value, 'tags', key, 'fas fa-tags']
	}))
	items.push(...Object.entries(subs[0][0]).map(([key, value]) => { // process it 
	    return ['.' + value, 'projects', key, 'fas fa-tasks']
	}))
	this.setState({items: items})
	//console.log(items)
    }
    filterItems(searchTerm) { // filter the items!
	let filteredItems = this.state.items.filter(item => {
	    return item[0].toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
	});
	return filteredItems
    }


    handleQueryChange(e) {
        if (e) { // if the event is defined 
            this.props.gruntman.registerScheduler(() => { 
                //Register a scheduler to deal with React's onChange
                //check out the FANCYCHANGE in task.jsx
                this.props.gruntman.do( // call a gruntman function
                    "perspective.update__perspective", { 
                        // pass it the things 
                        uid: this.props.uid, // pass it the uid 
                        id: this.props.id,  // pass it the perspective id 
                        payload: {query: e.target.value} // pass it the action, updating the query
                    }
                )
            }, `perspective.this.${this.props.id}-update`) // give it a custom id
        } else {console.log(e)}
    }

    handleHelp() { // TODO TODO TODO: jack what do u want here? 
	window.open('https://condutiondocs.shabang.cf/Perspective-Menus-408aae7988a345c0912644267ccda4d2#35a4686c83eb4cc589d3570a05de6b5a')
    }

    handleAppend(item) {
	let value = ''
	if (item[1] == 'tags') {
	    value = `${item[0]}`
	}
	console.log(value, item)
    }

    render() {
        return (
            <IonModal 
                ref={this.props.reference} 
                isOpen={this.props.isShown} 
                onWillPresent={() => {this.props.gruntman.lockUpdates(); this.getItems()}}
                onDidDismiss={() => {
                    this.props.gruntman.unlockUpdates(); 
                    this.props.updateName(this.state.inputEvent);
                    if (this.props.onDidDismiss) this.props.onDidDismiss()}} style={{borderRadius: 5}
                } 
                cssClass={`perspective-modal ${this.state.expanded? "expanded" : ""}`}
            > 
		<IonPage>
		    <div className="inner-content">

			<div>
			    {/* Header */}
			    <div className="perspective-header">
				{/* Repeat name */}
				<span style={{display: "flex", alignItems: "center", width: "100%", whiteSpace: "nowrap"}}>
				    <b className="bold-prefix" >{this.props.gruntman.localizations.perspective_build_callout}</b> 
				    <input className="editable-title pbuilder-pname" 
					ref={this.name}
					defaultValue={this.props.perspectiveName} 
					onChange={(e)=> {e.persist(); this.props.updateName(e); this.setState({inputEvent: e})}}
					style={{minWidth: 0}}
					placeholder="@NEEDLOC Tap to set name"
				    />

				    <div className="repeat-task-name">{this.state.name}</div>
				</span>
				{/* Close button */} 
				<a className="edit-close" onClick={this.props.onDidDismiss} 
				    style={{transform: "translate(-5px, 5px)"}}><i className="fa fa-check check"></i></a>

			    </div>
			    <div className="build-input">
				<span className="bold-prefix" style={{minWidth: "70px", marginTop: "4px"}}>Filter by</span> {/*@NEEDLOC*/}
				<input 
				    className="build-input-edit"
				    //defaultValue={this.props.query}
				    value={this.state.inputValue}
				    //value={this.props.query}
				    onChange={(e)=> {
					e.persist(); 
					this.handleQueryChange(e); 
					this.setState({inputValue: e.target.value})}
				    }

				    placeholder="LOCALIZE: perspective query"
				>
				</input> 
				<i 
				    className="fas fa-plus-circle check" 
				    style={{marginTop: "10px", marginLeft: "8px"}}
				    onClick={()=>this.setState({expanded: !this.state.expanded})}
				></i>
			    </div>


			    <div className="perspective-basic-row">
				<span className="pbasic-container" style={{marginRight: "25px"}}>
				    <span>
					<i className="repeat-label fas fa-exchange-alt"></i>
					<span className="perspective-label">{this.props.gruntman.localizations.perspective_include}</span>
				    </span>

				    <IonSelect 
					className="perspective-select" 
					interface="popover" 
					value={this.props.avail} // TODO: make a database hit 
					mode="ios"
					onIonChange={e=>{
					    this.props.gruntman.do( // call a gruntman function
						"perspective.update__perspective", { 
						    uid: this.props.uid, // pass it the user id 
						    id: this.props.id,  // pass it the perspective id
						    payload: {avail: e.detail.value} // set the availability 
						}
					    )
					}}
				    >

					<IonSelectOption className="repeat-select__option" value="remain">{this.props.gruntman.localizations.psp_rem}</IonSelectOption>
					<IonSelectOption className="repeat-select__option" value="avail">{this.props.gruntman.localizations.psp_avil}</IonSelectOption>
					<IonSelectOption className="repeat-select__option" value="flagged">{this.props.gruntman.localizations.psp_flg}</IonSelectOption>
				    </IonSelect>
				</span>

				<span className="pbasic-container">
				    <span>
					<i className="repeat-label fas fa-sort-amount-down-alt"></i>
					<span className="perspective-label">{this.props.gruntman.localizations.perspective_order}</span>
				    </span>

				    <IonSelect 
					className="perspective-select" 
					interface="popover" 
					value={this.props.tord} 
					mode="ios" 
					onIonChange={e=>{
					    this.props.gruntman.do( // call a gruntman function
						"perspective.update__perspective", { 
						    uid: this.props.uid, // pass it the things, you know the drill 
						    id: this.props.id, 
						    payload: {tord: e.detail.value}
						}
					    )
					}}
				    >

					<IonSelectOption className="repeat-select__option" value="duas">{this.props.gruntman.localizations.psp_abd}</IonSelectOption>
					<IonSelectOption className="repeat-select__option" value="duds">{this.props.gruntman.localizations.psp_dbd}</IonSelectOption>
					<IonSelectOption className="repeat-select__option" value="deas">{this.props.gruntman.localizations.psp_abe}</IonSelectOption>
					<IonSelectOption className="repeat-select__option" value="deds">{this.props.gruntman.localizations.psp_dbe}</IonSelectOption>
					<IonSelectOption className="repeat-select__option" value="alph">{this.props.gruntman.localizations.psp_alpha}</IonSelectOption>
				    </IonSelect>
				    <div className="help-icon" onClick={this.handleHelp}>
					<i 
					    className="far fa-question-circle" 
					></i>
				    </div>
				</span>
			    </div> 
			</div>
			<div className="dropdown">
			    {this.state.expanded?
				<div>
				    <div className='modal-content-wrapper'>
					<IonSearchbar 
					    autoFocus={true} // more wishful thinking?
					    animated={true} // idk what this does
					    spellcheck={true} // spellcheck
					    className='search-add'
					    // if we are on the first item and with no query, then add a 'Previous' to the end
					    //placeholder={`Let's go to..${(this.state.selected == 0 && this.state.query == '')?"   |   Previous" : ""}`} // TODO: jack do you like this? 
					    // when we change, set the query, then set the selected to the first item 
					    onIonChange={e => this.setState({query: e.detail.value, selected: 0})}
					    debounce={0} // update for every update
					    //onKeyDown={this.handleKeydown} // call our gross function 

					////////
					// loop through our filtered items, highlight if the index is right
					// onclick nav there, on hover set the index and the styling
					////////

					/>
					<div className='option-wrapper'> 
					    {this.filterItems(this.state.query).map((item, i) => {
						return (
						    <div 
							className= {`poption-line ${(this.state.selected == i)? 'poption-text-hover' : ''}`}
							ref={(this.state.selected == i)? this.currentlySelected : null}
							onMouseEnter={() => {
							    this.setState({selected: i}); 
							}}
							onClick={()=>{
							    this.handleAppend(item)
							    //this.props.history.push(`/${item[1]}/${item[2]}`) // push to the history
							    //this.props.paginate(...item.slice(1));  //paginate-ify it!
							    //this.props.dismiss()
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
					    )
					}
					</div> 
				    </div>
			    </div> : null }
			</div>
		    </div>
		</IonPage>
            </IonModal>
        )
    }


}

export default PerspectiveEdit;

