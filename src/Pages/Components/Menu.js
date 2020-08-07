import React, { Component } from 'react';
// Firebase App (the core Firebase SDK) is always required and must be listed first

import $ from "jquery";


import './Menu.css';

const autoBind = require('auto-bind/react');


class Menu extends Component {
    constructor(props) {
        super(props);

        this.state = {currentSelection: "today", perspectives: [], projects: []};
        autoBind(this);
    }

    componentDidMount() {
        let view = this;
        (async function() {
            let tlps = await view.props.engine.db.getTopLevelProjects(view.props.uid);
            let psps = await view.props.engine.db.getPerspectives(view.props.uid);
            view.setState({perspectives: psps[2], projects: tlps[2]});
        })();
    }

    handleMenuClick(type, desc) {
        /*
         * Handle a click of the menu
         * @param   type   the type of menuitem it is
         * @param   desc   the description of it 
         *                     this should either be
         *                     the type again for 
         *                     upcoming or completed 
         *                     or the ID of the item
         *                     for projects and perspectives
         *
         */

        // TODO: Call back the callback
        this.props.dispatch(type, desc);
        this.setState({currentSelection: desc});
    }

    render() {
        return (
            <div className="menu-area">
                <div>
                    <div id="today" className={"today "+(this.state.currentSelection === "today" ? "today-highlighted": "")} onClick={()=>this.handleMenuClick("today", "today")}><i className="fas fa-chevron-circle-right"></i><span style={{paddingLeft:"8px"}} id="upcoming-text-name">Upcoming</span></div>
                        <div id="completed" className={"today "+(this.state.currentSelection === "completed" ? "today-highlighted": "")} onClick={()=>this.handleMenuClick("completed", "completed")}><i className="fas fa-check-circle"></i><span style={{paddingLeft:"8px"}} id="completed-text-name">Completed</span></div>
                </div>
                <span className="menu-label">
                    <span id="perspectives-text-name">Perspectives</span> <div className="menu-subicon" id="perspective-add"><i className="fas fa-plus"></i></div>
                </span>
                <div className="perspectives menu-portion scrollable">
                    {this.state.perspectives.map((psp) => {
                        return <div id={"perspective-"+psp.id} className={"menuitem perspective mihov "+(this.state.currentSelection === psp.id ? "menuitem-selected" : "")} key={psp.id} onClick={()=>this.handleMenuClick("perspective", psp.id)}><i className="fa fa-layer-group"></i><span style={{paddingLeft:8}}>{psp.name}</span></div>
                    })}
                </div>
                <span className="menu-label">
                    <span id="projects-text-name">Projects</span> <div className="menu-subicon" id="project-add-toplevel"><i className="fas fa-plus"></i></div>
                </span>
                <div className="projects menu-portion scrollable">
                    {this.state.projects.map((proj) => {
                        return <div key={proj.id} id={"project-"+proj.id} className={"menuitem project mihov "+(this.state.currentSelection === proj.id ? "menuitem-selected" : "")} onClick={()=>this.handleMenuClick("project", proj.id)}><i className="fas fa-project-diagram"></i><span style={{paddingLeft:8, textOverflow: "ellipsis", overflow: "hidden"}}>{proj.name}</span></div>
                    })}
                </div>
                <div id="logout"><i className="fas fa-snowboarding" style={{paddingRight: "5px"}}></i><span id="logout-text-name">Logout</span></div>
            </div>

      );
    }
}

export default Menu;

