import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet, IonMenuToggle, IonBadge } from '@ionic/react'; //to prune
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Completed.css';
import './Pages.css';

import Task from './Components/Task';

const autoBind = require('auto-bind/react');

class Completed extends Component {
    constructor(props) {
        super(props);

	this.state = {taskList: [], 
	    tasksShown: 0, 
	    possibleProjects:{}, 
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

        autoBind(this);
    }

    async refresh() {
	let [tasksToday, tasksYesterday, tasksWeek, tasksMonth, evenBefore] = await this.props.engine.db.getCompletedTasks(this.props.uid);

	this.setState({taskList: [tasksToday, tasksYesterday, tasksWeek, tasksMonth, evenBefore]});


    }

    componentDidMount() {
        this.refresh();
    }
    
    handleFetchMore() {
	this.setState({tasksShown: this.state.tasksShown+1})
	//console.log("handled fetch")

	console.log(this.state.tasksShown)

    }


    random() { return (((1+Math.random())*0x10000)|0).toString(16)+"-"+(((1+Math.random())*0x10000)|0).toString(16);}

    
    render() {
        return (
            <IonPage>
                <IonContent>
                <div className="page-content">
                    <div className="header-container">
                        <div style={{display: "inline-block"}}>
                            <IonMenuToggle>
                                <i class="fas fa-bars" 
                                    style={{marginLeft: 20, color: "var(--decorative-light-alt"}} />
                                    </IonMenuToggle> 
                                        <h1 className="page-title">
                                            <i style={{paddingRight: 10}} 
                                                className="fas fa-check-circle">
                                                </i>
                                                    Completed
                                                    </h1> 
                                                        {/*<div className="greeting-container">
                <span id="greeting">Bontehu</span>, <span id="greeting-name">Supergod Jones.</span>
            </div>*/}
                </div>
                    </div>




		{this.state.taskList.length? 
		    
		    [<div class="page-label">LOCALIZE: Today</div>,
		    this.state.taskList[0].map(id => (
		    <Task 
			
			tid={id} 
			startingCompleted={true}
			key={id+"-"+this.updatePrefix} 
			uid={this.props.uid} 
			engine={this.props.engine} 
			gruntman={this.props.gruntman} 
			availability={this.state.availability[id]} 
			datapack={[this.state.tagSelects,
				    this.state.projectSelects, 
				    this.state.possibleProjects, 
				    this.state.possibleProjectsRev, 
				    this.state.possibleTags, 
				    this.state.possibleTagsRev]}
		    />
		))] : ""}



	    {/* {this.state.tasksShown? 
		    (this.state.taskList.length && this.state.taskList[1].length)?
			[<div class="page-label">LOCALIZE: Yesterday</div>,
			this.state.taskList[1].map(id => (
			    <Task 
				
				tid={id} 
				startingCompleted={true}
				key={id+"-"+this.updatePrefix} 
				uid={this.props.uid} 
				engine={this.props.engine} 
				gruntman={this.props.gruntman} 
				availability={this.state.availability[id]} 
				datapack={[this.state.tagSelects,
					    this.state.projectSelects, 
					    this.state.possibleProjects, 
					    this.state.possibleProjectsRev, 
					    this.state.possibleTags, 
					    this.state.possibleTagsRev]}
			    />
		    ))] : this.handleFetchMore : ""}

		{(this.state.tasksShown >= 2)? 
		    [<div class="page-label">LOCALIZE: This Week</div>,
		    this.state.taskList.length? this.state.taskList[2].map(id => (
			<Task 
			    
			    tid={id} 
			    startingCompleted={true}
			    key={id+"-"+this.updatePrefix} 
			    uid={this.props.uid} 
			    engine={this.props.engine} 
			    gruntman={this.props.gruntman} 
			    availability={this.state.availability[id]} 
			    datapack={[this.state.tagSelects,
					this.state.projectSelects, 
					this.state.possibleProjects, 
					this.state.possibleProjectsRev, 
					this.state.possibleTags, 
					this.state.possibleTagsRev]}
			/>
		    )) : ""] : ""}

		{(this.state.tasksShown >= 3)? 
		    [<div class="page-label">LOCALIZE: Even Before</div>,
		    this.state.taskList.length? this.state.taskList[3].map(id => (
			<Task 
			    
			    tid={id} 
			    startingCompleted={true}
			    key={id+"-"+this.updatePrefix} 
			    uid={this.props.uid} 
			    engine={this.props.engine} 
			    gruntman={this.props.gruntman} 
			    availability={this.state.availability[id]} 
			    datapack={[this.state.tagSelects,
					this.state.projectSelects, 
					this.state.possibleProjects, 
					this.state.possibleProjectsRev, 
					this.state.possibleTags, 
					this.state.possibleTagsRev]}
			/>
		    )) : ""] : ""} */}

		    <div className="fetch-more" onClick={this.handleFetchMore}>
			Fetch more... 
		    </div>
		    </div>
                </IonContent>
            </IonPage>
        )
    }
}

export default Completed;

