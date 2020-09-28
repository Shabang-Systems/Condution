import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Upcoming.css';
import './Pages.css';

import Task from './Components/Task';

const autoBind = require('auto-bind/react');

class Upcoming extends Component {
    constructor(props) {
        super(props);

        this.state = {inbox: [], dueSoon: [], possibleProjects:{}, possibleTags:{}, possibleProjectsRev:{}, possibleTagsRev:{}, availability: [], projectSelects:[], tagSelects: [], projectDB: {}};

        this.props.gruntman.registerRefresher((this.refresh).bind(this));

        autoBind(this);
    }

    async refresh() {
        let avail = await this.props.engine.db.getItemAvailability(this.props.uid)
        let pandt = await this.props.engine.db.getInboxandDS(this.props.uid, avail)
        let pPandT = await this.props.engine.db.getProjectsandTags(this.props.uid);
/*        possibleProjects = pPandT[0][0];*/
        //possibleTags = pPandT[1][0];
        //possibleProjectsRev = pPandT[0][1];
        /*possibleTagsRev = pPandT[1][1];*/
        let projectList = [];
        let tagsList = [];

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

        this.setState({inbox: pandt[0], dueSoon: pandt[1], possibleProjects: pPandT[0][0], possibleTags: pPandT[1][0], possibleProjectsRev: pPandT[0][1], possibleTagsRev: pPandT[1][1], availability: avail, projectSelects: projectList, tagSelects: tagsList, projectDB});
    }

    async componentDidMount() {
        await this.refresh();
    }
    
    render() {
        return (
            <IonPage>
                <IonContent>
                    {this.state.inbox.map(id => (
                        <Task tid={id} uid={this.props.uid} engine={this.props.engine} gruntman={this.props.gruntman} availability={this.state.availability[id]} datapack={[this.state.tagSelects, this.state.projectSelects, this.state.possibleProjects, this.state.possibleProjectsRev, this.state.possibleTags, this.state.possibleTagsRev]}/>
                    ))}
                    <hr />
                    {this.state.dueSoon.map(id => (
                        <Task tid={id} uid={this.props.uid} engine={this.props.engine} gruntman={this.props.gruntman} availability={this.state.availability[id]} datapack={[this.state.tagSelects, this.state.projectSelects, this.state.possibleProjects, this.state.possibleProjectsRev, this.state.possibleTags, this.state.possibleTagsRev]}/>
                    ))}

                </IonContent>
            </IonPage>
        )
    }
}

export default Upcoming;

