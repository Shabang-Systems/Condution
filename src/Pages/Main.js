import React, { Component } from 'react';
// Firebase App (the core Firebase SDK) is always required and must be listed first
import $ from "jquery";

import Menu from "./Components/Menu";
import Today from "./Views/Today";

import './Main.css';

const autoBind = require('auto-bind/react');


class Main extends Component {
    constructor(props) {
        super(props);

        this.state = {view: "today", currentID: "", projectDir: []};

        autoBind(this);
    }

    menuDispatch(type, desc) {
        this.setState({view: type, currentID: desc, projectDir: this.state.projectDir.slice(0, this.state.projectDir.length-1)});
    }

    render() {
        return (
            <div id="content-wrapper">
                <div id="left-menu">
                    <Menu engine={this.props.engine} uid={this.props.uid} dispatch={this.menuDispatch}/>
                </div>
                <div id="content-area" className="scrollable">
                    {(()=>{
                        switch (this.state.view) {
                            case "today":
                                return <Today className="page" engine={this.props.engine} uid={this.props.uid}/>
                            case "completed":
                                return <div>It's me, completed!</div>
                            case "perspective":
                                return <div>It's me, perspectives! I am rendering {this.state.currentID}</div>
                            case "project":
                                return <div>It's me, projects! I am rendering {this.state.currentID}</div>

                        }
                    })()}
                </div>
            </div>
      );
    }
}

export default Main;

