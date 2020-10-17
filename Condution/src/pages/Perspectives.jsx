import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Perspectives.css'
import './Pages.css';

import Task from './Components/Task';

const autoBind = require('auto-bind/react');

class Perspectives extends Component {

    constructor(props) {
        super(props);

        this.state = {
	    taskList: [],
	    possibleProjects:{}, // see jacks comments in upcoming 
	    possibleTags:{}, 
	    possibleProjectsRev:{}, 
	    possibleTagsRev:{}, 
	    availability: [], 
	    projectSelects:[], 
	    tagSelects: [], 
	    projectDB: {}

	};

	
        this.updatePrefix = this.random();
        this.props.gruntman.registerRefresher((this.refresh).bind(this));

        // AutoBind!
        autoBind(this);
    }

    async refresh() {
	let possiblePerspectives = await this.props.engine.db.getPerspectives(this.props.uid); // get all possible perspectives
	let perspectiveObject = possiblePerspectives[0][this.props.id] // get the one we want based on page id 
	let taskList = await this.props.engine.perspective.calc(this.props.uid, perspectiveObject.query, perspectiveObject.avail, perspectiveObject.tord) // then get the tasks from that perspective
	this.setState({taskList: taskList})
	console.log(this.state.taskList)

    }

    componentDidMount() {
	this.refresh()

    }


    random() { return (((1+Math.random())*0x10000)|0).toString(16)+"-"+(((1+Math.random())*0x10000)|0).toString(16);}

    render() {
        //console.log(this.props.id);
        return (
            <IonPage>
                <IonContent>
	            {this.state.taskList.map(id => (
                        <Task 
			tid={id}
			key={id+"-"+this.updatePrefix} 
			uid={this.props.uid} 
			engine={this.props.engine} 
			gruntman={this.props.gruntman} 
			availability={this.state.availability[id]} 
			datapack={[
			    this.state.tagSelects, 
			    this.state.projectSelects, 
			    this.state.possibleProjects, 
			    this.state.possibleProjectsRev, 
			    this.state.possibleTags, 
			    this.state.possibleTagsRev
			]}
			/>
		    ))}

                </IonContent>
            </IonPage>
        )
    }
}

export default Perspectives;

