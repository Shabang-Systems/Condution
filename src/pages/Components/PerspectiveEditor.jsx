import { IonModal, IonContent, IonSelect, IonSelectOption } from '@ionic/react';
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
        }

        this.name = React.createRef();
    }

    componentDidMount() {
        if (this.props.startHighlighted) // if we are trying to create
            this.name.current.focus(); // focus the name
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
        alert("You really think we have documentation ready? I mean, if they are there, they are at docs.condution.com")
        console.log("no one is here to help. grow up.")
    }

    render() {
        return (
            <IonModal 
                ref={this.props.reference} 
                isOpen={this.props.isShown} 
                onWillPresent={() => {this.props.gruntman.lockUpdates();}}
                onDidDismiss={() => {
                    this.props.gruntman.unlockUpdates(); 
                    this.props.updateName(this.state.inputEvent);
                    if (this.props.onDidDismiss) this.props.onDidDismiss()}} style={{borderRadius: 5}
                } 
                cssClass={"perspective-modal"}
            > 

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
                        <a className="repeat-close" onClick={this.props.onDidDismiss} style={{transform: "translate(-10px, 3px)"}}><i className="fa fa-times"></i></a>

                    </div>
                    <div className="build-input">
                        <span className="bold-prefix" style={{minWidth: "70px", marginTop: "4px"}}>Filter by</span> {/*@NEEDLOC*/}
                        <input 
                            className="build-input-edit"
                            defaultValue={this.props.query}
                            onChange={(e)=> {e.persist(); this.handleQueryChange(e)}}
                            placeholder="LOCALIZE: perspective query"
                        >
                        </input> 
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
                                <IonSelectOption className="repeat-select__option" value="alph">{this.props.gruntman.localizations.psp_alpha}></IonSelectOption>
                            </IonSelect>
                            <div className="help-icon" onClick={this.handleHelp}>
                                <i 
                                    className="far fa-question-circle" 
                                ></i>
                            </div>
                        </span>


                    </div> 

                </div>
            </IonModal>
        )
    }


}

export default PerspectiveEdit;

