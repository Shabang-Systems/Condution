import React, { Component } from 'react';
// Firebase App (the core Firebase SDK) is always required and must be listed first

import $ from "jquery";

import './Task.css';

window.jQuery = $;
window.$ = $;

const autoBind = require('auto-bind/react');
let chrono = require('chrono-node');

require('bootstrap');
require('typeahead.js');
require('bootstrap-tagsinput');
require('select2');




let moment = require('moment-timezone');


class Task extends Component {
    constructor(props) {
        super(props);


        this.state = {name:"", desc:"", projectSelects:[], rightCarrotColor:"#cecece", disabletextbox: false, tagString: "", disabletextbox: ""}
        autoBind(this);
    }

    substringMatcher(strings) {
        return function findMatches(q, cb) {
            let matches, substrRegex;

            matches = [];
            substrRegex = new RegExp(q, 'i');
            $.each(strings, function(i, str) {
                if (substrRegex.test(str)) {
                    matches.push(str);
                }
            });

            cb(matches);
        };
    };

    numDaysBetween(d1, d2) {
        let diff = Math.abs(d1.getTime() - d2.getTime());
        return diff / (1000 * 60 * 60 * 24);
    };

    gtc(colorName) {
        return $("body").css(colorName);
    }

    async loadTask() {
        let taskObj = await this.props.engine.db.getTaskInformation(this.props.uid, this.props.id);
        let pPandT = await this.props.engine.db.getProjectsandTags(this.props.uid);
        let possibleProjects = pPandT[0][0];
        let possibleTags = pPandT[1][0];
        let possibleTagsRev = pPandT[1][1];
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
        let default_localizations = {}; // TODO TODO TODO TODO bring them strings back!
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
        this.setState({name, desc, projectSelects, rightCarrotColor, disabletextbox, tagString,disabletextbox});
        // Set the dates, aaaand set the date change trigger
        $('#task-tag-' + this.props.id).val(this.state.tagString);
        $('#task-tag-' + this.props.id).tagsinput({
            typeaheadjs: {
                name: 'tags',
                source: this.substringMatcher(possibleTagNames)
            }
        });
        // Project Field 
        $('#task-project-'+ this.props.id).select2({
            'width': $(window).width()<576 ? '88%' : '79%',
            searchInputPlaceholder: default_localizations.search_projects,
            placeholder: default_localizations.unsorted,
            allowClear: true
        });
        $('#task-project-' + this.props.id).val(projectID)
        $('#task-project-' + this.props.id).trigger('change');
        $('#task-project-' + this.props.id).on('change', async function () {
            let selection = $(this).select2("data")[0];
            if (selection) {
                let projectSelected = selection.text.split(":: ").join("");
                let projId = selection.id;
                if (project !== undefined) {
                    await this.props.engine.db.dissociateTask(this.props.uid, this.props.id, projectID);
                }
                projectName = selection.value;
                this.props.engine.db.modifyTask(this.props.uid, this.props.id, {project:projId});
                projectID = projId;
                project = projectSelected;
                $('#task-project-' + this.props.id).val(project);
                await this.props.engine.db.associateTask(this.props.uid, this.props.id, projId);
            } else {
                this.props.engine.db.modifyTask(this.props.uid, this.props.id, {project:""});
                this.value = ""
                if (project !== undefined) {
                    await this.props.engine.db.dissociateTask(this.props.uid, this.props.id, projectID);
                }
                project = undefined;
                projectID = "";
            }
        });

        // Set overdue style!
        if (due_current) {
            if (new Date() > due_current) {
                $('#task-pseudocheck-' + this.props.id).addClass("od");
            } else if (this.daysBetween(new Date(), due_current) <= 1) {
                $('#task-pseudocheck-' + this.props.id).addClass("ds");
            }
        }
        if (defer_current) {
            if (new Date() < defer_current) {
                $('#task-name-' + this.props.id).css("opacity", "0.3");
            }
        }
        // Set avaliable Style
        // if (!avalibility[this.props.id] && !sequentialOverride && !isComplete) {
        if (!avalibility[this.props.id] && !isComplete) {
            $('#task-name-' + this.props.id).css("opacity", "0.3");
        }
        // Set flagged style
        if (isFlagged) {
            $("#task-flagged-yes-"+this.props.id).button("toggle")
        } else {
            $("#task-flagged-no-"+this.props.id).button("toggle")
        }
        // Set floating style
        if (isFloating) {
            $("#task-floating-yes-"+this.props.id).button("toggle")
        } else {
            $("#task-floating-no-"+this.props.id).button("toggle")
        }
        if (isComplete)
            $("#task-check-" + this.props.id).click();

        $('#task-check-'+this.props.id).change(function(e) {
            if (this.checked) {
                //TODO: hide active task callback
                //taskManager.hideActiveTask();
                $('#task-name-' + this.props.id).css("color", this.gtc("--task-checkbox"));
                $('#task-name-' + this.props.id).css("text-decoration", "line-through");
                $('#task-pseudocheck-' + this.props.id).css("opacity", "0.6");
                $('#task-' + this.props.id).stop().animate({"margin": $(window).width()<576?"20px 0 20px 0":"5px 0 5px 0"}, 200);
                // TODO: haptics
                // Haptics.notification({type: HapticsNotificationType.SUCCESS});
                $('#task-' + this.props.id).slideUp(300);
                this.props.engine.db.completeTask(this.props.uid, this.props.id).then(function(e) {
                    if (project === undefined) {
                        this.props.engine.db.getInboxTasks(this.props.uid).then(function(e){
                            let iC = e.length;
                            if (iC === 0) {
                                $("#inbox-subhead").slideUp(300);
                                $("#inbox").slideUp(300);
                            } else {
                                $("#unsorted-badge").html(''+iC);
                            }
                        });
                    }
                    //console.error(err);
                    this.props.engine.db.modifyTask(this.props.uid, this.props.id, {completeDate: new Date()});
                });
                if (repeat.rule !== "none" && due) {
                    let rRule = repeat.rule;
                    if (rRule === "daily") {
                        if (defer) {
                            let defDistance = due-defer;
                            due.setDate(due.getDate() + 1);
                            this.props.engine.db.modifyTask(this.props.uid, this.props.id, {isComplete: false, due:due, defer:(new Date(due-defDistance))});
                        } else {
                            due.setDate(due.getDate() + 1);
                            this.props.engine.db.modifyTask(this.props.uid, this.props.id, {isComplete: false, due:due});
                        }

                    } else if (rRule === "weekly") {
                        if (defer) {
                            let rOn = repeat.on;
                            let current = "";
                            let defDistance = due-defer;
                            if (rOn) {
                                while (!rOn.includes(current)) {
                                    due.setDate(due.getDate() + 1);
                                    let dow = due.getDay();
                                    switch (dow) {
                                        case 1:
                                            current = default_localizations.m;
                                            break;
                                        case 2:
                                            current = default_localizations.tu;
                                            break;
                                        case 3:
                                            current = default_localizations.w;
                                            break;
                                        case 4:
                                            current = default_localizations.th;
                                            break;
                                        case 5:
                                            current = default_localizations.f;
                                            break;
                                        case 6:
                                            current = default_localizations.sa;
                                            break;
                                        case 7:
                                            current = default_localizations.su;
                                            break;
                                    }
                                }
                            } else {
                                due.setDate(due.getDate()+7);
                                defer.setDate(defer.getDate()+7);
                            }
                            this.props.engine.db.modifyTask(this.props.uid, this.props.id, {isComplete: false, due:due, defer:(new Date(due-defDistance))});
                        } else {
                            let rOn = repeat.on;
                            if (rOn) {
                                let current = "";
                                while (!rOn.includes(current)) {
                                    due.setDate(due.getDate() + 1);
                                    let dow = due.getDay();
                                    switch (dow) {
                                        case 1:
                                            current = default_localizations.m;
                                            break;
                                        case 2:
                                            current = default_localizations.tu;
                                            break;
                                        case 3:
                                            current = default_localizations.w;
                                            break;
                                        case 4:
                                            current = default_localizations.th;
                                            break;
                                        case 5:
                                            current = default_localizations.f;
                                            break;
                                        case 6:
                                            current = default_localizations.sa;
                                            break;
                                        case 7:
                                            current = default_localizations.su;
                                            break;

                                    }
                                }
                            } else {
                                due.setDate(due.getDate()+7);
                            }
                            this.props.engine.db.modifyTask(this.props.uid, this.props.id, {isComplete: false, due:due});
                        }
                    } else if (rRule === "monthly") {
                        if (defer) {
                            let rOn = repeat.on;
                            let dow = due.getDate();
                            let oDow = due.getDate();
                            let defDistance = due-defer;
                            if (rOn) {
                                while ((!rOn.includes(dow.toString()) && !(rOn.includes("Last") && (new Date(due.getFullYear(), due.getMonth(), due.getDate()).getDate() === new Date(due.getFullYear(), due.getMonth()+1, 0).getDate()))) || (oDow === dow)) {
                                    due.setDate(due.getDate() + 1);
                                    dow = due.getDate();
                                }
                            } else {
                                due.setMonth(due.getMonth()+1);
                            }
                            this.props.engine.db.modifyTask(this.props.uid, this.props.id, {isComplete: false, due:due, defer:(new Date(due-defDistance))});
                        } else {
                            let rOn = repeat.on;
                            if (rOn) {
                                let dow = due.getDate();
                                let oDow = due.getDate();
                                while ((!rOn.includes(dow.toString()) && !(rOn.includes("Last") && (new Date(due.getFullYear(), due.getMonth(), due.getDate()).getDate() === new Date(due.getFullYear(), due.getMonth()+1, 0).getDate()))) || (oDow === dow)) {
                                    due.setDate(due.getDate() + 1);
                                    dow = due.getDate();
                                }
                            } else {
                                due.setMonth(due.getMonth()+1);
                            }
                            this.props.engine.db.modifyTask(this.props.uid, this.props.id, {isComplete: false, due:due});
                        }
                    } else if (rRule === "yearly") {
                        if (defer) {
                            let defDistance = due-defer;
                            due.setFullYear(due.getFullYear() + 1);
                            this.props.engine.db.modifyTask(this.props.uid, this.props.id, {isComplete: false, due:due, defer:(new Date(due-defDistance))});
                        } else {
                            due.setFullYear(due.getFullYear() + 1);
                            this.props.engine.db.modifyTask(this.props.uid, this.props.id, {isComplete: false, due:due});
                        }

                    }
                }
                //reloadPage(true);
                // TODO: refresh callback
            } else {
                // TODO: hide active task callback
                //taskManager.hideActiveTask();
                $('#task-name-' + this.props.id).css("color", this.gtc("--task-checkbox"));
                $('#task-' + this.props.id).stop().animate({"margin": "5px 0 5px 0"}, 200);
                // TODO: haptics
                //Haptics.notification({type: HapticsNotificationType.SUCCESS});
                $('#task-' + this.props.id).slideUp(300);
                this.props.engine.db.completeTask(this.props.uid, this.props.id).then(function(e) {
                });
                this.props.engine.db.modifyTask(this.props.uid, this.props.id, {isComplete: false});
                //reloadPage(true);
            }
            $("#task-trash-" + this.props.id).click(function(e) {
                //if (project === undefined) activeTaskDeInboxed = true;
                this.props.engine.db.deleteTask(this.props.uid, this.props.id).then(function() {
                    //hideActiveTask();
                    $('#task-' + this.props.id).slideUp(150);
                    //reloadPage(true);
                });
            });

            // Repeat popover
            $("#task-repeat-" + this.props.id).click(function(e) {
                // TODO: show repeat
                //showRepeat(this.props.id);
            });

            // Task name change
            $("#task-name-" + this.props.id).change(function(e) {
                this.props.engine.db.modifyTask(this.props.uid, this.props.id, {name:this.value});
            });

            // Task discription change
            $("#task-desc-" + this.props.id).change(function(e) {
                this.props.engine.db.modifyTask(this.props.uid, this.props.id, {desc:this.value});
            });

            // Task tag remove
            $('#task-tag-' + this.props.id).on('itemRemoved', function(e) {
                let removedTag = possibleTagsRev[e.item];
                tagIDs = tagIDs.filter(item => item !== removedTag);
                this.props.engine.db.modifyTask(this.props.uid, this.props.id, {tags:tagIDs});
            });

            // Task tag add
            $('#task-tag-' + this.props.id).on('itemAdded', function(e) {
                let addedTag = possibleTagsRev[e.item];
                if (!addedTag){
                    this.props.engine.db.newTag(this.props.uid, e.item).then(function(addedTag) {
                        tagIDs.push(addedTag);
                        possibleTags[addedTag] = e.item;
                        possibleTags[e.item] = addedTag;
                        this.props.engine.db.modifyTask(this.props.uid, this.props.id, {tags:tagIDs});
                    });
                } else if (!(addedTag in tagIDs)){
                    tagIDs.push(addedTag);
                    this.props.engine.db.modifyTask(this.props.uid, this.props.id, {tags:tagIDs});
                }
            });

            // Remove flagged parameter
            $("#task-flagged-no-" + this.props.id).change(function(e) {
                isFlagged = false;
                this.props.engine.db.modifyTask(this.props.uid, this.props.id, {isFlagged: false});
                // TODO: Unflagged Style? So far flagged is
                // just another filter for perspective selection
            });

            // Add flagged parameter
            $("#task-flagged-yes-" + this.props.id).change(function(e) {
                isFlagged = true;
                this.props.engine.db.modifyTask(this.props.uid, this.props.id, {isFlagged: true});
                // TODO: Flagged Style?
            });

            // Remove floating parameter and calculate dates
            $("#task-floating-no-" + this.props.id).change(function(e) {
                isFloating = false;
                this.props.engine.db.modifyTask(this.props.uid, this.props.id, {isFloating: false});
                defer_current = defer;
                due_current = due;
                //setDates();
            });

            // Add floating parameter and calculate dates
            $("#task-floating-yes-" + this.props.id).change(function(e) {
                isFloating = true;
                this.props.engine.db.modifyTask(this.props.uid, this.props.id, {isFloating: true});
                defer_current = moment(defer).tz(timezone).local(true).toDate();
                due_current = moment(due).tz(timezone).local(true).toDate();
                //setDates();
            });

        });

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
                    <input className="task-name" id={"task-name-"+this.props.id} type="text" autoComplete="off" placeholder="TODO: default_localization.nt" defaultValue={this.state.name} /> {/*This should not necsariy be editable TODO TODO*/}
                    <div className="task-trash task-subicon" id={"task-trash-"+this.props.id} style={{float: "right", display: "none"}}><i className="fas fa-trash"></i></div>
                    <div className="task-repeat task-subicon" id={"task-repeat-"+this.props.id} style={{float: "right", display: "none"}}><i className="fas fa-redo-alt"></i></div>
                </div>
                <div id={"task-edit-"+this.props.id} className="task-edit" style={{display:"none"}}>
                    <textarea className="task-desc" id={"task-desc-"+this.props.id} type="text" autoComplete="off" placeholder="TODO: default_localization.desc" defaultValue={this.state.desc}></textarea>
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
                                        <input className="task-defer textbox datebox" id={"task-defer-"+this.props.id} type="datetime-local" autoComplete="off" style={{marginRight: "10px"}} />
                                    <i className="fas fa-caret-right" style={{color:"#434d5f", fontSize:13, marginRight: 5}}></i>
                                    <div className="label"><i className="far fa-stop-circle"></i></div>
                                        <input className="task-due textbox datebox" id={"task-due-"+this.props.id} type="datetime-local" autoComplete="off" style={{marginRight: 20}} />
                            </div>
                        </div>
                    <div className="task-tools task-tools-bottom">
                        <div className="task-tools-sub task-tools-project">
                            <div className="label"><i className="fas fa-tasks"></i></div>
                            <select className="task-project textbox" id={"task-project-"+this.props.id} style={{marginRight: 14}}>
                                {this.state.projectSelects.map((proj) => {
                                    return <option value={proj.val} key={proj.val}>{proj.text}</option>
                                })};
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
