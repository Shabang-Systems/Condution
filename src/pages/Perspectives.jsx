import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet, IonMenuToggle, isPlatform } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Perspectives.css'
import './Pages.css';
import ReactTooltip from 'react-tooltip';
import { withRouter } from "react-router";

import BlkArt from './Components/BlkArt';

import ClickButton from "./Components/Clickbutton.jsx";

import Task from './Components/Task';
import PerspectiveEdit from './Components/PerspectiveEditor';

import Perspective from "../backend/src/Objects/Perspective";
import Project from "../backend/src/Objects/Project";
import { withShortcut, ShortcutProvider, ShortcutConsumer } from '../static/react-keybind'
import keybindHandler from "./Components/KeybindHandler"

import {Hookifier} from "../backend/src/Objects/Utils.ts";


import Spinner from './Components/Spinner';

const autoBind = require('auto-bind/react');



/* 
 * To sort, we give our tasks tags
 *
 * We can also give them flags
 * 
 * With perspectives we filter,
 *
 * To keep our tasks in kilter,
 *
 * Then refactor the code if it lags!
 *
 *
 * @enquirer
 *
 *
 * welp...
 *
 */


class Perspectives extends Component {

    constructor(props) {
        super(props);

        this.state = {
            perspectiveName: "",
            initialRenderingDone: false,
            perspectiveObject: null,
            taskList:[],
            showEdit: false,
	    keybinds: [],
	    virtualSelectIndex: 0,
	    virtualSelectRef: null,
	    showVirtualSelect: false,
        };


        this.updatePrefix = this.random();
        this.repeater = React.createRef(); // what's my repeater? | i.. i dont know what this does...
        this.perspectiveNameRef = React.createRef(); // what's my repeater? | i.. i dont know what this does...

	this.virtualActive = React.createRef();

        // AutoBind!
        autoBind(this);
    }
    showEdit() {
        this.setState({showEdit: true})
    } // util func for showing repeat
    hideEdit() {
        this.setState({showEdit: false});
    } // util func for hiding repeat

    componentWillUnmount() {
        if (this.state.perspectiveObject)
            this.state.perspectiveObject.unhook(this.reloadData);

	const { shortcut } = this.props
	for (const i in this.state.keybinds) {
	    shortcut.unregisterShortcut(this.state.keybinds[i])
	}

        Hookifier.remove("QueryEngine", this.reloadData);
    }

    async load() {
        let perspective = await Perspective.fetch(this.props.cm, this.props.id)
        perspective.hook(this.reloadData);

        Hookifier.push("QueryEngine", this.reloadData);

        this.setState({
            perspectiveObject: perspective 
        }, this.reloadData)
    }

    handleVirtualNav(direction) {
	const { shortcut } = this.props

	this.handleItemClose()

	let newSelect = (this.state.virtualSelectIndex + direction) % (this.state.taskList.length);
	this.setState({
	    virtualSelectIndex: newSelect,
	    showVirtualSelect: true
	})
    }

    handleItemOpen() {
	if (this.virtualActive.current && this.virtualActive.current.closeTask) {
	    this.virtualActive.current.toggleTask()
	}
    }

    handleItemClose() {
	if (this.virtualActive.current && this.virtualActive.current.closeTask) {
	    this.virtualActive.current.closeTask()
	}
    }

    handleItemComplete() {
	if (this.virtualActive.current && this.virtualActive.current.closeTask && !this.showEdit) {
	    this.virtualActive.current.completeTask()
	    this.handleVirtualNav(this.state.taskList.length-1)
	}
    }

    async reloadData() {
        // WHY IS THIS SO SLOW????!??!? You ask.
        // There is a bug whereby things like "flagged" is
        // filtered by caching every task, THEN filtering by flaggedness
        // in the backend, because Jack is dumb. 
        //
        // The correct behavior should be that filtering by flaggedness
        // should be done BEFORE the task info is fully cached. Refer to
        // src/backend/src/Objects/Perspective.ts to see how this was
        // implemented. 
        //
        // Unfortunately, I can't bother to fix this right now, so perspcetives
        // that filter for every task (like [!._]) is just going to suck for
        // a few days until I bug Huxley enough to fix it for me. Thx XOXO.
        //
        //
        // @jemoka

        let taskList = await this.state.perspectiveObject.execute();
        this.setState({
            taskList,
            initialRenderingDone: true,
            perspectiveName: this.state.perspectiveObject.name
        });
    }

    handleDelete() {
        this.state.perspectiveObject.delete();
        this.props.history.push("/upcoming/");
    }


    focusName() {
	if (this.perspectiveNameRef.current) this.perspectiveNameRef.current.focus();
    }

    componentDidMount() {
	const { shortcut } = this.props


	keybindHandler(this, [
	    [() => this.handleVirtualNav(1), [['j'], ['ArrowDown']], 'Navigate down', 'Navigates down in the current project', true],
	    [() => this.handleVirtualNav(this.state.taskList.length-1), [['k'], ['ArrowUp']], 'Navigate up', 'Navigates up in the current project', true],
	    [this.handleItemOpen, [['o']], 'Open item', 'Opens the currently selected item'],
	    [this.handleItemComplete, [['Enter'], ["x"]], 'Complete item', 'Completes a task, or enters a project'],
	    [this.handleItemComplete, [['c+t']], 'Complete Task', 'Completes a task, or enters a project'],
	    [this.handleItemOpen, [['e+t']], 'Edit task', 'Edits the currently selected task'],
	    [this.showEdit, [['e+p']], 'Edit perspective', 'Opens the perspective editor'],
	    [this.focusName, [['e+n']], 'Edit name', 'Focuses the perspective name'],
	    [this.handleDelete, [['']], 'Delete perspective', 'Deletes the perspective'],
	])

        this.load()
        this.setState({showEdit: this.props.options === "do"});

    }

    componentDidUpdate(prevProps, prevState, _) {
        if (prevProps.id !== this.props.id) {
            prevState.perspectiveObject.unhook(this.reloadData);
            this.load();
        }
        if (prevProps.options !== this.props.options)
            this.setState({showEdit: this.props.options === "do"});
    }

    random() { return (((1+Math.random())*0x10000)|0).toString(16)+"-"+(((1+Math.random())*0x10000)|0).toString(16);}

    render() {
        return (
            <IonPage>
		{/* the perspective editor! */}
                <PerspectiveEdit 
                    cm={this.cm}
                    reference={this.repeater} 
                    isShown={this.state.showEdit} 
                    onDidDismiss={this.hideEdit}
                    perspective={this.state.perspectiveObject}
                    startHighlighted={this.props.options === true}
                    localizations={this.props.localizations}
                />
                <div className={"page-invis-drag " + (()=>{
                    if (!isPlatform("electron")) // if we are not running electron
                        return "normal"; // normal windowing proceeds
                    else if (window.navigator.platform.includes("Mac")){ // macos
                        return "darwin"; // frameless setup
                    }
                    else if (process.platform === "win32") // windows
                        return "windows"; // non-frameless
                    else 
                        return "windows"; // ummm, it does not know about windows pt.n
                })()}>&nbsp;</div>
                <div className={"page-content " + (()=>{
                    if (!isPlatform("electron")) // if we are not running electron
                        return "normal"; // normal windowing proceeds
                    else if (window.navigator.platform.includes("Mac")){ // macos
                        return "darwin"; // frameless setup
                    }
                    else if (process.platform === "win32") // windows
                        return "windows"; // non-frameless
                    else 
                        return "windows"; // ummm, it does not know about windows pt.n
                })()}>

		    <div className="header-container" >
                        <div style={{display: "inline-block"}}>
                            <div> 
                                <IonMenuToggle>
                                    <i className="fas fa-bars" 
                                        style={{marginLeft: 20, color: "var(--page-header-sandwich)"}} />
                                </IonMenuToggle> 
                                <h1 className="page-title">
                                    <i style={{paddingRight: 10}} 
                                        className="fas fa-layer-group">
                                    </i>
                                    <input className="editable-title" 
                                        onChange={(e)=> {this.setState({perspectiveName:e.target.value})}}
                                        onBlur={(_)=>{this.state.perspectiveObject.name = this.state.perspectiveName}}
                                        value={this.state.perspectiveName} // TODO: jack this is hecka hacky
					ref={this.perspectiveNameRef}
					onKeyDown={(e) => { if (e.code == "Enter") e.target.blur();}}
                                    />
                                </h1> 
                                {/*<ReactTooltip effect="solid" offset={{top: 3}} backgroundColor="black" className="tooltips" />*/}

                                <div className="greeting-container" style={{marginLeft: 6, marginTop: 2, marginBottom: 5}}>
                                    <ClickButton icon={"fas fa-edit"} onClick={this.showEdit} />
                                    <ClickButton icon={"fas fa-trash"} onClick={this.handleDelete} />

                                </div> 
                            </div>
                        </div>
                    </div>

                    <div style={{marginLeft: 10, marginRight: 10, overflowY: "scroll"}}>
                        {this.state.taskList.map((i, idx) => <div
			    key={i.id}
			    style={{
				borderRadius: "8px",
				transition: "0.3s",
				background: (this.state.virtualSelectIndex == idx && this.state.showVirtualSelect)? "var(--background-feature)" : "",
			    }}
			    onMouseEnter={(e) => {
				this.setState({
				    virtualSelectIndex: idx,
				    showVirtualSelect: false,
				})
			    }}
			>
			    <Task 
				cm={this.props.cm}
				localizations={this.props.localizations}
				taskObject={i}
				ref={(idx == this.state.virtualSelectIndex)? this.virtualActive : null}
			    />
			</div>
			)}
                        <Spinner ready={this.state.initialRenderingDone} />
                        <BlkArt visible={this.state.initialRenderingDone && this.state.taskList.length === 0} title={"Nothing in this perspective."} subtitle={"Add some more filters?"} />
                        <div className="bottom-helper">&nbsp;</div>
                    </div>
                </div>
            </IonPage>
        )
    }
}

export default withShortcut(withRouter(Perspectives));

