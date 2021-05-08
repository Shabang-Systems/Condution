import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet, IonMenuToggle, IonBadge, isPlatform, IonInfiniteScroll, IonInfiniteScrollContent, IonPopover } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Upcoming.scss';
import './Pages.css';

import Spinner from './Components/Spinner';

//import { SortableTaskList } from './Components/Sortable';
import { SortableTaskList } from './Components/Sortable';

import Task from './Components/Task';
import BlkArt from './Components/BlkArt';

import T from "../backend/src/Objects/Task.ts";
import W from "../backend/src/Objects/Workspace.ts";
import { InboxWidget, DueSoonWidget, TimelineWidget }  from "../backend/src/Widget.ts";

import WorkspaceModal from './Components/WorkspaceModal';

const autoBind = require('auto-bind/react'); // autobind things! 

/* 
 * The lack of a poem here is scathing
 * so I thought
 * I'd contribute.
 *
 * The homepage needs no introduction
 * For it explains itself in production.
 *
 * But alas,
 * I still write this.
 *
 * What for?
 *
 * @Jemoka
 *
 */


class Upcoming extends Component { // define the component
    constructor(props) {
        super(props);

        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate()+1);

        let greetings = this.props.localizations.greetings_setA;

        this.state = {
            inbox: [], // define the inbox
            dueSoon: [], // whats due soon? 
            timeline: [],
            timelineShown: false,
            greeting: greetings[Math.floor(Math.random() * greetings.length)],
            workspaces: [],
            workspacesPopoverShown: [false, null],
            workspaceModalShown: false,
            currentlyEditedWorkspace: null,
            currentWorkspace: this.props.localizations.personal_workspace,
            initialRenderingDone: false,
            inboxWidget: new InboxWidget(this.props.cm),
            dsWidget: new DueSoonWidget(this.props.cm),
            timelineWidget: new TimelineWidget(this.props.cm),
        };

        this.updatePrefix = this.random();

        this.workspaceButton = React.createRef();


        autoBind(this);
    }

    async refresh() {
//        let avail = await this.props.engine.db.getItemAvailability(this.props.uid) // get availability of items
        //let pandt = await this.props.engine.db.getInboxandDS(this.props.uid, avail) // get inbox and due soon 
        //let pPandT = await this.props.engine.db.getProjectsandTags(this.props.uid); // get projects and tags


        //let projectList = []; // define the project list
        //let tagsList = []; // define the tag list

        //for (let pid in pPandT[1][0]) 
            //tagsList.push({value: pid, label: pPandT[1][0][pid]});
        //let views = this;
        //let projectDB = await (async function() {
            //let pdb = [];
            //let topLevels = (await views.props.engine.db.getTopLevelProjects(views.props.uid))[0];
            //for (let key in topLevels) {
                //pdb.push(await views.props.engine.db.getProjectStructure(views.props.uid, key, true));
            //}
            //return pdb;
        //}());

        //let buildSelectString = function(p, level) {
            //if (!level)
                //level = ""
            //projectList.push({value: p.id, label: level+pPandT[0][0][p.id]})
            //if (p.children)
                //for (let e of p.children)
                    //if (e.type === "project")
                        //buildSelectString(e.content, level+":: ");
        //};
        //projectDB.map(proj=>buildSelectString(proj));

        //this.up//datePrefix = this.random();

        //let timeline = await this.props.engine.db.selectTasksInRange(this.props.uid, new Date(), new Date(2100, 1, 1), true);
        
                            ////timeline.push({type: "label", content: timelineRenderedUntil});
                        ////for (let task of fTasks)
                            ////timeline.push({type:"task", content:task});

                        ////this.setState({timelineRenderedUntil, timelineSoFar: timeline});
        //// Date same date check https://stackoverflow.com/questions/4428327/checking-if-two-dates-have-the-same-date-info
        //timeline = timeline.filter((x)=>!pandt[1].includes(x[0]))
        //Date.prototype.isSameDateAs = function(pDate) {
          //return (
            //this.getFullYear() === pDate.getFullYear() &&
            //this.getMonth() === pDate.getMonth() &&
            //this.getDate() === pDate.getDate()
          //);
        //}

        //let refrenceDate = new Date();
        //let tcontent = [];
        //for (let task of timeline) {
            //let due = new Date(task[1].due.seconds*1000);
            //if (!due.isSameDateAs(refrenceDate)) {
                //tcontent.push({type:"label", content: due});
                //refrenceDate = due;
            //}
            //tcontent.push({type:"task", content: task[0]});
        //}

        //let n = this.props.localizations.personal_workspace;
        //let workspaceNames = []

        //if (this.props.authType === "firebase") {
            //let workspaces = await this.props.engine.db.getWorkspaces(this.props.actualUID);

            //workspaceNames = await Promise.all(workspaces.map(async function(e){
                //let name = (await views.props.engine.db.getWorkspace(e)).meta.name
                //if (e===views.props.uid)
                    //n = name;
                //return [e, name]
            //}));
        //}

        //this.setState({inbox: pandt[0], dueSoon: pandt[1], possibleProjects: pPandT[0][0], possibleTags: pPandT[1][0], possibleProjectsRev: pPandT[0][1], possibleTagsRev: pPandT[1][1], availability: avail, projectSelects: projectList, tagSelects: tagsList, projectDB, timeline: tcontent, workspaces: workspaceNames, currentWorkspace: n, initialRenderingDone: true});
        let inbox = (await this.state.inboxWidget.execute());
        let ds = (await this.state.dsWidget.execute());
        let dsids = ds.map(i=>i.id);
        inbox = inbox.filter(i=>!dsids.includes(i.id));
        this.setState({initialRenderingDone: true, inbox: (await this.state.inboxWidget.execute()), inbox: inbox, dueSoon: ds, timeline: (await this.state.timelineWidget.execute()), workspaces:(await this.props.cm.workspaces())});
    }

    componentDidMount() {
        this.refresh();
        this.state.inboxWidget.hook(this.refresh);
        this.state.dsWidget.hook(this.refresh);
        this.props.cm.hookInvite(this.refresh);
        //this.props.gruntman.registerRefresher((this.refresh).bind(this));
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.uid != this.props.uid) 
            this.refresh();
    }

    componentWillUnmount() {
        this.state.inboxWidget.unhook(this.refresh);
        this.state.dsWidget.unhook(this.refresh);
        this.props.cm.unhookInvite(this.refresh);
    }

    random() { return (((1+Math.random())*0x10000)|0).toString(16)+"-"+(((1+Math.random())*0x10000)|0).toString(16);}


    render() {
        return (
            <IonPage>
                <div style={{overflow: "hidden"}}>
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
                            return "windows"; // ummm, it does not know about windows pt0

                    })()}>
                        <WorkspaceModal cm={this.props.cm} localizations={this.props.localizations} isShown={this.state.workspaceModalShown} currentWorkspace={this.state.currentlyEditedWorkspace} onDidDismiss={()=>this.setState({workspaceModalShown: false})} getUserByEmail={this.props.getUserByEmail}/>
                        <div className="header-container" onTouchMove={(e)=>e.preventDefault()}>
                            <div style={{display: "inline-block"}}>
                                <IonMenuToggle><i className="fas fa-bars" style={{marginLeft: 20, color: "var(--page-header-sandwich)"}} /></IonMenuToggle> <h1 className="page-title"><i style={{paddingRight: 10}} className="fas fa-chevron-circle-right"></i>{this.props.localizations.upcoming}</h1> 

                                <div style={{display: "inline-block", background: "var(--decorative-light)", width: 1, transform:"translate(-13.5px, 4px)", height: 20}}>&nbsp;</div> 
                            <div className="greeting-datewidget">
                                <div style={{display: "inline-block"}} className="greeting-date">{(new Date()).getDate()}</div>
                                <div style={{display: "inline-block"}} className="greeting-datename">{new Date().toLocaleString(this.props.localizations.getLanguage(), {  weekday: 'long' })}</div>
                            </div>
                            


                                <div className="greeting-container"><span id="greeting">{this.state.greeting}</span> <span id="greeting-name" style={{fontWeight: 600, marginRight: 10}}>{this.props.displayName}</span><a className="workspace-name"  style={{display: this.props.authType==="firebase"?"inline-block":"none"}} onClick={(e)=>this.setState({workspacesPopoverShown: [true, e.nativeEvent]})}>{this.state.currentWorkspace}</a></div>
                            </div>
                        </div>
                        <IonPopover
                            showBackdrop={false}
                            ref={this.workspaceButton}
                            isOpen={this.state.workspacesPopoverShown[0]}
                            cssClass='workspaces-popover'
                            mode="md" 
                            onDidDismiss={e => this.setState({workspacesPopoverShown: [false, null]})}
                            event={this.state.workspacesPopoverShown[1]}
                        >
                            <div><div className="workspace-name-container">
                                <div className="workspace-name-selection" onClick={()=>{
                                    this.workspaceButton.current.dismiss();
                                    this.props.cm.usePersonalWorkspace();
                                    this.setState({currentWorkspace: this.props.localizations.personal_workspace});
                                }}><i className="fas fa-stream" style={{marginRight: 10}} />{this.props.localizations.personal_workspace}</div></div>
                                {this.state.workspaces.map((val)=><div key={val.id} className="workspace-name-container">
                                <div onClick={()=>{
                                    this.workspaceButton.current.dismiss();
                                    this.props.cm.useWorkspace(val);
                                    this.setState({currentWorkspace: val.name});
                                }} className="workspace-name-selection"><i className="fas fa-stream" style={{marginRight: 10}} />{val.name}</div><a className="workspace-edit fas fa-pen" onClick={()=>{
                                    this.workspaceButton.current.dismiss();
                                    this.setState({currentlyEditedWorkspace: val, workspaceModalShown: true});
                                }} />
                                </div>)}
                                <div className="workspace-name-container" style={{borderTop: "1px solid var(--decorative-light)", fontWeight: 600}}><div className="workspace-name-selection" onClick={(async function(){
                                    // TODO
                                    let id = await this.props.engine.db.generateWorkspace(this.props.actualUID, this.props.email);
                                    this.workspaceButton.current.dismiss();
                                    this.props.switch("workspace", id);
                                    this.setState({currentlyEditedWorkspace: id, workspaceModalShown: true});
                                }).bind(this)}><i className="fas fa-plus-circle" style={{marginRight: 10}} />{this.props.localizations.new_workspace}</div></div>
                            </div>
                        </IonPopover>
                            <div style={{marginLeft: 10, marginRight: 10, overflowY: "scroll", flexGrow: 5}}>
                                <Spinner ready={this.state.initialRenderingDone} />
                                <div>
                                    {(()=>{
                                        if (this.state.inbox.length > 0)
                                            return <div className="page-label">{this.props.localizations.unsorted}<IonBadge className="count-badge">{this.state.inbox.length}</IonBadge></div>
                                    })()}
                                    {this.state.inbox.map(t=>
                                        (
                                        <Task 
                                            key={t.id}
                                            cm={this.props.cm} 
                                            localizations={this.props.localizations} 
                                            taskObject={t} 
                                        />
                                    ))}
                                    {/*<SortableTaskList list={this.state.inbox} prefix={this.updatePrefix} uid={this.props.uid} engine={this.props.engine} gruntman={this.props.gruntman} availability={this.state.availability} datapack={[this.state.tagSelects, this.state.projectSelects, this.state.possibleProjects, this.state.possibleProjectsRev, this.state.possibleTags, this.state.possibleTagsRev]}/>*/}
                                </div>
                                <div>
                                    {(()=>{
                                        if (this.state.dueSoon.length > 0)
                                            return <div className="page-label">{this.props.localizations.ds}<IonBadge className="count-badge">{this.state.dueSoon.length}</IonBadge></div>
                                    })()}
                                    {this.state.dueSoon.map(t=>
                                        (
                                            <Task 
                                                key={t.id}
                                                cm={this.props.cm} 
                                                localizations={this.props.localizations} 
                                                taskObject={t} 
                                            />
                                        ))}

                                </div>
                            <div>
                                <div className="timeline-button">
                                    <a 
                                        onClick={()=>
                                                this.setState({timelineShown: !this.state.timelineShown})} 
                                        // for some reason, css classes don't work, so we have to style here
                                        // @jack? why don't they? well, styling here's fine anyways. most likely b/c they are overrode by className=timeline-button
                                        style={{
                                            marginLeft: 15,
                                            marginTop: 20, 
                                            display: "inline-block", 
                                            fontWeight: 600, 
                                            fontSize: 13, 
                                            //color: "var(--decorative-light-alt)", 
                                            cursor: "pointer"}}
                                    >
                                        <i 
                                            className="fas fa-calendar-week" 
                                            style={{paddingRight: 5}}
                                        ></i> {this.state.timelineShown? this.props.localizations.hide : this.props.localizations.show} {this.props.localizations.timeline}</a>
                                </div> 
                                {
                                    (()=>{
                                        if (this.state.timelineShown)
                                            return this.state.timeline.map(timelineItem => {
                                                if (timelineItem.type === "task")
                                                    return (<Task 
                                                        key={timelineItem.content.id}
                                                        cm={this.props.cm} 
                                                        localizations={this.props.localizations} 
                                                        taskObject={timelineItem.content} 
                                                    />)

                                                else if (timelineItem.type === "label")
                                                    return <div key={`timeline-${timelineItem.content.getTime()}-${this.random()}`} className="timeline-box"><div className="timeline-line-container"><div className="timeline-line">&nbsp;</div></div><div className="timeline-text"><span className="timeline-weekname">{timelineItem.content.toLocaleDateString(this.props.localizations.getLanguage(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div></div>


                                            })
                                    })()
                                }
                            </div>
                                <BlkArt visible={(this.state.inbox.length+this.state.dueSoon.length)==0 && !this.state.timelineShown && this.state.initialRenderingDone} title={"Nothing upcoming."} subtitle={"Expand the timeline to see more!"} />
                            <div className="bottom-helper">&nbsp;</div>
                        </div>
                    </div>
                </div>
            </IonPage>
        )
    }
}

// Hiding scrollbar, a journey



export default Upcoming;

