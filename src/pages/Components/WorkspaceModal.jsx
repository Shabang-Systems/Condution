import { IonModal, IonContent, IonSelect, IonSelectOption } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { useState, useEffect } from 'react';
//import OutsideClickHandler from 'react-outside-click-handler';
import "react-datepicker/dist/react-datepicker.css";

import TagsInput from './TagsInput'
import AutosizeInput from 'react-input-autosize';

import 'react-tagsinput/react-tagsinput.css' // If using WebPack and style-loader.

import "./WorkspaceModal.scss";


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

function autosizingRenderInput ({addTag, ...props}) {
  let {onChange, value, ...other} = props
  return (
      <AutosizeInput style={{border: 0}} name="react-tagsinput-actualinput" type='text' onChange={onChange} value={value} {...other} />
  )
}

function WorkspaceModal(props) {

    let [workspaceName, setWorkspaceName] = useState("");
    let [workspaceEditors, setWorkspaceEditors] = useState([]);
    let [isPublic, setIsPublic] = useState(false);


    let update = (async function() {
        let wsp = props.currentWorkspace;
        if (props.currentWorkspace) {
            setWorkspaceName(wsp.name);
            setWorkspaceEditors(wsp.collaborators);
            setIsPublic(wsp.isPublic);
        }
    });

    useEffect(()=>{
        update();
    }, [props.currentWorkspace]);


    return (
        <IonModal ref={props.reference} isOpen={props.isShown} onDidPresent={()=>{update()}} onDidDismiss={() => {if(props.onDidDismiss) props.onDidDismiss()}} style={{borderRadius: 5}} cssClass="workspace-popover auto-height">
            <div className="inner-content workspace-inside">
                <div className="workspace-header">
                    <span className="workspace-callout">{props.localizations.perspective_build_callout}</span>
                    <input className="editable-title workspace-input" 
                        value={workspaceName} 
                        style={{minWidth: 0}}
                        placeholder={props.localizations.workspace_modal_placeholder}
                        onChange={(e)=>{
                            setWorkspaceName(e.target.value);
                            e.persist();
                        }}
                        onBlur={()=>{
                            props.currentWorkspace.name = workspaceName;
                        }}
                    />
                </div>
                <div style={{display: "flex", alignItems: "center", marginLeft: 5}}>
                    <i className="fas fa-user-edit" style={{color: "var(--content-normal-alt)"}} />
                    <TagsInput value={workspaceEditors} onChange={(list)=>{
                        let isValid = true;
                        list.filter(e=>!workspaceEditors.includes(e)).forEach(newAccount => {
                            if (/\w+@\w+\.\w+/.test(newAccount))
                                props.currentWorkspace.invite(newAccount);
                            else 
                                isValid = false;
                        });
                        workspaceEditors.filter(e=>!list.includes(e)).forEach(removedAccount => {
                            props.currentWorkspace.revoke(removedAccount);
                        });
                        setWorkspaceEditors(list);
                    }} renderInput={autosizingRenderInput} inputProps={{placeholder: props.localizations.workspace_email}} />
                </div>
                <div style={{display: "flex", alignItems: "center", marginLeft: 5, marginTop: 5}}>
                    {isPublic ? (
                        <>
                            <i class="fas fa-link" style={{color: "var(--content-normal-alt)"}} />
                            <input value={`https://app.condution.com/workspaces/${props.currentWorkspace?props.currentWorkspace.id:""}`} className="workspace-link" readOnly={true} onClick={(e)=>{
                              /* Select the text field */
                              e.nativeEvent.target.select();
                              e.nativeEvent.target.setSelectionRange(0, 99999); /*For mobile devices*/

                              /* Copy the text inside the text field */
                              document.execCommand("copy");
                            }} />
                            <i class="fas fa-unlink" style={{marginLeft: 10, marginRight: 5, color: "var(--decorative-light-alt)", cursor: "pointer"}} onClick={()=>{
                                props.currentWorkspace.privatize();
                                setIsPublic(false);

                            }}/>
                        </>
                    ):(
                        <>
                            <i class="fas fa-link" style={{color: "var(--decorative-light-alt)"}}/>
                            <a className="linkaccess" onClick={()=>{
                                props.currentWorkspace.publicify();
                                setIsPublic(true);
                            }}>{props.localizations.publicify}</a>
                        </>
                    )}
                </div>
            </div>
        </IonModal>
    )
}




export default WorkspaceModal;

