import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet, IonMenuToggle, IonBadge, isPlatform, withIonLifeCycle } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Projects.css';
import './Pages.css';
import {Spring, animated} from 'react-spring/renderprops'

import ReactTooltip from 'react-tooltip';

import Task from './Components/Task';
import GuttedTask from './Components/GuttedTask';
import BlkArt from './Components/BlkArt';

import './Components/Task.css';

import { withRouter } from "react-router";

import { SortableProjectList } from './Components/Sortable';

import Spinner from './Components/Spinner';

import Project from "../backend/src/Objects/Project";
import DbTask from "../backend/src/Objects/Task";

const autoBind = require('auto-bind/react'); // autobind things! 

class Projects extends Component { // define the component
    constructor(props) {
        super(props);

        this.state = {
            name: '', // project name
            possibleProjects:{}, // what are the possible projects? 
            possibleTags:{},  // what are the possible tags?
            possibleProjectsRev:{}, 
            possibleTagsRev:{}, 
            availability: [],  // whats available
            projectSelects:[], 
            tagSelects: [], 
            projectDB: {},
            parent: "",
            is_sequential: false,
            currentProject: {children:[]},
            activeTask: "",
            weight: 0, // total weight
            pendingWeight: 0, // weight yet to complete
	    isComplete: '', // TODO: replace this
	    animClass: '',
            initialRenderingDone: false,


	    projectObject: "",
	    itemList: [],

        };

        this.updatePrefix = this.random();


        this.activeTask = React.createRef();

        this.name = React.createRef();
	      this.checkbox = React.createRef(); // what's my pseudocheck


        autoBind(this);
    }

    componentWillUnmount() {
        //this.props.gruntman.halt();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // flush styles
	if (prevProps.id !== this.props.id) {
	    prevState.projectObject.unhook(this.reloadData);
	    this.load();
	}

        if (prevProps.id !== this.props.id && this.props.options === "do") // if we are trying to create
            this.name.current.focus(); // focus the name
    }

    async refresh() {
        //let avail = await this.props.engine.db.getItemAvailability(this.props.uid) // get availability of items
        //let pPandT = await this.props.engine.db.getProjectsandTags(this.props.uid); // get projects and tags

        //let projectList = []; // define the project list
        //let tagsList = []; // define the tag list

        //for (let pid in pPandT[1][0]) 
        //    tagsList.push({value: pid, label: pPandT[1][0][pid]});
        //let views = this;
        //let projectDB = await (async function() {
        //    let pdb = [];
        //    let topLevels = (await views.props.engine.db.getTopLevelProjects(views.props.uid))[0];
        //    for (let key in topLevels) {
        //        pdb.push(await views.props.engine.db.getProjectStructure(views.props.uid, key, true));
        //    }
        //    return pdb;
        //}());

        //let buildSelectString = function(p, level) {
        //    if (!level)
        //        level = ""
        //    projectList.push({value: p.id, label: level+pPandT[0][0][p.id]})
        //    if (p.children)
        //        for (let e of p.children)
        //            if (e.type === "project")
        //                buildSelectString(e.content, level+":: ");
        //};


        //projectDB.map(proj=>buildSelectString(proj));
	this.updatePrefix = this.random();
        //let cProject = (await views.props.engine.db.getProjectStructure(this.props.uid, this.props.id, true, true));

        //this.setState({isComplete: cProject.isComplete, name:pPandT[0][0][this.props.id], possibleProjects: pPandT[0][0], possibleTags: pPandT[1][0], possibleProjectsRev: pPandT[0][1], possibleTagsRev: pPandT[1][1], availability: avail, projectSelects: projectList, tagSelects: tagsList, projectDB, currentProject: cProject, is_sequential: cProject.is_sequential, parent: cProject.parentProj, weight: cProject.weight, pendingWeight: cProject.pendingWeight, initialRenderingDone: true});
    }

    componentDidMount() {
	//this.props.gruntman.registerRefresher((this.refresh).bind(this));
        //this.refresh();
        //if (this.props.options === "do") // if we are trying to create
        //    this.name.current.focus(); // focus the name
	this.load()
	console.log("moounting")
    }

    async load() {
	let project = await Project.fetch(this.props.cm, this.props.id)
	project.hook(this.reloadData);

	this.setState({
	    projectObject: project,
        name: project.name
	}, this.reloadData)
    }

    async reloadData() {
	//let itemList = await this.state.projectObject.execute();
	//this.setState({
	//    itemList: itemList,
	//    initialRenderingDone: true,
	//    //perspectiveName: this.state.perspectiveObject.name
	//});
	//console.log(this.state.itemList)

	let itemList = await this.state.projectObject.children
	
	this.setState({
	    itemList: itemList,
	    is_sequential: this.state.projectObject.isSequential,
	    //TODO: for some reason this doensnt update the direction of the arrow until you upate the state some other way?
	    initialRenderingDone: true,

	})
	//console.log(this.state.projectObject, "parnent")
	//console.log(this.state.itemList, this.state.is_sequential, this.state.projectObject)

    }


    random() { return (((1+Math.random())*0x10000)|0).toString(16)+"-"+(((1+Math.random())*0x10000)|0).toString(16);}

    updateName(e) {
        if (e) {
            //this.props.gruntman.registerScheduler(() => { 
            //    console.log("DID IT!");
            //    // Register a scheduler to deal with React's onChange
            //    // check out the FANCYCHANGE in task.jsx
            //    this.props.gruntman.do( // call a gruntman function
            //        "project.update__name", { 
            //            uid: this.props.uid, // pass it the things vvv
            //            id: this.props.id, 
            //            name: e.target.value
            //        }
            //    ).then(this.props.menuRefresh) // call the homebar refresh
            //}, `project.name.${this.props.id}-update`, 1500) // give it a custom id
	    this.state.projectObject.name = e.target.value

        } else { console.log(e)}
    } 


    async completeProject() {
	this.props.gruntman.do( // call a gruntman function
	    "project.update__complete", { 
		uid: this.props.uid, // pass it the things vvv
		id: this.props.id, 
	    }
	).then(this.props.menuRefresh)
	//console.log(this.state.isComplete)


	//console.log("project, completing", this.state.currentProject)

    }

    async uncompleteProject() {
	this.props.gruntman.do( // call a gruntman function
	    "project.update__uncomplete", { 
		uid: this.props.uid, // pass it the things vvv
		id: this.props.id, 
	    }
	).then(this.props.menuRefresh)

	//console.log("project, uncompleting", this.state.currentProject)
    }



    render() {
        return (
            <IonPage>
                <div className={"page-invis-drag " + (()=>{
                    if (!isPlatform("electron")) // if we are not running electron
                        return "normal"; // normal windowing proceeds
                    else if (window.navigator.platform.includes("Mac")){ // macos
                        return "darwin"; // frameless setup
                    }
                    else if (process.platform === "win32") // windows
                        return "windows"; // non-frameless
                    else 
                        return "windows"; // ummm, it does not know about windows pt0
                })()}>&nbsp;</div>
                <div className={"page-content " + (()=>{
                    if (!isPlatform("electron")) // if we are not running electron
                        return "normal"; // normal windowing proceeds
                    else if (window.navigator.platform.includes("Mac")){ // macos
                        return "darwin"; // frameless setup
                    }
                    else if (process.platform === "win32") // windows
                        return "windows"; // non-frameless
                    else 
                        return "windows"; // ummm, it does not know about windows pt.n
                })()}>

                    <div className="header-container" >
                        <div style={{display: "inline-block", width: "100%"}}>
                            <div> 
				<div>
                                <IonMenuToggle>
                                    <i className="fas fa-bars" 
                                        style={{marginLeft: 20, color: "var(--page-header-sandwich)"}} />
                                </IonMenuToggle> 
                                <h1 className="page-title">
                                    {(()=> {
					if (this.state.projectObject.isComplete) {
                                            return <a className="fas fa-chevron-left backbutton" onClick={()=>{this.props.paginate("/completed", "");this.props.history.push("/completed")}} />

					} else if (this.state.projectObject.data && this.state.projectObject.data.parent !== "") 
                                            return <a className="fas fa-chevron-left backbutton" onClick={()=>{this.props.paginate("projects", this.state.projectObject.data.parent); this.props.history.push(`/projects/${this.state.projectObject.data.parent}`)}} />
                                    })()}
                                    <i style={{paddingRight: 4}} 
                                        className="fas fa-tasks">
                                    </i>
                                    <input className="editable-title" 
                                        onChange={(e)=> {this.setState({name: e.target.value})}}
                                        onBlur={(_)=>{this.state.projectObject.name = this.state.name}}
                                        value={this.state.name}
                                        style={{transform: "transformY(-2px)"}}
                                        ref={this.name}
                                    />

                                </h1> 
				<div className="complete-container">
				    <a className={"complete-name " + this.state.animClass}
					style={{color: (this.state.animClass == "complete-anim")? "var(--background-feature)" : "var(--page-title)"}} 
					onClick={async () => { 
					    if (this.state.projectObject.data && this.state.projectObject.data.isComplete) {
						console.log("uncompleting")
						await this.state.projectObject.uncomplete()
						    .then(console.log(this.state.projectObject.isComplete))
					    } else {
						console.log("completing")
						await this.state.projectObject.complete()
						    .then(console.log(this.state.projectObject.isComplete))
					    }
					    this.setState({animClass: "complete-anim"})
					    setTimeout(() => {
						this.setState({animClass: ""})
					    }, 1000);
					}}
				    >{(window.screen.width >= 400)? 
					(this.state.projectObject.data && this.state.projectObject.data.isComplete? "Uncomplete" : "Complete") :
					(this.state.projectObject.data && this.state.projectObject.data.isComplete? <i className="fas fa-times"></i> : <i className="fas fa-check"></i>) 
				    } </a>
				</div>
				</div>

                                {/*<ReactTooltip effect="solid" offset={{top: 3}} backgroundColor="black" className="tooltips" />*/}
                                <div className="greeting-container project-top" style={{marginLeft: 5, marginTop: 7, marginBottom: 5}}>
                                    <a 
                                        onClick={()=> {
                                            this.setState({is_sequential: !this.state.currentProject.is_sequential}, () => {
                                                //this.props.gruntman.do( // call a gruntman function
                                                //    "project.update__pstate", { 
                                                //        uid: this.props.uid, // pass it the things vvv
                                                //        id: this.props.id, 
                                                //        is_sequential: this.state.is_sequential
                                                //    }
                                                //);
						this.state.projectObject.isSequential? 
						    this.state.projectObject.parallel()
						    : 
						    this.state.projectObject.sequential()


                                            }); // change the icon
                                        }} 
                                        data-tip="LOCALIZE: Sequencial/Paralellel"
                                        className="perspective-icon" 
                                        style={{borderColor: "var(--task-icon-ring)", 
                                            cursor: "pointer", marginLeft: 5}}>
                                        <i className={this.state.is_sequential ? "fas fa-arrows-alt-v":"fas fa-arrows-alt-h"}
                                            style={{margin: 3, color: "var(--task-icon-text)", 
                                                fontSize: 13, transform: this.state.is_sequential ? "translate(3.5px, -1px)" : "translate(0.25px, -1px)"}}>
                                        </i>
                                    </a>
                                    <a 
                                        data-tip="LOCALIZE: Delete"
                                        className="perspective-icon" 
                                        onClick={()=>{
					    this.state.projectObject.delete()
					    if (this.state.projectObject.isComplete) {
						this.props.history.push("/completed", ""); // go back
						this.props.paginate("/completed");
					    } else {
						this.props.history.push(
						    (this.state.projectObject.data.parent === "" || this.state.projectObject.data.parent === undefined) ? "/upcoming/" : `/projects/${this.state.projectObject.data.parent}`); // go back
						this.props.paginate((this.state.projectObject.data.parent === "" || this.state.projectObject.data.parent === undefined) ? "upcoming" : `projects`, (this.state.projectObject.data.parent === "" || this.state.projectObject.data.parent === undefined) ? undefined : this.state.projectObject.data.parent);}
					}}
                                        style={{borderColor: "var(--task-icon-ring)", 
                                            cursor: "pointer", marginLeft: 5}}>
                                        <i className="fas fa-trash"
                                            style={{margin: 3, color: "var(--task-icon-text)", 
                                                fontSize: 10, transform: "translate(2px, -2px)"}}
                                        >
                                        </i>
                                    </a>
                                    <div className="progressbar">
					{/*<Spring native to={{width: (this.state.weight > 0 ? `${(1-(this.state.pendingWeight/this.state.weight))*100}%`:"0%")}}>
					*/}
                                        <Spring native to={{width: this.state.projectObject.width}}>
                                            {props =>
                                                <animated.div className="pcontent" style={{...props}}>&nbsp;</animated.div>}
                                        </Spring>
                                    </div>
                                </div> 
                            </div>
                        </div>
                    </div>

		    <div style={{marginLeft: 10, marginRight: 10, overflowY: "scroll", overflowX: "hidden"}}>
			<Spinner ready={this.state.initialRenderingDone} />

                        {/*{this.state.pendingWeight}/{this.state.weight}*/}
			{/*<SortableProjectList 
			    //list={this.state.itemList} 
			    list={[]}
			    prefix={this.updatePrefix} 
			    //uid={this.props.uid} 
			    //engine={this.props.engine} 
			    //gruntman={this.props.gruntman} 
			    //availability={this.state.availability} 
			    //datapack={[
			    //    this.state.tagSelects, 
			    //    this.state.projectSelects, 
			    //    this.state.possibleProjects, 
			    //    this.state.possibleProjectsRev, 
			    //    this.state.possibleTags, 
			    //    this.state.possibleTagsRev
			    //]} 
			    //possibleProjects={this.state.possibleProjects} 
			    history={this.props.history} 
			    paginate={this.props.paginate} 
			    //activeTaskRef={this.activeTask} 
			    //parentComplete={this.state.isComplete} 
			    parentComplete={this.state.projectObject.isComplete} 
			    localizations={this.props.localizations}
			    //activeTaskID={this.state.activeTask}
			/>*/}
			{this.state.itemList? this.state.itemList.map((item, i) =>  (

			    (item.databaseBadge == "tasks"? 
				(<div 
				    key={item.id}>
				    <Task 
					cm={this.props.cm} 
					localizations={this.props.localizations} 
					taskObject={item} 
					startingCompleted={this.state.projectObject.isComplete}
				    />

				</div>)

				: 
				    <a className="subproject" 
					//style={{opacity:props.availability[item.content.id]?"1":"0.35"}} 
					onClick={()=>{
					    this.props.paginate("projects", item.id);
					    this.props.history.push(`/projects/${item.id}`)
					}}
				    >
					<div><i className="far fa-arrow-alt-circle-right subproject-icon"/><div style={{display: "inline-block"}}>
					    {item.name}</div></div></a>
			    )

			)) : "" }

			<div style={{marginTop: 10}}>
			    <a className="newbutton" 
				onClick={ async ()=>{
				    //this.props.gruntman.do( // call a gruntman function
				    //    "task.create", { 
				    //        uid: this.props.uid, // pass it the things vvv
				    //        pid: this.props.id, 
				    //    },
				    //    true // bypass updates to manually do it + make it quicker
				    //).then((result)=>{
				    //    let cProject = this.state.currentProject; // get current project
				    //    let avail = this.state.availability; // get current availibilty
				    //    avail[result.tid] = true; // set the current one to be available, temporarily so that people could write in it
				    //    cProject.children.push({type: "task", content:result.tid}); // add our new task
				    //    this.setState({activeTask:result.tid, currentProject: cProject, availability: avail}, () =>  this.activeTask.current._explode() ) // wosh!
				    //}) // call the homebar refresh

				let newTask = await DbTask.create(this.props.cm, "", this.state.projectObject)


				
				
                            }}><div><i className="fas fa-plus-circle subproject-icon"/><div style={{display: "inline-block", fontWeight: 500}}>{this.props.localizations.nb_at}</div></div></a>
                            <a className="newbutton" 
				onClick={
				    //async function() {
				    //    let npid = (await this.props.gruntman.do( // call a gruntman function
				    //        "project.create", { 
				    //            uid: this.props.uid, // pass it the things vvv
				    //            parent: this.props.id, 
				    //        },
				    //    )).pid;
				    //    this.props.history.push(`/projects/${npid}/do`);
				    //}.bind(this)
				    async () => {
					let newProject = await Project.create(this.props.cm, "", this.state.projectObject)
					    //.then(this.props.history.push(`/projects/${newProject.id}/do`))
					this.props.history.push(`/projects/${newProject.id}/do`)

				    }


			    }><div><i className="fas fa-plus-circle subproject-icon"/><div style={{display: "inline-block", fontWeight: 500}}>{this.props.localizations.nb_ap}</div></div></a>

			    <BlkArt visible={(this.state.currentProject.children.length)==0 && this.state.initialRenderingDone} title={"Nothing in this project."} subtitle={"Add a task?"} />
                            <div className="bottom-helper">&nbsp;</div>
                        </div>
                    </div>
                </div>

            </IonPage>
        )
    }
}

export default withIonLifeCycle(withRouter(Projects));

