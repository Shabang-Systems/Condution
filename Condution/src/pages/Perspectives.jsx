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
	    perspectiveName: "",
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


	let avail = await this.props.engine.db.getItemAvailability(this.props.uid) // get availability of items
	let pPandT = await this.props.engine.db.getProjectsandTags(this.props.uid); // get projects and tags


        let projectList = []; // define the project list
        let tagsList = []; // define the tag list

        for (let pid in pPandT[1][0]) 
            tagsList.push({value: pid, label: pPandT[1][0][pid]});
        let views = this;
        let projectDB = await (async function() {
            let pdb = [];
            let topLevels = (await views.props.engine.db.getTopLevelProjects(views.props.uid))[0];
            for (let key in topLevels) {
                pdb.push(await views.props.engine.db.getProjectStructure(views.props.uid, key, true));
            }
            return pdb;
        }());

        let buildSelectString = function(p, level) {
            if (!level)
                level = ""
            projectList.push({value: p.id, label: level+pPandT[0][0][p.id]})
            if (p.children)
                for (let e of p.children)
                    if (e.type === "project")
                        buildSelectString(e.content, level+":: ");
        };

        projectDB.map(proj=>buildSelectString(proj));
	
	this.setState({
	    taskList: taskList, 
	    perspectiveName: perspectiveObject.name,
	    possibleProjects: pPandT[0][0], 
	    possibleTags: pPandT[1][0], 
	    possibleProjectsRev: pPandT[0][1], 
	    possibleTagsRev: pPandT[1][1], 
	    availability: avail, 
	    projectSelects: projectList, 
	    tagSelects: tagsList, 
	    projectDB
	}); // once we finish, set the state

    }

    handleNameChange(e) {
	console.log(e.target.value)
    }

    componentDidMount() {
        this.refresh()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // flush styles
        if (prevProps.id !== this.props.id) // if we updated the defer date
            this.refresh(); // switching between perspectives are a prop update and not a rerender
                            // so we want to refresh the perspective that's rendered
    }

    random() { return (((1+Math.random())*0x10000)|0).toString(16)+"-"+(((1+Math.random())*0x10000)|0).toString(16);}

    render() {
        return (
            <IonPage>
                <IonContent>
	           <input className="task-datebox" defaultValue={this.state.perspectiveName} 
			onChange={(e)=>{
                   // Register a scheduler to deal with React's onChange
                   // Search for the word FANCYCHANGE to read my spheal on this
                   // DATEHANDLING is here too. If you are looking for that, stop searching
			{/* 
			   e.persist(); //https://reactjs.org/docs/events.html#event-pooling
			   this.props.gruntman.registerScheduler(() => {
			       let d = chrono.parseDate(e.target.value); // NLP that date!
			       if (d) this.setState({deferDate: d}); // we we got a valid date, update the calendar UI
				   if (d) // and update the database too!
				   this.props.gruntman.do(
				       "task.update", 
				       { uid: this.props.uid, 
					tid: this.props.tid, 
					query:{defer:d, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone}}
				   )
			   }, `perspective.this.-defer-${this.props.tid}-update`)
			//*/}
			   }} 

                    />

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

