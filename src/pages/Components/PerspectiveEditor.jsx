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

class PerspectiveEdit extends Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
	    inputEvent: "",


        }
    }

    componentDidMount() {

    }

    handleQueryChange(e) {
	console.log(e, "yeeerte")
	if (e) {
	    this.props.gruntman.registerScheduler(() => { 
		 //Register a scheduler to deal with React's onChange
		 //check out the FANCYCHANGE in task.jsx
		this.props.gruntman.do( // call a gruntman function
		    "perspective.update__perspective", { 
			uid: this.props.uid, // pass it the things vvv
			id: this.props.id, 
			payload: {query: e.target.value}
		    }
		)
	    }, `perspective.this.${this.props.id}-update`) // give it a custom id
            console.log("e", e.target.value)
            //this.setState({perspectiveName: e.target.value})
        } else {console.log(e)}



    }

    sendToBackend() {

    }

    componentDidUpdate() {

    }

    handleHelp() {
	alert("lmao u thought")
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
                        <span style={{display: "inline-block", alignItems: "center", width: "100%"}}>
			    <b className="bold-prefix" >Let&#39;s build &nbsp;</b> 
				<input className="editable-title" 
				    defaultValue={this.props.perspectiveName} 
				    onChange={(e)=> {e.persist(); this.props.updateName(e); this.setState({inputEvent: e})}}
				/>

			    <div className="repeat-task-name">{this.state.name}</div>
			</span>
                        {/* Close button */} 
			<a className="repeat-close" onClick={this.props.onDidDismiss}><i className="fa fa-times"></i></a>

                    </div>
			<div className="build-input">
			    <span className="bold-prefix" style={{minWidth: "70px", marginTop: "4px"}}>Filter by</span>
			    <input 
				className="build-input-edit"
				defaultValue={this.props.query}
				onChange={(e)=> {e.persist(); this.handleQueryChange(e)}}

			    >
			    </input> 
			</div>


	            <div className="perspective-basic-row">
			<span>
			    <i className="repeat-label fas fa-exchange-alt"></i>
			    <span className="perspective-label">Include</span>
			</span>

			<IonSelect 
			    className="perspective-select" 
			    interface="popover" 
			    value={"remain"} // TODO: make a database hit 
			    mode="ios" 
			    onIonChange={e=>{
				this.props.gruntman.do( // call a gruntman function
				    "perspective.update__perspective", { 
					uid: this.props.uid, // pass it the things vvv
					id: this.props.id, 
					payload: {avail: e.detail.value}
				    }
				)
			    }}
			>

			    <IonSelectOption className="repeat-select__option" value="remain">Remaining</IonSelectOption>
			    <IonSelectOption className="repeat-select__option" value="Available">Available</IonSelectOption>
			    <IonSelectOption className="repeat-select__option" value="flagged">Flagged</IonSelectOption>
			</IonSelect>

			<span style={{marginLeft: "25px"}}>
			    <i className="repeat-label fas fa-sort-amount-down-alt"></i>
			    <span className="perspective-label">Order</span>
			</span>

			<IonSelect 
			    className="perspective-select" interface="popover" value={"duas"} mode="ios" >
			    <IonSelectOption className="repeat-select__option" value="duas">Ascend by Due</IonSelectOption>
			    <IonSelectOption className="repeat-select__option" value="duds">Descend by Due</IonSelectOption>
			    <IonSelectOption className="repeat-select__option" value="deas">Ascend by Defer</IonSelectOption>
			    <IonSelectOption className="repeat-select__option" value="deds">Descend by Defer</IonSelectOption>
			    <IonSelectOption className="repeat-select__option" value="alph">Alphabetical</IonSelectOption>
			</IonSelect>
			<div className="help-icon" onClick={this.handleHelp}>
			    <i 
				className="far fa-question-circle" 
			    ></i>
			</div>


		    </div> 

                </div>
            </IonModal>
        )
    }


}

export default PerspectiveEdit;

