import { IonModal, IonContent } from '@ionic/react';
import { Dropdown } from 'react-bootstrap';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Repeat.css';
//import OutsideClickHandler from 'react-outside-click-handler';
import "react-datepicker/dist/react-datepicker.css";
import * as chrono from 'chrono-node';
import Select from 'react-select'


/*
 * Hello human,
 * good morning.
 *
 * I am the repeat UI
 *
 * Rule denotes the repeat major rule: {no repeat, daily, weekly: yearly}
 * Advanced denotes whether the user is using fancy repeat
 * On denotes the advanced repeat signals. (like mon, tue, sat or something.)
 *
 * @jemoka
 *
 */

const autoBind = require('auto-bind/react');

class Repeat extends Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            name: "", // task's name
            rule: "none", // the repeat rule
            advanced: false, // advanced or not
            on: undefined, // advanced repeat rules
        }
    }

    async loadTask() {
        let taskInfo = await this.props.engine.db.getTaskInformation(this.props.uid, this.props.tid);
        this.setState({
            name: taskInfo.name, // name is name
            rule: taskInfo.repeat ? taskInfo.repeat.rule : "none", // rule is rule, if there's a rule
            advanced: taskInfo.repeat ? (taskInfo.repeat.on !== undefined) : false, // on is on, if there's a rule
            on: taskInfo.repeat ? taskInfo.repeat.on : undefined, // on is on, if there's a rule
        });
    }

    componentDidMount() {
        this.loadTask();
    }

    render() {
        return (
            <IonModal ref={this.props.reference} isOpen={this.props.isShown} onDidDismiss={() => {if(this.props.onDidDismiss) this.props.onDidDismiss()}} style={{borderRadius: 5}} cssClass="task-repeat">
                <IonContent fullscreen>
                    {/* Header */}
                    <div className="repeat-header">
                        {/* Repeat name */}
                        <b>Repeat</b> {this.state.name}
                        {/* Close button */}
                        <a className="repeat-close" onClick={this.props.onDidDismiss}><i class="fa fa-times"></i></a>
                    </div>
                    <div>
                        Repeat rule: 
                        <Dropdown>
                          <Dropdown.Toggle className="repeat-select">
                            Dropdown Button
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                            <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                            <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </IonContent>
            </IonModal>
        )
    }
}

export default Repeat;

