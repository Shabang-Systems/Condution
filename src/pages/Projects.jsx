import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet, IonMenuToggle, IonBadge, isPlatform } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Upcoming.css';
import './Pages.css';

import ReactTooltip from 'react-tooltip';

import Task from './Components/Task';

import Datebar from './Components/Datebar';

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
            is_sequential: false,
            currentProject: {children:[]}
        };

        this.updatePrefix = this.random();

        this.props.gruntman.registerRefresher((this.refresh).bind(this));

        autoBind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // flush styles
        if (prevProps.id !== this.props.id) // if we updated the defer date
            this.refresh(); // switching between perspectives are a prop update and not a rerender
        // so we want to refresh the perspective that's rendered
    }

    async refresh() {
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
        this.updatePrefix = this.random();
        let cProject = (await views.props.engine.db.getProjectStructure(this.props.uid, this.props.id, false));
        this.setState({name:pPandT[0][0][this.props.id], possibleProjects: pPandT[0][0], possibleTags: pPandT[1][0], possibleProjectsRev: pPandT[0][1], possibleTagsRev: pPandT[1][1], availability: avail, projectSelects: projectList, tagSelects: tagsList, projectDB, currentProject: cProject, is_sequential: cProject.is_sequential});
    }

    componentDidMount() {
        this.refresh();
    }

    random() { return (((1+Math.random())*0x10000)|0).toString(16)+"-"+(((1+Math.random())*0x10000)|0).toString(16);}

    updateName(e) {
        if (e) {
            this.props.gruntman.registerScheduler(() => { 
                // Register a scheduler to deal with React's onChange
                // check out the FANCYCHANGE in task.jsx
                this.props.gruntman.do( // call a gruntman function
                    "project.update__name", { 
                        uid: this.props.uid, // pass it the things vvv
                        id: this.props.id, 
                        name: e.target.value
                    }
                ).then(this.props.menuRefresh) // call the homebar refresh
            }, `project.this.${this.props.id}-update`) // give it a custom id
            this.setState({name: e.target.value})
        } else { console.log(e)}
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
                                        className="fas fa-tasks">
                                    </i>
                                    <input className="editable-title" 
                                        onChange={(e)=> {e.persist(); this.updateName(e)}}
                                        value={this.state.name} // TODO: jack this is hecka hacky
                                        style={{transform: "transformY(-2px)"}}
                                    />
                                </h1> 
                                <ReactTooltip effect="solid" offset={{top: 3}} backgroundColor="black" className="tooltips" />

                                <div className="greeting-container" style={{marginLeft: 5, marginTop: 7}}>
                                    <a 
                                        onClick={()=> {
                                            this.setState({is_sequential: !this.state.currentProject.is_sequential}, () => {
                                                this.props.gruntman.do( // call a gruntman function
                                                    "project.update__pstate", { 
                                                        uid: this.props.uid, // pass it the things vvv
                                                        id: this.props.id, 
                                                        is_sequential: this.state.is_sequential
                                                    }
                                                );
                                            }); // change the icon
                                        }} 
                                        data-tip="LOCALIZE: Sequencial/Paralellel"
                                        className="perspective-icon" 
                                        style={{borderColor: "var(--task-checkbox-feature-alt)", 
                                            cursor: "pointer", marginLeft: 5}}>
                                        <i className={this.state.is_sequential ? "fas fa-arrows-alt-v":"fas fa-arrows-alt-h"}
                                            style={{margin: 3, color: "var(--task-textbox)", 
                                                fontSize: 13, transform: this.state.is_sequential ? "translate(3.5px, -1px)" : "translate(0.25px, -1px)"}}>
                                        </i>
                                    </a>
                                    <a 
                                        onClick={()=>console.log("HUX!")} 
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

                    <div style={{marginLeft: 10, marginRight: 10}}>
                        {this.state.currentProject.children.map(item => {
                            if (item.type === "task")
                                return (
                                    <Task 
                                        tid={item.content}
                                        key={item.content+"-"+this.updatePrefix} 
                                        uid={this.props.uid} 
                                        engine={this.props.engine} 
                                        gruntman={this.props.gruntman} 
                                        availability={this.state.availability[item.content]} 
                                        datapack={[
                                            this.state.tagSelects, 
                                            this.state.projectSelects, 
                                            this.state.possibleProjects, 
                                            this.state.possibleProjectsRev, 
                                            this.state.possibleTags, 
                                            this.state.possibleTagsRev
                                        ]}
                                    />
                                )
                            else if (item.type === "project")
                                return (<div>{this.state.possibleProjects[item.content.id]}</div>)
                        })}
                    </div>
                </div>

            </IonPage>
        )
    }
}

export default Projects;

