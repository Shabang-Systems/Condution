import { IonModal, IonContent, IonSelect, IonSelectOption } from '@ionic/react';
import { Dropdown } from 'react-bootstrap';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Repeat.css';
//import OutsideClickHandler from 'react-outside-click-handler';
import "react-datepicker/dist/react-datepicker.css";
import * as chrono from 'chrono-node';
import Select from 'react-select'



const autoBind = require('auto-bind/react');

class PerspectiveEdit extends Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
        }
    }

    componentDidMount() {

    }


    render() {
        return (
            <IonModal 
		ref={this.props.reference} 
		isOpen={this.props.isShown} 
		onWillPresent={() => {this.props.gruntman.lockUpdates();}}
		onDidDismiss={() => {this.props.gruntman.unlockUpdates(); console.log("dissmisal");
		    if (this.props.onDidDismiss) this.props.onDidDismiss()}} style={{borderRadius: 5}} > 

                <div>
                    {/* Header */}
                    <div className="repeat-header">
                        {/* Repeat name */}
                        <span style={{display: "flex", alignItems: "center", width: "100%"}}>
			    <b className="bold-prefix" >Let&#39;s build</b> 
				<input className="editable-title" 
				    defaultValue={this.props.perspectiveName} 
				    onChange={(e)=>{ // define the name onchange
					this.props.updateName(e.target.value)
					console.log(this.props.perspectiveName)
					e.persist(); //https://reactjs.org/docs/events.html#event-pooling
					this.props.gruntman.registerScheduler(() => { 
					// Register a scheduler to deal with React's onChange
					// check out the FANCYCHANGE in task.jsx
					   this.props.gruntman.do( // call a gruntman function
					       "perspective.update__name", { 
						    uid: this.props.uid, // pass it the things vvv
						    id: this.props.id, 
						    name: e.target.value
					       }
					   ).then(this.props.menuRefresh) // call the homebar refresh
				       }, `perspective.this.${this.props.id}-update`) // give it a custom id
				   }} 
				/>


			    <div className="repeat-task-name">{this.state.name}</div>
			</span>
                        {/* Close button */} 
			<a className="repeat-close" onClick={this.props.onDidDismiss}><i className="fa fa-times"></i></a>

                    </div>
                </div>
            </IonModal>
        )
    }


}

export default PerspectiveEdit;

