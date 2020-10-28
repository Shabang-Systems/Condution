import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet, IonMenuToggle, IonBadge, isPlatform, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Upcoming.scss';
import './Pages.css';

import Task from './Components/Task';

const autoBind = require('auto-bind/react'); // autobind things! 


class Upcoming extends Component { // define the component
    constructor(props) {
        super(props);

        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate()+1);


        this.state = {
            inbox: [], // define the inbox
            dueSoon: [], // whats due soon? 
            possibleProjects:{}, // what are the possible projects? 
            possibleTags:{},  // what are the possible tags?
            possibleProjectsRev:{}, 
            possibleTagsRev:{}, 
            availability: [],  // whats available
            projectSelects:[], 
            tagSelects: [], 
            projectDB: {},
            timeline: [],
        };

        this.updatePrefix = this.random();

        this.props.gruntman.registerRefresher((this.refresh).bind(this));

        autoBind(this);
    }

    async refresh() {
        let avail = await this.props.engine.db.getItemAvailability(this.props.uid) // get availability of items
        let pandt = await this.props.engine.db.getInboxandDS(this.props.uid, avail) // get inbox and due soon 
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

        let timeline = await this.props.engine.db.selectTasksInRange(this.props.uid, new Date(), new Date(2100, 1, 1), true);
        
                            //timeline.push({type: "label", content: timelineRenderedUntil});
                        //for (let task of fTasks)
                            //timeline.push({type:"task", content:task});

                        //this.setState({timelineRenderedUntil, timelineSoFar: timeline});
        // Date same date check https://stackoverflow.com/questions/4428327/checking-if-two-dates-have-the-same-date-info
        
        Date.prototype.isSameDateAs = function(pDate) {
          return (
            this.getFullYear() === pDate.getFullYear() &&
            this.getMonth() === pDate.getMonth() &&
            this.getDate() === pDate.getDate()
          );
        }

        let refrenceDate = new Date();
        let tcontent = [];
        for (let task of timeline) {
            let due = new Date(task[1].due.seconds*1000);
            if (!due.isSameDateAs(refrenceDate)) {
                tcontent.push({type:"label", content: due});
                refrenceDate = due;
            }
            tcontent.push({type:"task", content: task[0]});
        }

        this.setState({inbox: pandt[0], dueSoon: pandt[1], possibleProjects: pPandT[0][0], possibleTags: pPandT[1][0], possibleProjectsRev: pPandT[0][1], possibleTagsRev: pPandT[1][1], availability: avail, projectSelects: projectList, tagSelects: tagsList, projectDB, timeline: tcontent});
    }

    componentDidMount() {
        this.refresh();

        //// Jack and the Misadventures of Hiding the Scrollbar
        //const content = this.pageRef.current;
        //const styles = document.createElement('style');
        //styles.textContent = `
            //.scroll-y::-webkit-scrollbar {
                //display: none;
            //}
        //`;
        {/*content.shadowRoot.appendChild(styles);*/}
    }

    componentWillUnmount() {
        this.props.gruntman.halt();
    }

    random() { return (((1+Math.random())*0x10000)|0).toString(16)+"-"+(((1+Math.random())*0x10000)|0).toString(16);}


    render() {
        return (
            <IonPage>
                <div style={{overflow: "visible"}}>

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
                        <div className="header-container">
                            <div style={{display: "inline-block"}}>
                                <IonMenuToggle><i className="fas fa-bars" style={{marginLeft: 20, color: "var(--decorative-light-alt"}} /></IonMenuToggle> <h1 className="page-title"><i style={{paddingRight: 10}} className="fas fa-chevron-circle-right"></i>Upcoming</h1> 

                                {/*
                        <div className="greeting-datewidget">
                            <div style={{display: "inline-block"}} className="greeting-date">13</div>
                            <div style={{display: "inline-block"}} className="greeting-datename">Wed</div>
                        </div>
                        */}


                                <div className="greeting-container"><span id="greeting">Bontehu</span>, <span id="greeting-name" style={{fontWeight: 600}}>Supergod Jones.</span></div>
                            </div>
                        </div>
                        <div style={{marginLeft: 10, marginRight: 10, overflow: "scroll"}}>
                            <div className="page-label">Unsorted<IonBadge className="count-badge">{this.state.inbox.length}</IonBadge></div>
                            {this.state.inbox.map(id => (
                                <Task tid={id} key={id+"-"+this.updatePrefix} uid={this.props.uid} engine={this.props.engine} gruntman={this.props.gruntman} availability={this.state.availability[id]} datapack={[this.state.tagSelects, this.state.projectSelects, this.state.possibleProjects, this.state.possibleProjectsRev, this.state.possibleTags, this.state.possibleTagsRev]}/>
                            ))}
                            <div className="page-label">Due Soon<IonBadge className="count-badge">{this.state.dueSoon.length}</IonBadge></div>
                            {this.state.dueSoon.map(id => (
                                <Task tid={id} key={id+"-"+this.updatePrefix} uid={this.props.uid} engine={this.props.engine} gruntman={this.props.gruntman} availability={this.state.availability[id]} datapack={[this.state.tagSelects, this.state.projectSelects, this.state.possibleProjects, this.state.possibleProjectsRev, this.state.possibleTags, this.state.possibleTagsRev]}/>
                            ))}
                            {this.state.timeline.map(timelineItem => {
                                if (timelineItem.type === "task")
                                    return <Task tid={timelineItem.content} key={timelineItem.content+"-"+this.updatePrefix} uid={this.props.uid} engine={this.props.engine} gruntman={this.props.gruntman} availability={this.state.availability[timelineItem.content]} datapack={[this.state.tagSelects, this.state.projectSelects, this.state.possibleProjects, this.state.possibleProjectsRev, this.state.possibleTags, this.state.possibleTagsRev]}/>
                                else if (timelineItem.type === "label")
                                    return <div className="timeline-box"><div className="timeline-line-container"><div className="timeline-line">&nbsp;</div></div><div className="timeline-text"><span className="timeline-weekname">{timelineItem.content.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div></div>
                            })}
                        </div>
                    </div>
                </div>
            </IonPage>
        )
    }
}

// Hiding scrollbar, a journey



export default Upcoming;

