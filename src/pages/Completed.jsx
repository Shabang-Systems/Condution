// IMPORTS
import { IonContent, IonPage, IonMenuToggle, isPlatform } from '@ionic/react'; 
import React, { Component, useEffect } from 'react';
import './Completed.css';
import './Pages.css';
import Spinner from './Components/Spinner';
import Task from './Components/Task';
const autoBind = require('auto-bind/react'); // autobind is a lifesaver

/*

 * Sometimes we complete.
 *
 * This is not always correct,
 *
 * so we have this page! 
 *
 * @enquirer

*/

// construtor for rendered object
function TaskObject(type, contents) {
    this.type = type; // set the type to the type (label or task)
    this.contents = contents; // set the contents to the contents (title or id)
}

// define the main component!
class Completed extends Component {
    constructor(props) {
        super(props);

        this.state = {
            taskList: [], // the objects we render
            tasksShown: 1, // track the number of times we have fetched more
            taskCats: ["Today", "Yesterday", "This Week", "This Month", "Even Before"], // define task categories (cats!)
            rendering: true, // define whether or not the element is rendering 
            possibleProjects:{}, // see jacks comments in upcoming 
            possibleTags:{}, 
            possibleProjectsRev:{}, 
            possibleTagsRev:{}, 
            availability: [], 
            projectSelects:[], 
            tagSelects: [], 
            projectDB: {},
            initialRenderingDone: false,
        };

        this.updatePrefix = this.random();
        autoBind(this);
    }

    componentWillUnmount() {
        this.props.gruntman.halt();
    }

    async refresh() {
        let taskArr = []; // define temp array
        let full = await this.props.engine.db.getCompletedTasks(this.props.uid); // get the tasks from the database 

        let avail = await this.props.engine.db.getItemAvailability(this.props.uid) // get availability of items
        let pPandT = await this.props.engine.db.getProjectsandTags(this.props.uid); // get projects and tags
        // loop through the tasks, converting to objects and inserting labels between each cat
        full.forEach((cat, i) => {
            taskArr.push(new TaskObject("label", this.state.taskCats[i])) // each iteration, push the next label to the temp arr
            cat.forEach(task => { // this loops through each cat
                taskArr.push(new TaskObject("task", task)) // convert each task to an object then push it to the temp arr
            })
        });

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
        this.setState({taskList: taskArr, rendering: false, possibleProjects: pPandT[0][0], possibleTags: pPandT[1][0], possibleProjectsRev: pPandT[0][1], possibleTagsRev: pPandT[1][1], availability: avail, projectSelects: projectList, tagSelects: tagsList, projectDB, initialRenderingDone: true}); // once we finish, set the state
        // also set rendering to false. 
        // This is a hacky solution instead of creating an entirely new async function.
    }

    async componentDidMount() {
        this.refresh(); // refresh when the component mounts
        this.props.gruntman.registerRefresher((this.refresh).bind(this));
    }

    handleFetchMore() {
        this.setState({rendering: true}) // trigger loading screen
        const loader =  setTimeout(() => { // set a timeout to set the rendering to false 
            this.setState({rendering: false})

        }, 2);

        const updateTasks =  setTimeout(() => { // set another timeout for the actual task update
            this.setState({tasksShown: this.state.tasksShown+1}) 
            // increment tasksShown by one whenever fetch more is clicked
            // this renders 10 more items 
            this.setState({rendering: false}) // set rendering to false
        }, 1)

        // disclaimer: I do not understand how this works. I was just messing around trying to debug and this happened to work.
        // if it ain't broke, dont fix it? 
    }

    random() { return (((1+Math.random())*0x10000)|0).toString(16)+"-"+(((1+Math.random())*0x10000)|0).toString(16);}

    render() {
        return (
            <IonPage>
                <div style={{overflowY: "scroll"}}>
                    <div className={"page-invis-drag " + (()=>{
                        if (!isPlatform("electron")) // if we are not running electron
                            return "normal"; // normal windowing proceeds
                        else if (window.navigator.platform.includes("Mac")){ // macos
                            return "darwin"; // frameless setup
                        }
                        else if (process.platform === "win32") // windows
                            return "windows"; // non-frameless
                        else 
                            return "windows"; // ummm, it does not know about windows pt.n
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

                        <div className="header-container">
                            <div style={{display: "inline-block"}}>
                                <IonMenuToggle>
                                    <i class="fas fa-bars" 
                                        style={{marginLeft: 20, color: "var(--page-header-sandwich)"}} />
                                </IonMenuToggle> 
                                <h1 className="page-title">
                                    <i style={{paddingRight: 10}} 
                                        className="fas fa-check-circle">
                                    </i>
                                    Completed
                                </h1> 
                            </div>
                        </div>
                        {/* loop through the taskList ten times, multiplyed by the times we have fetched more */}
                        {/* if the cat is empty or the final item rendered is a label, don't render it */}
                        {/* otherwise, render a task */}
                        {/* for the fetch more, if we are currently rendering, render a loading animation. */}
                        {/* Otherwise, render a fetch more.*/}
                        <div style={{overflowY: "scroll"}}>
                            <Spinner ready={this.state.initialRenderingDone} />
                            {this.state.taskList.slice(0, 10*this.state.tasksShown).map((content, i) => (
                                <div style={{marginLeft: 10, marginRight: 10}}>
                                    {(content.type == "label")?  
                                            (this.state.taskList[i+1] ? 
                                                ((this.state.taskList[i+1].type == "label" || this.state.taskList.slice(0, 10*this.state.tasksShown).length == i+1) ? 
                                                "" : <p className="page-label" style={{marginBottom:0}}>{content.contents}</p>) : "") : 
                                                <Task 
                                                    tid={content.contents} 
                                                    startingCompleted={true}
                                                    key={content.contents+"-"+this.updatePrefix} 
                                                    uid={this.props.uid} 
                                                    engine={this.props.engine} 
                                                    gruntman={this.props.gruntman} 
                                                    availability={this.state.availability[content.contents]} 
                                                    datapack={[this.state.tagSelects,
                                                        this.state.projectSelects, 
                                                        this.state.possibleProjects, 
                                                        this.state.possibleProjectsRev, 
                                                        this.state.possibleTags, 
                                                        this.state.possibleTagsRev]}
                                                />
                                    }
                                </div>
                            ))}

                        <div className="fetch-more" > 
                            {/* define the fetch more button */}
                            {this.state.rendering? <p className="loader" >Loading...</p> : <p onClick={this.handleFetchMore}>Fetch more...</p>}
                        </div> 
                    <div className="bottom-helper">&nbsp;</div>
                    </div>
                    </div>
                </div>
            </IonPage>
        )
    }
}

export default Completed;
