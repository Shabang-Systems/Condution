import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet, IonMenuToggle, isPlatform } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Perspectives.css'
import './Pages.css';
import ReactTooltip from 'react-tooltip';
import { withRouter } from "react-router";

import Task from './Components/Task';
import PerspectiveEdit from './Components/PerspectiveEditor';

const autoBind = require('auto-bind/react');



/* 
 * To sort, we give our tasks tags
 *
 * We can also give them flags
 * 
 * With perspectives we filter,
 *
 * To keep our tasks in kilter,
 *
 * Then refactor the code if it lags!
 *
 *
 * @enquirer
 *
 */


class Perspectives extends Component {

    constructor(props) {
        super(props);

        this.state = {
            taskList: [], // what tasks should we display? 
            perspectiveName: "", // whats the perspective name? 
	    perspectiveQuery: {}, // whats the perspective query (whats in the text box)?
	    perspectiveAvail: {}, // whats the perspective availability? 
	    perspectiveTord: {},  // whats the perspective ordering?
	    // not truth or dare. jack doent even know what that is! ^^ 
            showEdit: false, // are we showing 
            possibleProjects:{}, // stuff for tasks to work: see jacks comments in upcoming 
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
        this.repeater = React.createRef(); // what's my repeater? | i.. i dont know what this does...


        // AutoBind!
        autoBind(this);
    }
    showEdit() {
        this.setState({showEdit: true})
    } // util func for showing repeat
    hideEdit() {
        this.setState({showEdit: false});
    } // util func for hiding repeat

    componentWillUnmount() {
        this.props.gruntman.halt(); // when we unmount, halt gruntman? idk what this does  
    }

    async refresh() {
        let possiblePerspectives = await this.props.engine.db.getPerspectives(this.props.uid); // get all possible perspectives
        let perspectiveObject = possiblePerspectives[0][this.props.id] // get the one we want based on page id 
        let taskList = await this.props.engine.perspective.calc(this.props.uid, perspectiveObject.query, perspectiveObject.avail, perspectiveObject.tord) // then get the tasks from that perspective


        let avail = await this.props.engine.db.getItemAvailability(this.props.uid) // get availability of items
        let pPandT = await this.props.engine.db.getProjectsandTags(this.props.uid); // get projects and tags


        let projectList = []; // define the project list
        let tagsList = []; // define the tag list

        for (let pid in pPandT[1][0]) // tag nd project stuff 
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
            taskList: taskList,                           // set the tasklist, 
            perspectiveName: perspectiveObject.name,     // set the perspective name 
	    perspectiveQuery: perspectiveObject.query,  // set the perspective query 
	    perspectiveAvail: perspectiveObject.avail, // set the perspective avail 
	    perspectiveTord: perspectiveObject.tord,  // set the perspective tord 
            possibleProjects: pPandT[0][0],	     // set the project stuff
            possibleTags: pPandT[1][0],		    // set the tag stuff  
            possibleProjectsRev: pPandT[0][1],	   // set more projects stuff  
            possibleTagsRev: pPandT[1][1],	  // set more tags stuff  
            availability: avail,		 // set the avail
            projectSelects: projectList,	// set the project list  
            tagSelects: tagsList,	       // set the tag list
            projectDB 			      // and the project db 
        }); // once we finish, set the state
    }

    updateName(e) {
        if (e) { // if the name if defined, 
            this.props.gruntman.registerScheduler(() => {
                // Register a scheduler to deal with React's onChange
                // check out the FANCYCHANGE in task.jsx
                this.props.gruntman.do( // call a gruntman function
                    "perspective.update__perspective", { 
			// pass it the things 
                        uid: this.props.uid, // the user id 
                        id: this.props.id,  // the perspective id 
                        payload: {name: e.target.value} // the action, setting name to the new value 
                    }
                ).then(this.props.menuRefresh) // call the homebar refresh
            }, `perspective.this.${this.props.id}-update`) // give it a custom id
            this.setState({perspectiveName: e.target.value}) // set the perspectiveName
        } else {console.log(e)}
    } 


    handleDelete() {
	this.props.gruntman.do( // call a gruntman function
	    "perspective.delete__perspective", { 
		uid: this.props.uid, // pass it the user id 
		id: this.props.id, // and the current id 
	    }
	).then(()=>{
	    this.props.menuRefresh(); // refresh menubar
	    this.props.history.push("/upcoming/"); // go back
	    this.props.paginate("upcoming"); // idk man 
	}) // call the homebar refresh
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
		{/* the perspective editor! */}
		{/* pass*/}
                <PerspectiveEdit 
                    reference={this.repeater} 
                    isShown={this.state.showEdit} 
                    onDidDismiss={this.hideEdit}
                    uid={this.props.uid} 
                    engine={this.props.engine} 
                    gruntman={this.props.gruntman}
                    id={this.props.id}
                    perspectiveName={this.state.perspectiveName}
		    query={this.state.perspectiveQuery}
		    avail={this.state.perspectiveAvail}
		    tord={this.state.perspectiveTord}
                    menuRefresh={this.props.menuRefresh}
                    updateName={this.updateName}

                />
                <div className={"page-invis-drag " + (()=>{
                    if (!isPlatform("electron")) // if we are not running electron
                        return "normal"; // normal windowing proceeds
                    else if (window.navigator.platform.includes("Mac")){ // macos
                        return "darwin"; // frameless setup
                    }
                    else if (process.platform === "win32") // windows
                        return "windows"; // non-frameless

                })()}>&nbsp;</div>
                <div className={"page-content " + (()=>{
                    if (!isPlatform("electron")) // if we are not running electron
                        return "normal"; // normal windowing proceeds
                    else if (window.navigator.platform.includes("Mac")){ // macos
                        return "darwin"; // frameless setup
                    }
                    else if (process.platform === "win32") // windows
                        return "windows"; // non-frameless

                })()}>

		    <div className="header-container" >
                        <div style={{display: "inline-block"}}>
                            <div> 
                                <IonMenuToggle>
                                    <i className="fas fa-bars" 
                                        style={{marginLeft: 20, color: "var(--decorative-light-alt"}} />
                                </IonMenuToggle> 
                                <h1 className="page-title">
                                    <i style={{paddingRight: 10}} 
                                        className="fas fa-layer-group">
                                    </i>
                                    <input className="editable-title" 
                                        onChange={(e)=> {e.persist(); this.updateName(e)}}
                                        value={this.state.perspectiveName} // TODO: jack this is hecka hacky
                                    />
                                </h1> 
                                <ReactTooltip effect="solid" offset={{top: 3}} backgroundColor="black" className="tooltips" />

                                <div className="greeting-container" style={{marginLeft: 11, marginTop: 7}}>
                                    <a 
                                        onClick={this.showEdit} 
                                        data-tip="LOCALIZE: Edit"
                                        className="perspective-icon" 
                                        style={{borderColor: "var(--task-checkbox-feature-alt)", cursor: "pointer"}}>
                                        <i className="fas fa-edit" 
                                            style={{margin: 3, color: "var(--task-textbox)", 
                                                fontSize: 10, 
                                                transform: "translate(2px, -2px)"}} 
                                        ></i>
                                    </a>

                                    <a 
                                        onClick={this.handleDelete} 
                                        data-tip="LOCALIZE: Delete"
                                        className="perspective-icon" 
                                        style={{borderColor: "var(--task-checkbox-feature-alt)", 
                                            cursor: "pointer", marginLeft: 5}}>
                                        <i className="fas fa-trash"
                                            style={{margin: 3, color: "var(--task-textbox)", 
                                                fontSize: 10, transform: "translate(2px, -2px)"}}>
                                        </i>
                                    </a>

                                </div> 
                            </div>
                        </div>
                    </div>

                    <div style={{marginLeft: 10, marginRight: 10, overflowY: "scroll"}}>

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
                        <div className="bottom-helper">&nbsp;</div>
                    </div>
                </div>
            </IonPage>
        )
    }
}

export default withRouter(Perspectives);

