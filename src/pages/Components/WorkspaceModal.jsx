import { IonModal, IonContent, IonSelect, IonSelectOption } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { useState, useEffect } from 'react';
//import OutsideClickHandler from 'react-outside-click-handler';
import "react-datepicker/dist/react-datepicker.css";

import "./WorkspaceModal.css";


/*
 * Hello human,
 * good morning.
 *
 * I am the repeat UI
 *
 * Rule denotes the repeat major rule: {no repeat, daily, weekly: yearly}
 * Advanced denotes whether the user is using fancy repeat
 * On denotes the advanced repeat signals. (like mon, tue, sat or something.)
 *
 * @jemoka
 *
 */


function WorkspaceModal(props) {

    let [workspaceName, setWorkspaceName] = useState("");
    let [workspaceEditors, setWorkspaceEditors] = useState([]);

    useEffect(()=>{
        (async function() {
            if (props.currentWorkspace) {
                setWorkspaceName((await props.engine.db.getWorkspace(props.currentWorkspace)).meta.name);
                setWorkspaceEditors((await props.engine.db.getWorkspace(props.currentWorkspace)).meta.editors);
            }
        })();
    }, [props.currentWorkspace]);


    return (
        <IonModal ref={props.reference} isOpen={props.isShown} onDidDismiss={() => {if(props.onDidDismiss) props.onDidDismiss()}} style={{borderRadius: 5}} cssClass="workspace-popover">
            <div className="workspace-inside">
                <div className="workspace-header">
                    <span className="workspace-callout">{props.gruntman.localizations.perspective_build_callout}</span>
                    <input className="editable-title workspace-input" 
                        defaultValue={workspaceName} 
                        style={{minWidth: 0}}
                        placeholder="@NEEDLOC Tap to set name"
                        onChange={(e)=>{
                            e.persist();
                            this.props.gruntman.registerScheduler(() => this.props.gruntman.do(
                                "workspace.update", // the scheduler actually updates the task
                                {
                                    uid: props.currentWorkspace, 
                                    query:{meta: {name: e.target.value, editors: workspaceEditors}} // setting the name to the name
                                }
                            ), `workspace-${props.currentWorkspace}-update`)
                        }}
                    />
                </div>
                {workspaceEditors.map(e=><span>{e}</span>)}
            </div>
        </IonModal>
    )
}




export default WorkspaceModal;

