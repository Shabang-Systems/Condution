import { IonModal, IonContent, IonSelect, IonSelectOption } from '@ionic/react';
import { Dropdown } from 'react-bootstrap';
import React, { Component } from 'react';
import './Datebar.css';
//import OutsideClickHandler from 'react-outside-click-handler';
import "react-datepicker/dist/react-datepicker.css";
import * as chrono from 'chrono-node';
import Select from 'react-select'


/*
 * Hello human,
 * good morning.
 *
 * The datebar is me
 *
 * I am literally a pretty face for a date selector
 *
 * @jemoka
 *
 */

const autoBind = require('auto-bind/react');

class Datebar extends Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {}
    }

    componentDidMount() {}

    render() {
        return (
            <div></div>
        )
    }
}

export default Datebar;

