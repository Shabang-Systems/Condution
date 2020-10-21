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
            <IonModal ref={this.props.reference} isOpen={this.props.isShown} onDidDismiss={() => {if(this.props.onDidDismiss) this.props.onDidDismiss()}} style={{borderRadius: 5}}> 

                <div>
                    {/* Header */}
                    <div className="repeat-header">
                        {/* Repeat name */}
                        <span style={{display: "flex", alignItems: "center", width: "100%"}}><b>Let&#39;s build</b> <div className="repeat-task-name">{this.state.name}</div></span>
                        {/* Close button */} 
			<a className="repeat-close" onClick={this.props.onDidDismiss}><i className="fa fa-times"></i></a>

                    </div>
                </div>
            </IonModal>
        )
    }


}

export default PerspectiveEdit;

