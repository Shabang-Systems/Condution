import React, { Component } from 'react';
// Firebase App (the core Firebase SDK) is always required and must be listed first

import $ from "jquery";

import './Task.css';

const autoBind = require('auto-bind/react');

let moment = require('moment-timezone');


class Task extends Component {
    constructor(props) {
        super(props);


        //TODO TODO TODO USE STATES!
        
        this.state = {name:"", desc:"", projectSelects:[], rightCarrotColor:"#cecece", disabletextbox: false, tagString: ""}

        autoBind(this);
    }

    async loadTask() {
        let taskObj = await this.props.engine.db.getTaskInformation(this.props.uid, this.props.id);
        let pPandT = await this.props.engine.db.getProjectsandTags(this.props.uid);
        let possibleProjects = pPandT[0][0];
        let possibleTags = pPandT[1][0];
        let avalibility = await this.props.engine.db.getItemAvailability(this.props.uid);
        let view = this;
        let projectDB = await (async function() {
            let pdb = [];
            let topLevels = (await view.props.engine.db.getTopLevelProjects(view.props.uid))[0];
            for (let key in topLevels) {
                pdb.push(await view.props.engine.db.getProjectStructure(view.props.uid, key, true));
            }
            return pdb;
        }());

        let projectID = taskObj.project;
        let tagIDs = taskObj.tags;
        let isFlagged = taskObj.isFlagged;
        let isFloating = taskObj.isFloating;
        let name = taskObj.name;
        let desc = taskObj.desc;
        let timezone = taskObj.timezone;
        let repeat = taskObj.repeat;
        let isComplete = taskObj.isComplete;
        let defer;
        let due;
        if (taskObj.defer) {
            defer = new Date(taskObj.defer.seconds*1000);
        }
        if (taskObj.due) {
            due = new Date(taskObj.due.seconds*1000);
        }
        let disabletextbox = $(window).width()<576 ? `readonly="readonly"` : "";
        // -------------------------------------------------------------------------------
        // Part 1: data parsing!
        // The Project
        let project = possibleProjects[projectID];
        let projectName = "";
        // Project select options
        let projectSelects = [];
        //let projectSelectArray = [];
        let buildSelectString = function(p, level) {
            if (!level) {
                level = ""
            }
            //let pss = `<option value="${p.id}">` + level + possibleProjects[p.id] + "</option>";
            let selects = [{val: p.id, text: level+possibleProjects[p.id]}];
            //projectSelectArray.push({val: p.id, text: level+possibleProjects[p.id]});
            if (p.id === projectID)
                projectName = (level + possibleProjects[p.id]);
            if (p.children) {
                for (let e of p.children) {
                    if (e.type === "project") {
                        selects = [...selects, ...buildSelectString(e.content, level+":: ")];
                    }
                }
            }
            return selects;
        };
        for (let proj of projectDB) {
            projectSelects = [...projectSelects, ...buildSelectString(proj)];
        }
        // Tag select options
        let possibleTagNames = function() {
            let res = [];
            for (let key in possibleTags) {
                res.push(possibleTags[key]);
            }
            return res;
        }();
        // Actual tag string
        let tagString = "";
        for (let i in tagIDs) {
            tagString = tagString + possibleTags[tagIDs[i]] + ",";
        }
        // Calculate due date
        let defer_current;
        let due_current;
        if(isFloating) {
            if (defer) {
                defer_current = moment(defer).tz(timezone).local(true).toDate();
            } else {
                defer_current = undefined;
            }
            if (due) {
                due_current = moment(due).tz(timezone).local(true).toDate();
            } else {
                due_current = undefined;
            }
        } else {
            defer_current = defer;
            due_current = due;
        }
        // The color of the carrot
        let rightCarrotColor =  $("body").css("--decorative-light");
        let taskId = this.props.id;
        this.setState({name, desc, projectSelects, rightCarrotColor, disabletextbox, tagString});

    }

    componentDidMount() {
        this.loadTask();
    }

    render() {
        return (
            <div id={"task-"+this.props.id} className="task thov">
                <div id={"task-display-"+this.props.id} className="task-display" style={{display:"block"}}>
                    <input type="checkbox" id={"task-check-"+this.props.id} className="task-check"/>
                    <label className="task-pseudocheck" id={"task-pseudocheck-"+this.props.id} htmlFor={"task-check-"+this.props.id} style={{fontFamily: "'Inter', sansSerif"}}>&zwnj;</label>
                    <input className="task-name" id={"task-name-"+this.props.id} type="text" autoComplete="off" placeholder="${default_localizations.nt}" defaultValue="${name}" /> {/*This should not necsariy be editable TODO TODO*/}
                    <div className="task-trash task-subicon" id={"task-trash-"+this.props.id} style={{float: "right", display: "none"}}><i className="fas fa-trash"></i></div>
                    <div className="task-repeat task-subicon" id={"task-repeat-"+this.props.id} style={{float: "right", display: "none"}}><i className="fas fa-redo-alt"></i></div>
                </div>
                <div id={"task-edit-"+this.props.id} className="task-edit" style={{display:"none"}}>
                    <textarea className="task-desc" id={"task-desc-"+this.props.id} type="text" autoComplete="off" placeholder="${default_localizations.desc}"></textarea>
                        <div className="task-tools task-tools-top" style={{marginBottom: 9}}>
                            <div className="task-tools-sub task-tools-toggles">
                                <div className="label"><i className="fas fa-flag"></i></div>
                                    <div className="btn-group btn-group-toggle task-flagged" id={"task-flagged-"+this.props.id} data-toggle="buttons" style={{marginRight: "20px !important"}}>
                                        <label className="btn task-flagged" id={"task-flagged-no-"+this.props.id}> <input type="radio" name="task-flagged" className="task-flagged-no" /> <i className="far fa-circle" style={{transform:"translateY(-4px)"}}></i> </label>
                                        <label className="btn task-flagged" id={"task-flagged-yes-"+this.props.id}> <input type="radio" name="task-flagged" className="task-flagged-yes" /> <i className="fas fa-circle" style={{transform:"translateY(-4px)"}}></i> </label>
                                    </div>
                                    <div className="label"><i className="fas fa-globe-americas"></i></div>
                                    <div className="btn-group btn-group-toggle task-floating" id={"task-floating-"+this.props.id} data-toggle="buttons" style={{marginRight: "14px !important"}}>
                                        <label className="btn task-floating" id={"task-floating-no-"+this.props.id}> <input type="radio" name="task-floating"/ > <i className="far fa-circle" style={{transform:"translateY(-4px)"}}></i> </label>
                                        <label className="btn task-floating" id={"task-floating-yes-"+this.props.id}> <input type="radio" name="task-floating" /> <i className="fas fa-circle" style={{transform:"translateY(-4px)"}}></i> </label>
                                    </div>
                                </div>
                                <div className="task-tools-sub task-tools-date">
                                    <div className="label"><i className="far fa-play-circle"></i></div>
                                        <input className="task-defer textbox datebox" id={"task-defer-"+this.props.id} type="text" autoComplete="off" style={{marginRight: "10px"}} />
                                    <i className="fas fa-caret-right" style={{color:"#434d5f", fontSize:13, marginRight: 5}}></i>
                                    <div className="label"><i className="far fa-stop-circle"></i></div>
                                        <input className="task-due textbox datebox" id={"task-due-"+this.props.id} type="text" autoComplete="off" style={{marginRight: 20}} />
                            </div>
                        </div>
                    <div className="task-tools task-tools-bottom">
                        <div className="task-tools-sub task-tools-project">
                            <div className="label"><i className="fas fa-tasks"></i></div>
                            <select className="task-project textbox" id={"task-project-"+this.props.id} style={{marginRight: 14}}>
                            </select>
                        </div>
                        <div className="task-tools-sub task-tools-tags"><div className="label"><i className="fas fa-tags"></i></div>
                            <input className="task-tag textbox" id={"task-tag-"+this.props.id} type="text" defaultValue="" onKeyPress={()=>{this.style.width = ((this.defaultValue.length+5)*8)+"px"}} data-role="tagsinput" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Task;
