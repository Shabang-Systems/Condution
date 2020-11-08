import React, { Component } from 'react';
import Mousetrap from 'mousetrap';
import { IonReactRouter, IonReactHashRouter } from '@ionic/react-router';
import { Redirect, Route, Link, Switch } from 'react-router-dom';
import { createBrowserHistory, createHashHistory } from 'history';
import { withRouter } from "react-router";
import { IonModal, IonContent, IonSelect, IonSelectOption } from '@ionic/react';
import './QuickSwitcher.css'

const autoBind = require('auto-bind/react');



class QuickSwitcher extends Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {}
    }

    componentDidMount() {}

    render() { 
        return (
                <IonModal 
                    //ref={this.props.reference} 
                    isOpen={this.props.qs_show} 
            animated={false}
            cssClass='qs_modal'
            >
            <input 
                placeholder="LOCALIZE: quickswitcht-ify!"
            >
            </input> 

                </IonModal>
        ) 
    }

}

export default QuickSwitcher;



