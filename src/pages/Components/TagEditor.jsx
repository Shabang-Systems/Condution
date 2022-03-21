import { IonModal, IonContent, IonSelect, IonSelectOption } from '@ionic/react';
import { Dropdown } from 'react-bootstrap';
import React, { Component } from 'react';
import './TagEditor.css';
import "react-datepicker/dist/react-datepicker.css";
import * as chrono from 'chrono-node';
import Select from 'react-select';
import { TagsPaneWidget } from "../../backend/src/Widget";
import Tag from "../../backend/src/Objects/Tag";


import BlkArt from './BlkArt';
import { isThisTypeNode } from 'typescript';

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
            settingState: -1
        }
        this.tagsPaneWidget = new TagsPaneWidget(this.props.cm);
    }
    // TODO make not bad and actually set tag state
    async setTagState() {
        //this.state.tagList = await this.props.engine.db.getTags(this.props.uid);
        this.state.tagList = await this.tagsPaneWidget.execute();
    }
   // TODO BADDD 
    componentDidMount() {
        this.setTagState();
    }
    
    async newTagClicked() {
        let newTag = await Tag.create(this.props.cm, this.props.localizations.new_tag_button);
        //let tagid = await this.props.engine.db.newTag(this.props.uid, this.props.gruntman.localizations.new_tag_button);
        let temp = this.state.tagList;
        temp.push(newTag);
        this.setState({tagList: temp});
    }

    tagClicked(i) {
        this.state.tagList[i].tempname = this.state.tagList[i].name;
        this.setState({settingState: i});
    }

    tagWeightChanged(e) {
        let index = this.state.settingState;
        e.persist();
        let temp = this.state.tagList;
        temp[index].weight = Number(e.target.value);
        this.setState({tagList: temp});
    }

    tagNameChanged(e, index) {
        e.persist();
        this.state.tagList[index].name = this.state.tagList[index].tempname; // TODO: e.target.value instead of tempname?
        let newName = this.state.tagList;
        newName[index].name = e.target.value;
        this.setState({tagList: newName});
    }

    tagNameEdited(e, index) {
        let newName = this.state.tagList;
        newName[index].tempname = e.target.value;
        this.setState({tagList: newName});
    }

    tagDeleteClicked(e, i) { // TODO Later make it so get projects and tags prunes dead tags
        e.stopPropagation();
        if (this.state.settingState == i)
            this.state.settingState = 0;

        this.state.tagList[i].delete();
        let tagexclu = this.state.tagList;
        tagexclu.splice(i, 1);

        this.setState({tagList: tagexclu});
    }

    render() {
        return (
            <IonModal ref={this.props.reference} isOpen={this.props.isShown} onDidPresent={() => {this.setTagState()}} onDidDismiss={() => {if(this.props.onDidDismiss) this.props.onDidDismiss()}} style={{borderRadius: 5, border: "1px solid red"}} cssClass={"tag-editor"}>

                {/*Text Header*/}
                <div className="TagEditor-header">
                    <span style={{display: "inline-flex", alignItems: "center"}}>
                        <b className="bold-prefix" >Edit All Tags</b> 
			        </span>

                    {/*Close Button*/}
                    <a className="TagEditor-close" onClick={this.props.onDidDismiss}><i className="fa fa-times"></i></a>
                </div>
                
                {/*Like actual tag setting stuff*/}
                <div className="tag-pane-container">
                    {true /*TODO Fix this bad solution later I'm too lazy*/? (
                        <>
                    <div className="tag-list">
                        {this.state.tagList.map((tag, index) => {
                            return (
                                <div key={index} className={"tag-in-list "+((index===this.state.settingState) ? "selected":"")} onClick={() => {this.tagClicked(index)}}>
                                    <div className="tag-name">
                                        {tag.name}
                                    </div>
                                    <a className="TagEditor-close" onClick={(e) => this.tagDeleteClicked(e, index)}><i className="fa fa-times x"></i></a>
                                </div>
                            )
                        })}
                        <div className="new-tag-button" onClick={ () => {this.newTagClicked()}}>
                            <i class="fas fa-plus" style={{marginLeft: "2px"}}></i>
                            <div className="new-tag-text">{this.props.localizations.new_tag_button}</div>
                        </div>
                    </div>
                    <div className="tag-settings">
                        {this.state.settingState==-1?(
                            <div className="tag-settings-empty">
                                <BlkArt visible={this.state.settingState==-1} title={"No tags selected..."} subtitle={"Select a tag?"} />
                            </div>
                        ):(
                            <>
                                <div className="tag-name-header">
                                    <i class="fas fa-edit" style={{color: "var(--content-normal-alt)"}}></i>
                                    <input className="tag-name-input" onKeyDown={(e) => {this.tagNameChanged(e, this.state.settingState)}} onChange={(e) => {this.tagNameEdited(e, this.state.settingState)}} value={this.state.tagList[0]? this.state.tagList[this.state.settingState].tempname : ""} defaultValue={this.state.tagList[0]? this.state.tagList[this.state.settingState].name : ""}></input>
                                </div>

                                <div className="tag-weight-container">
                                    <i class="fas fa-weight-hanging" style={{color: "var(--content-normal-alt)", marginRight: 1}} />
                                    <input type="number" className="tag-weight-input" value={this.state.tagList[0] ? (this.state.tagList[this.state.settingState].weight!==undefined)?(this.state.tagList[this.state.settingState].weight):1 : 1} onKeyDown={(e)=> {this.tagWeightChanged(e)}} 
                                        onChange={(e)=>{
                                        let index = this.state.settingState;
                                        let ntl = this.state.tagList;
                                        ntl[index].weight = +Number(e.target.value);
                                        this.setState({tagList: ntl});

                                    }}/>
                                </div>
                            </>
                        )}
                    </div>
                            </>
                    ):(<BlkArt visible={this.state.tagList.length<=0} title={this.props.localizations.blk_art_tags} subtitle={this.props.localizations.blk_art_tags_subtitle} />)}
                </div>
            </IonModal>
        )
    }
}

export default TagEditor
