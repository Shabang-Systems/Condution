// IMPORTS
import { IonContent, IonPage, IonMenuToggle, isPlatform } from '@ionic/react'; 
import React, { Component, useEffect } from 'react';
import './WorkspaceWelcome.css';
import './Pages.css';
import Task from './Components/Task';
import { withRouter } from "react-router";

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


// define the main component!
class WorkspaceWelcome extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: "",
            error: false,
            loaded: false,
        };

        this.updatePrefix = this.random();
        this.props.gruntman.registerRefresher((this.refresh).bind(this));
        autoBind(this);
    }

    async refresh() {
        try {
            let wsp = await this.props.engine.db.getWorkspace(this.props.uid);
            this.setState({name: wsp.meta.name, loaded: true});
        } catch {
            this.setState({error: true, loaded: true});
        }
    }

    componentDidMount() {
        this.refresh();
    }

    componentWillUnmount() {
        this.props.gruntman.halt();
    }
    random() { return (((1+Math.random())*0x10000)|0).toString(16)+"-"+(((1+Math.random())*0x10000)|0).toString(16);}

    render() {
        return (
            <IonPage>
                <div className="workspace-welcome-container" style={{overflowY: "scroll"}}>
                    {this.state.loaded ? (
                    !this.state.error?  (
                    <div style={{margin: "0 30px", width: "min(650px, 80vw)"}}>
                            <h1 className="workspace-title">{this.props.localizations.workspace_welcome}<span className="workspace-name" style={{fontSize: 20}}>{this.state.name}</span></h1>
                        <p className="workspace-subtitle">{this.props.localizations.workspace_explanation} </p>
                        {/*<p className="workspace-subtitle" style={{fontWeight: 600}}>You have been signed into the {this.state.name} workspace. Simply head back to <a href="https://app.condution.com" className="link">TODO.!!!!!!.com</a> to keep working. Your work is automatically saved.</p>*/}
                        <div className="continue-button" onClick={()=>{
                            this.props.history.push("/upcoming/");
                            this.props.paginate("upcoming");
                        }}><i className="fas fa-snowboarding button-right" />Let's do this!</div></div>
                    ):(<div className="workspace-error">
                        <div style={{fontSize: 26}}>🤷 <b>{this.props.localizations.nahman}</b> <span style={{fontSize: 20}}>{this.props.localizations.where_workspace}</span></div>
                        <div className="workspace-forbidden">{this.props.localizations.workspace_forbidden}</div>
                    </div>)):null}
                </div>
            </IonPage>
        )
    }
}

export default withRouter(WorkspaceWelcome);
