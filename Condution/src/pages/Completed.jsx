import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet, IonMenuToggle, IonBadge } from '@ionic/react'; //to prune
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Completed.css';
import './Pages.css';

import Task from './Components/Task';

const autoBind = require('auto-bind/react');

function TaskObject(type, contents) {
    this.type = type;
    this.contents = contents;
}

class Completed extends Component {
    constructor(props) {
        super(props);

	this.state = {taskList: [], 
	    tasksShown: 1, 
	    labelBump: 0,
	    taskCats: ["Today", "Yesterday", "This Week", "This Month", "Even Before"],
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
	let taskArr = [];
	let [tasksToday, tasksYesterday, tasksWeek, tasksMonth, evenBefore] = await this.props.engine.db.getCompletedTasks(this.props.uid);
	let full = await this.props.engine.db.getCompletedTasks(this.props.uid);
	

	full.forEach((cat, i) => {
	    taskArr.push(new TaskObject("label", this.state.taskCats[i]))
	    cat.forEach(task => {
		taskArr.push(new TaskObject("task", task))
	    })
	});

	console.log(taskArr)
	// loop through render function 10*tasksShown
	    // in the render, if type is a label, 
		// render a p and a task with the next item, then incriment the i
		// else, render a task 

	this.setState({taskList: taskArr});
	//this.setState({taskList: [tasksToday, tasksYesterday, tasksWeek, tasksMonth, evenBefore]});


    }

    async componentDidMount() {
        this.refresh();
    }
    
    handleFetchMore() {
	this.setState({tasksShown: this.state.tasksShown+1})
	//console.log("handled fetch")

	console.log(this.state.tasksShown)

    }

    handleLabel(content) {

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


	    {this.state.taskList.slice(0,10*this.state.tasksShown+this.state.labelBump).map((content, i) => (
		<div>
		{(content.type == "label")? 
			<p>"yeeets"</p>: <p>{content.type}</p>
		    }
		    
		    
		</div>
	    ))}











	    {/*
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
		*/}



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

