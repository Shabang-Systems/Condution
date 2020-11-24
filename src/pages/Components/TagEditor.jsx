import { IonModal, IonContent, IonSelect, IonSelectOption } from '@ionic/react';
import { Dropdown } from 'react-bootstrap';
import React, { Component } from 'react';
import './TagEditor.css';
import "react-datepicker/dist/react-datepicker.css";
import * as chrono from 'chrono-node';
import Select from 'react-select'

/*
 * Although I do not agree
 * Jack told me to make this feat
 * I did not make this carefree
 * yet this is far from elite
 *
 * I resolved to give it a try
 * and encountered this very strange bug
 * This thing makes me want to cry
 * Front-end is far from a drug
 *
 * I may be exageratting
 * Maybe this bug wasn't so bad
 * But still I cannot add padding
 * and it still makes me very sad
 *
 * React may feel like a drug
 * Until you find the next bug
 *
 * by @zbuster05
 * */

const autoBind = require('auto-bind/react');

class TagEditor extends Component {
    constructor(props) {
        super(props)
        this.state = {
            tagList: [],
            settingState: 0
        }
    }
    // TODO make not freak out if there aren't any tags
    // TODO make not bad and actually set tag state
   async setTagState() {
        this.state.tagList = await this.props.engine.db.getTags(this.props.uid);
    }
   // TODO BADDD 
    componentDidMount() {
        this.setTagState()
    }

    tagClicked(i) {
        this.setState({settingState: i});
        console.log(this.state.tagList.length)
    }

    tagNameChanged(e, index) {
        if (e.key == "Enter") {
            let newName = this.state.tagList;
            newName[index].name = e.target.value;
            this.setState({tagList: newName});

            this.props.engine.db.setTag(this.props.uid, this.state.tagList[index].id, newName[index])
        }
    }

    tagDeleteClicked(e, i) { // TODO Later make it so get projects and tags prunes dead tags
        this.props.engine.db.deleteTag(this.props.uid, this.state.tagList[i].id);

        let tagexclu = this.state.tagList;
        tagexclu.splice(i,1);
        this.setState({tagList: tagexclu});
        
        e.stopPropagation();
    }

    render() {
        return (
            <IonModal ref={this.props.reference} isOpen={this.props.isShown} onDidPresent={() => {this.setTagState()}} onDidDismiss={() => {if(this.props.onDidDismiss) this.props.onDidDismiss()}} style={{borderRadius: 5, border: "1px solid red"}} cssClass={"tag-editor"}>

                {/*Text Header*/}
                <div className="TagEditor-header">
                    <span style={{display: "inline-flex", alignItems: "center"}}>
			            <b className="bold-prefix" >Tags</b> 
			        </span>

                    {/*Close Button*/}
                    <a className="TagEditor-close" onClick={this.props.onDidDismiss}><i className="fa fa-times"></i></a>
                </div>
                
                {/*Like actual tag setting stuff*/}
                <div className="tag-pane-container">
                    <div className="tag-list">
                        {this.state.tagList.map((tag, index) => {
                            return (
                                <div className="tag-in-list" onClick={() => {this.tagClicked(index)}}>
                                    <div className="tag-name">
                                        {tag.name}
                                    </div>
                                    <a className="TagEditor-close" onClick={(e) => this.tagDeleteClicked(e,index)}><i className="fa fa-times x"></i></a>
                                </div>
                            )
                        })}
                    </div>
                    <div className="tag-settings">
                        <div className="tag-name-header">
                           <input className="tag-name-input" onKeyDown={(e) => {this.tagNameChanged(e, this.state.settingState)}} defaultValue={this.state.tagList[0]? this.state.tagList[this.state.settingState].name : ""}></input> 
                        </div>
                    </div>
                </div>
            </IonModal>
        )
    }
}

export default TagEditor
