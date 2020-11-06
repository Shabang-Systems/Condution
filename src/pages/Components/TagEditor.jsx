import { IonModal, IonContent, IonSelect, IonSelectOption } from '@ionic/react';
import { Dropdown } from 'react-bootstrap';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Repeat.css';
//import OutsideClickHandler from 'react-outside-click-handler';
import "react-datepicker/dist/react-datepicker.css";
import * as chrono from 'chrono-node';
import Select from 'react-select'

/*
 * [insert poem]
 */

const autoBind = require('auto-bind/react');

class TagEditor extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        return (
            <IonModal ref={this.props.reference} isOpen={this.props.isShown} onDidDismiss={() => {if(this.props.onDidDismiss) this.props.onDidDismiss()}} style={{borderRadius: 5}} cssClass={"tag-editor"}>
                <div></div>
            </IonModal>
        )
    }
}

export default TagEditor
