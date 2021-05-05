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
            expanded: false,
            items: [],
            inited: false,
            selected: 0,
            perspectiveName: '',
            perspectiveQuery: '',
        }

        this.name = React.createRef();
        this.currentlySelected = React.createRef(); // selected item ref 

    }

    componentDidMount() {
        this.fetchData();
        if (this.props.startHighlighted) // if we are trying to create
            this.name.current.focus(); // focus the name
    }

    fetchData() {
        if (this.props.perspective)
            console.log(this.props.perspective.query);
        this.setState({perspectiveQuery: this.props.perspective ? this.props.perspective.query: "", perspectiveName: this.props.perspective ? this.props.perspective.name: ""})
    }

    componentDidUpdate(prevProps, _, __) {
        if (this.props.perspective !== prevProps.perspective)
            this.fetchData();
    }

    async getItems(){
        // TODO 
//        const subs = (await this.props.engine.db.getProjectsandTags(this.props.uid)) // hit the cache 
        //let items = []
        //items.push(...Object.entries(subs[1][0]).map(([key, value]) => { // process it 
            //return ['#' + value, 'tags', key, 'fas fa-tags']
        //}))
        //items.push(...Object.entries(subs[0][0]).map(([key, value]) => { // process it 
            //return ['.' + value, 'projects', key, 'fas fa-tasks']
        //}))
        //this.setState({items: items, query: ''})
    }

    filterItems(searchTerm) { // filter the items!
        // TODO
//        let filteredItems = this.state.items.filter(item => {
            //return item[0].toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
        //});
        //return filteredItems
    }


    handleQueryChange(e) {

    }

    handleHelp() { // TODO TODO TODO: jack what do u want here? 
        window.open('https://docs.condution.com/guides/perspectives.html')
    }

    handleAppend(item) {
        const value = `[${item[0]}]`
        this.setState({inputValue: this.state.inputValue += value})
        this.handleQueryChange(this.state.inputValue)
    }

    handleKeydown(e) { // handle the keydown... avert your eyes TODO @TheEnquirer all yours
        const keyname = e.key; // store the keyname
        if (keyname == "Enter") { // if we submit, 
            const selectedItem = this.filterItems(this.state.query)[this.state.selected] // store the selected item
            if (selectedItem) { this.handleAppend(selectedItem) }
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
                if (this.currentlySelected) { 
                    this.name.current.scrollIntoView(
                        {
                            behavior: "smooth", // smooooooooooth
                            block: "start", // make it work better. their might be a better option for this 
                        }
                    ) 
                    setTimeout(()=>{
                        this.currentlySelected.current.scrollIntoView({
                            block: "end", // make it work better. their might be a better option for this 
                        })}, 10) // LMAOOOOO
                }
                // TODO: try this: https://stackoverflow.com/questions/56688002/javascript-scrollintoview-only-in-immediate-parent/56688719 (check last answer)
            }
        }
    }

    render() {
        return (
            <IonModal 
                ref={this.props.reference} 
                isOpen={this.props.isShown} 
                onWillPresent={() => {}}
                onDidDismiss={() => {
                    if (this.props.onDidDismiss) this.props.onDidDismiss()}} style={{borderRadius: 5}
                } 
                cssClass={`perspective-modal ${this.state.expanded? "expanded" : ""}`}
            > 
                <div className="inner-content">

                    <div>
                        {/* Header */}
                        <div className="perspective-header">
                            {/* Repeat name */}
                            <span style={{display: "flex", alignItems: "center", width: "100%", whiteSpace: "nowrap"}}>
                                <b className="bold-prefix" >{this.props.localizations.perspective_build_callout}</b> 
                                <input className="editable-title pbuilder-pname" 
                                    ref={this.name}
                                    value={this.state.perspectiveName} 
                                    onChange={(e)=> {this.setState({perspectiveName: e.target.value})}}
                                    onBlur={(e)=>{this.props.perspective.name = this.state.perspectiveName}}
                                    style={{minWidth: 0}}
                                    placeholder={this.props.localizations.perspective_modal_placeholder}
                                />

                                <div className="repeat-task-name">{this.state.name}</div>
                            </span>
                            {/* Close button */} 
                            <a className="edit-close" onClick={this.props.onDidDismiss} 
                                style={{transform: "translate(-5px, 5px)"}}><i className="fa fa-check check"></i></a>

                        </div>
                        <div className="build-input">
                            <span className="bold-prefix" style={{minWidth: "70px", marginTop: "4px"}}>{this.props.localizations.perspective_filter_by}</span>
                            <input 
                                className="build-input-edit"
                                //defaultValue={this.props.perspective.query}
                                value={this.state.perspectiveQuery}
                                //value={this.props.query}
                                onChange={(e)=> {
                                    e.persist(); 
                                    this.setState({perspectiveQuery: e.target.value})}
                                }
                                onBlur={(e)=>{this.props.perspective.query = this.state.perspectiveQuery}}

                                placeholder={this.props.localizations.perspective_query_placeholder}
                            >
                            </input> 
                            {/*<i 
                                className="fas fa-plus-circle check" 
                                style={{marginTop: "10px", marginLeft: "8px"}}
                                onClick={()=>this.setState({expanded: !this.state.expanded})}
                            ></i>*/}
                        </div>


                        <div className="perspective-basic-row">
                            <span className="pbasic-container" style={{marginRight: "25px"}}>
                                <span>
                                    <i className="repeat-label fas fa-exchange-alt"></i>
                                    <span className="perspective-label">{this.props.localizations.perspective_include}</span>
                                </span>

                                <IonSelect 
                                    className="perspective-select" 
                                    interface="popover" 
                                    value={this.props.perspective ? this.props.perspective.availability : ""} // TODO: make a database hit 
                                    mode="ios"
                                    onIonChange={e=>{
                                        this.props.perspective.availability = e.detail.value;
                                    }}
                                >

                                    <IonSelectOption className="repeat-select__option" value="remain">{this.props.localizations.psp_rem}</IonSelectOption>
                                    <IonSelectOption className="repeat-select__option" value="avail">{this.props.localizations.psp_avil}</IonSelectOption>
                                    <IonSelectOption className="repeat-select__option" value="flagged">{this.props.localizations.psp_flg}</IonSelectOption>
                                </IonSelect>
                            </span>

                            <span className="pbasic-container">
                                <span>
                                    <i className="repeat-label fas fa-sort-amount-down-alt"></i>
                                    <span className="perspective-label">{this.props.localizations.perspective_order}</span>
                                </span>

                                <IonSelect 
                                    className="perspective-select" 
                                    interface="popover" 
                                    value={this.props.perspective ? this.props.perspective.taskorder : ""} 
                                    mode="ios" 
                                    onIonChange={e=>{
                                        this.props.perspective.taskorder = e.detail.value;
                                    }}
                                >

                                    <IonSelectOption className="repeat-select__option" value="duas">{this.props.localizations.psp_abd}</IonSelectOption>
                                    <IonSelectOption className="repeat-select__option" value="duds">{this.props.localizations.psp_dbd}</IonSelectOption>
                                    <IonSelectOption className="repeat-select__option" value="deas">{this.props.localizations.psp_abe}</IonSelectOption>
                                    <IonSelectOption className="repeat-select__option" value="deds">{this.props.localizations.psp_dbe}</IonSelectOption>
                                    <IonSelectOption className="repeat-select__option" value="alph">{this.props.localizations.psp_alpha}</IonSelectOption>
                                </IonSelect>
                                <div className="help-icon" onClick={this.handleHelp}>
                                    <i 
                                        className="far fa-question-circle" 
                                    ></i>
                                </div>
                            </span>
                        </div> 
                    </div>
                    {/*<div className="dropdown">
                        {this.state.expanded?
                            <div style={{overflowY: "hidden"}}>
                                <div className='pmodal-content-wrapper'>
                                    <IonSearchbar 
                                        autoFocus={true} // more wishful thinking?
                                        animated={true} // idk what this does
                                        spellcheck={true} // spellcheck
                                        className='search-add'
                                        // if we are on the first item and with no query, then add a 'Previous' to the end
                                        placeholder={"Add 'OR' relation..   see '?' for more"} 
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
                                                    className= {`poption-line ${(this.state.selected == i)? 'poption-text-hover' : ''}`}
                                                    ref={(this.state.selected == i)? this.currentlySelected : null}
                                                    onMouseEnter={() => {
                                                        this.setState({selected: i}); 
                                                    }}
                                                    onClick={()=>{ this.handleAppend(item) }}
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
                    </div>*/}
                </div>
            </IonModal>
        )
    }


}

export default PerspectiveEdit;

