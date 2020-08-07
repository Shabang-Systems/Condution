import React, { Component } from 'react';
// Firebase App (the core Firebase SDK) is always required and must be listed first

import $ from "jquery";

import './Task.css';

const autoBind = require('auto-bind/react');


class Task extends Component {
    constructor(props) {
        super(props);

        this.state = {};
        autoBind(this);
    }

    async loadTask() {
        let taskObj = await this.props.engine.db.getTaskInformation(this.props.uid, this.props.id);
        console.log(taskObj);
    }

    componentDidMount() {
        this.loadTask();
    }

    render() {
        return (
            <div id="task-${taskId}" className="task thov">
                <div id="task-display-${taskId}" className="task-display" style={{display:"block"}}>
                    <input type="checkbox" id="task-check-${taskId}" className="task-check"/>
                    <label className="task-pseudocheck" id="task-pseudocheck-${taskId}" htmlFor="task-check-${taskId}" style={{fontFamily: "'Inter', sansSerif"}}>&zwnj;</label>
                    <input className="task-name" id="task-name-${taskId}" type="text" autoComplete="off" placeholder="${default_localizations.nt}" defaultValue="${name}" /> {/*This should not necsariy be editable TODO TODO*/}
                    <div className="task-trash task-subicon" id="task-trash-${taskId}" style={{float: "right", display: "none"}}><i className="fas fa-trash"></i></div>
                    <div className="task-repeat task-subicon" id="task-repeat-${taskId}" style={{float: "right", display: "none"}}><i className="fas fa-redo-alt"></i></div>
                </div>
                <div id="task-edit-${taskId}" className="task-edit" style={{display:"none"}}>
                    <textarea className="task-desc" id="task-desc-${taskId}" type="text" autoComplete="off" placeholder="${default_localizations.desc}"></textarea>
                        <div className="task-tools task-tools-top" style={{marginBottom: 9}}>
                            <div className="task-tools-sub task-tools-toggles">
                                <div className="label"><i className="fas fa-flag"></i></div>
                                    <div className="btn-group btn-group-toggle task-flagged" id="task-flagged-${taskId}" data-toggle="buttons" style={{marginRight: "20px !important"}}>
                                        <label className="btn task-flagged" id="task-flagged-no-${taskId}"> <input type="radio" name="task-flagged" className="task-flagged-no" /> <i className="far fa-circle" style={{transform:"translateY(-4px)"}}></i> </label>
                                        <label className="btn task-flagged" id="task-flagged-yes-${taskId}"> <input type="radio" name="task-flagged" className="task-flagged-yes" /> <i className="fas fa-circle" style={{transform:"translateY(-4px)"}}></i> </label>
                                    </div>
                                    <div className="label"><i className="fas fa-globe-americas"></i></div>
                                    <div className="btn-group btn-group-toggle task-floating" id="task-floating-${taskId}" data-toggle="buttons" style={{marginRight: "14px !important"}}>
                                        <label className="btn task-floating" id="task-floating-no-${taskId}"> <input type="radio" name="task-floating"/ > <i className="far fa-circle" style={{transform:"translateY(-4px)"}}></i> </label>
                                        <label className="btn task-floating" id="task-floating-yes-${taskId}"> <input type="radio" name="task-floating" /> <i className="fas fa-circle" style={{transform:"translateY(-4px)"}}></i> </label>
                                    </div>
                                    <span className="task-close-button" id="task-close-button-${taskId}" style={{float:"right", transform: "translateX(20px)"}}><div className="project-action" style={{paddingTop: "4px"}}><i className="far fa-times-circle"></i></div></span>
                                </div>
                                <div className="task-tools-sub task-tools-date">
                                    <div className="label"><i className="far fa-play-circle"></i></div>
                                        <input className="task-defer textbox datebox" id="task-defer-${taskId}" type="text" autoComplete="off" style={{marginRight: "10px"}} />
                                    <i className="fas fa-caret-right" style={{color:"#434d5f", fontSize:13, marginRight: 5}}></i>
                                    <div className="label"><i className="far fa-stop-circle"></i></div>
                                        <input className="task-due textbox datebox" id="task-due-${taskId}" type="text" autoComplete="off" style={{marginRight: 20}} />
                            </div>
                        </div>
                    <div className="task-tools task-tools-bottom">
                        <div className="task-tools-sub task-tools-project">
                            <div className="label"><i className="fas fa-tasks"></i></div>
                            <select className="task-project textbox" id="task-project-${taskId}" style={{marginRight: 14}}>
                            </select>
                        </div>
                        <div className="task-tools-sub task-tools-tags"><div className="label"><i className="fas fa-tags"></i></div>
                            <input className="task-tag textbox" id="task-tag-${taskId}" type="text" defaultValue="" onKeyPress={()=>{this.style.width = ((this.defaultValue.length + 5) * 8) + 'px'}} data-role="tagsinput" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Task;
