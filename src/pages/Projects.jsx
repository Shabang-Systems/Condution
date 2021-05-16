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
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

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
            onTaskCreate: false, // are we in the middle of task creation? so, should we hang the refreshes?
	    expandedChild: {expanded: false, id: null},
	    inDragId: "",
        };

        this.updatePrefix = this.random();


        this.activeTask = React.createRef();

        this.name = React.createRef();
	this.checkbox = React.createRef(); // what's my pseudocheck
	this.closer = React.createRef();

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


    componentDidMount() {
	//this.props.gruntman.registerRefresher((this.refresh).bind(this));
        //this.refresh();
        //if (this.props.options === "do") // if we are trying to create
        //    this.name.current.focus(); // focus the name
	this.load()
	//console.log("moounting")
    }

    async load() {
	let project = await Project.fetch(this.props.cm, this.props.id)
	project.hook(this.reloadData);
    project.calculateTreeParams(true);

	this.setState({
	    projectObject: project,
        name: project.name,
	}, this.reloadData)
    }

    async reloadData(he) {
        if (this.state.onTaskCreate) return;
	//let itemList = await this.state.projectObject.execute();
	//this.setState({
	//    itemList: itemList,
	//    initialRenderingDone: true,
	//    //perspectiveName: this.state.perspectiveObject.name
	//});
	//console.log(this.state.itemList)

        let itemList = await this.state.projectObject.async_children;
	this.setState({
        itemList: this.state.projectObject.isComplete ? itemList : itemList.filter((i)=>!i.isComplete),
	    is_sequential: this.state.projectObject.isSequential,
	    //TODO: for some reason this doensnt update the direction of the arrow until you upate the state some other way?
	    initialRenderingDone: true,
        weight: this.state.projectObject.weight,
        pendingWeight: this.state.projectObject.uncompleteWeight,
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

    //async uncompleteProject() {
    //    this.props.gruntman.do( // call a gruntman function
    //        "project.update__uncomplete", { 
    //            uid: this.props.uid, // pass it the things vvv
    //            id: this.props.id, 
    //        }
    //    ).then(this.props.menuRefresh)

    //    //console.log("project, uncompleting", this.state.currentProject)
    //}

    onDragEnd = result => {
	if (!result.destination || (result.destination.droppableId == result.source.droppableId && result.destination.index == result.source.index)) {
	    return
	}

	let itemOrder = this.state.itemList

	let inDrag = itemOrder[result.source.index]
	itemOrder.splice(result.source.index, 1);
	itemOrder.splice(result.destination.index, 0, inDrag);


	itemOrder.forEach((v,i) => {
	    if (v.databaseBadge == "tasks") {
		if (v.order != i) { v.reorder(i) }
	    } else {
		if (v.order != i) { v.reorder(i) }
	    }
	})

	this.setState({perspectives: itemOrder})
    }

    onBeforeDragStart = initials => {
	//console.log(initials)
	//if (this.closer.current) {
	//    this.closer.current.closeTask() 
	//}
	//this.closer.current.closeTask();
    }

    exp = "disableInteractiveElementBlocking"

    renderTask = (item, i, provided, snapshot) => {
	return (
	    <div
		{...provided.draggableProps}
		{...provided.dragHandleProps}
		ref={provided.innerRef}
		key={item.id}
		//style={(snapshot.isDragging)? { top : "auto !important", left: "auto !important"} : {}}
		//style={(snapshot.isDragging)? 
		//{ 
		//top : "auto !important", 
		//left: "auto !important"
		//border: "1px solid red",
		//position: "static"
		//} 
		//: {}}
		className=""
	    >
		<div
		    //style={{border: "1px solid red"}}
		    style={{
			background: `${snapshot.isDragging ? "var(--background-feature)" : ""}`, // TODO: make this work
			borderRadius: "8px",

		    }}
		>
		    <Task
			cm={this.props.cm} 
			localizations={this.props.localizations} 
			taskObject={(item != null && typeof item.then === 'function') ? null : item} 
			asyncObject={(item != null && typeof item.then === 'function') ? item : null} 
			startOpen={(item != null && typeof item.then === 'function')} 
			startingCompleted={this.state.projectObject.isComplete}
			refreshHook={()=>{
			    this.setState({onTaskCreate: false}, ()=>this.reloadData());
			}}
			setExpanded={(e, id) => { this.setState({expandedChild: {expanded: e, id: id}}) }}
			//ref={(item.id == this.state.inDragId)? this.closer : null}
		    />
		</div>
	    </div>
	)
    }

    renderProject = (item, i, provided, snapshot) => {
	//console.log("renddering project")
	return (
	    <div
		{...provided.draggableProps}
		{...provided.dragHandleProps}
		ref={provided.innerRef}
		key={item.id}
		//style={(snapshot.isDragging)? { top : "auto !important", left: "auto !important"} : {}}
		//style={(snapshot.isDragging)? 
		//{ 
		//top : "auto !important", 
		//left: "auto !important"
		//border: "1px solid red",
		//position: "static"
		//} 
		//: {}}
	    >
		<a className="subproject" 
		    style={{
			opacity:item.available?"1":"0.35",
			background: `${snapshot.isDragging ? "var(--background-feature)" : ""}`
		    }}
		    onClick={()=>{
			this.props.paginate("projects", item.id);
			this.props.history.push(`/projects/${item.id}`)
		    }}
		>
		    <div><i className="far fa-arrow-alt-circle-right subproject-icon"/><div style={{display: "inline-block"}}>
			{item.name}</div></div></a>
	    </div>


	)
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
                        this.setState({animClass: "complete-anim"})
                        setTimeout(() => {
                            this.setState({animClass: ""}, ()=>{
                                if (this.state.projectObject.data.isComplete)
                                    this.state.projectObject.uncomplete()
                                else if (!this.state.projectObject.data.isComplete)
                                    this.state.projectObject.complete()
                            });
                        }, 100);


						//} else {
						//console.log("completing")
						//this.state.projectObject.complete()
							//.then(console.log(this.state.projectObject.isComplete))
						//}
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
                                        onClick={async ()=>{
					    await this.state.projectObject.delete()
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
                                        <Spring native to={{width: (this.state.weight > 0 ? `${(1-(this.state.pendingWeight/this.state.weight))*100}%`:"0%")}}>
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

			<DragDropContext 
			    onDragEnd={this.onDragEnd}
			    onBeforeCapture={this.onBeforeDragStart}
			>
			    <Droppable droppableId={"prjlst"}
				renderClone={(provided, snapshot, rubric) => (
					<div>
						{(this.state.itemList[rubric.source.index].databaseBadge == "tasks")? 
						    this.renderTask(this.state.itemList[rubric.source.index], rubric.source.index, provided, snapshot)
						: 
						    this.renderProject(this.state.itemList[rubric.source.index], rubric.source.index, provided, snapshot)
						}
					    </div>
					    
					
					)}
					>
				{(provided, snapshot) => ( 
				    <div
					ref = {provided.innerRef}
					{...provided.droppableProps}
					style = {{
					}}
				    >

					{this.state.itemList? this.state.itemList.map((item, i) =>  (
					    <Draggable 
						disableInteractiveElementBlocking={(item.id == this.state.expandedChild.id)? !this.state.expandedChild.expanded : true}
						isDragDisabled={(item.id == this.state.expandedChild.id)? this.state.expandedChild.expanded : false}
						draggableId={item.id} key={item.id} index={i}
					    >
						{(provided, snapshot) => (
						    <div
							{...provided.draggableProps}
							{...provided.dragHandleProps}
							ref={provided.innerRef}
							key={item.id}
							style={(snapshot.isDragging)? 
								{ 
								    //border: "1px solid red",
								    //position: "static"
								} 
								: {}}
						    >

							{((item.databaseBadge == "tasks" || (item != null && typeof item.then === 'function'))? 
							    this.renderTask(item, i, provided, snapshot)
							: 
							    this.renderProject(item, i, provided, snapshot)
							)}

						    </div>
						)}
					    </Draggable>
					)
					) : "" }

					    {provided.placeholder}

				    </div>
				)}
			    </Droppable>
			</DragDropContext>

			<div style={{marginTop: 10}}>
			    <a className="newbutton" 
				onClick={ ()=>{
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

				    let newTask = DbTask.create(this.props.cm, "", this.state.projectObject)
				    this.setState({itemList:[...this.state.itemList, newTask], onTaskCreate: true});


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

			    <BlkArt visible={(this.state.itemList)==0 && this.state.initialRenderingDone} title={"Nothing in this project."} subtitle={"Add a task?"} />
			    <div className="bottom-helper">&nbsp;</div>
			</div>
		    </div>
		</div>

	    </IonPage>
        )
    }
}

export default withIonLifeCycle(withRouter(Projects));

