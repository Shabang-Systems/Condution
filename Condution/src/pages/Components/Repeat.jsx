import { IonModal} from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Task.css';
//import OutsideClickHandler from 'react-outside-click-handler';
import "react-datepicker/dist/react-datepicker.css";
import * as chrono from 'chrono-node';
import Select from 'react-select'


const autoBind = require('auto-bind/react');

class Repeat extends Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    render() {

        return (
            <IonModal ref={this.props.reference} isOpen={this.props.isShown} onDidDismiss={() => {if(this.props.onDidDismiss) this.props.onDidDismiss()}}>
                
            </IonModal>
        )
    }
}

export default Repeat;

