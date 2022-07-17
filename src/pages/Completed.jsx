// IMPORTS
import { IonContent, IonPage, IonMenuToggle, isPlatform } from '@ionic/react'; 
import React, { Component, useEffect } from 'react';
import './Completed.css';
import './Pages.css';
import Spinner from './Components/Spinner';
import Task from './Components/Task';
import { CompletedWidget } from "../backend/src/Widget";
import { withShortcut, ShortcutProvider, ShortcutConsumer } from '../static/react-keybind'
import keybindHandler from "./Components/KeybindHandler"

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

// construtor for rendered object
function TaskObject(type, contents) {
    this.type = type; // set the type to the type (label or task)
    this.contents = contents; // set the contents to the contents (title or id)
}

// define the main component!
class Completed extends Component {
    constructor(props) {
        super(props);

        this.state = {
            taskList: [], // the objects we render
            tasksShown: 1, // track the number of times we have fetched more
            //taskCats: this.props.gruntman.localizations.completed_categories,//["Today", "Yesterday", "This Week", "This Month", "Even Before"], // define task categories (cats!)
            taskCats: this.props.localizations.completed_categories,//["Today", "Yesterday", "This Week", "This Month", "Even Before"], // define task categories (cats!)
            rendering: true, // define whether or not the element is rendering 
            initialRenderingDone: false,

	    keybinds: [],
	    virtualSelectIndex: 0,
	    virtualSelectRef: null,
	    showVirtualSelect: false,
        };

        this.updatePrefix = this.random();
        autoBind(this);

        this.completedWidget = new CompletedWidget(this.props.cm);

	this.virtualActive = React.createRef();
    }

    async componentDidMount() {
	this.setState({rendering: false})
        this.refresh();
        this.completedWidget.hook(this.refresh);



	const { shortcut } = this.props


	keybindHandler(this, [
	    [() => this.handleVirtualNav(1), [['j'], ['ArrowDown']], 'Navigate down', 'Navigates down in the current project', true],
	    [() => this.handleVirtualNav(-1), [['k'], ['ArrowUp']], 'Navigate up', 'Navigates up in the current project', true],
	    [this.handleItemOpen, [['o']], 'Open item', 'Opens the currently selected item'],
	    [this.handleItemComplete, [['Enter'], ["x"]], 'Complete item', 'Completes a task, or enters a project'],
	    [this.handleItemComplete, [['c+t']], 'Complete Task', 'Completes a task, or enters a project'],
	    [this.handleItemOpen, [['e+t']], 'Edit task', 'Edits the currently selected task'],
	])
    }

    async componentWillUnmount() {
        if (this.completedWidget)
            this.completedWidget.unhook(this.refresh);

	const { shortcut } = this.props
	for (const i in this.state.keybinds) {
	    shortcut.unregisterShortcut(this.state.keybinds[i])
	}
    }



    handleVirtualNav(direction) {

	const { shortcut } = this.props

	this.handleItemClose()

	let newSelect = (this.state.virtualSelectIndex + direction) //% (this.state.taskList.length);
	if (newSelect < 0) {
	    newSelect = (10*this.state.tasksShown) - 1 // doesn't highlight for some reason
	}

	if (this.state.taskList[newSelect].type == "label") newSelect += direction
	
	this.setState({
	    virtualSelectIndex: newSelect,
	    showVirtualSelect: true
	})
	if (this.state.virtualSelectIndex == 10*this.state.tasksShown) {
	    this.handleFetchMore()
	}
	//console.log(this.state.virtualSelectIndex, 10*this.state.tasksShown)

    }

    handleItemOpen() {
	//console.log(this.state.virtualSelectIndex)
	if (this.virtualActive.current && this.virtualActive.current.closeTask) {
	    this.virtualActive.current.toggleTask()
	} else {
	    if (this.virtualActive.current) this.virtualActive.current.click()
	}
    }

    handleItemClose() {
	if (this.virtualActive.current && this.virtualActive.current.closeTask) {
	    this.virtualActive.current.closeTask()
	}
    }

    handleItemComplete() {
	if (this.virtualActive.current && this.virtualActive.current.closeTask) {
	    this.virtualActive.current.completeTask() // TODO this is probably broken.. what does it do to completed tasks?
	    this.handleVirtualNav(-1)
	} else {
	    if (this.virtualActive.current) this.virtualActive.current.click()
	}
    }

    //handleItemComplete() {
    //    if (this.virtualActive.current && this.virtualActive.current.closeTask && !this.showEdit) {
    //        this.virtualActive.current.completeTask()
    //        this.handleVirtualNav(this.state.taskList.length-1)
    //    }
    //}





    async refresh(){
	let taskArr = [];
        let i = await this.completedWidget.execute()
	i.forEach((cat, i) => {
            taskArr.push(new TaskObject("label", this.state.taskCats[i])) // each iteration, push the next label to the temp arr
	    // if item[0] == task, ... else, ...
            cat.forEach(item => { // this loops through each cat
		if (item.databaseBadge == "tasks") {
		    // convert each task to an object then push it to the temp arr
		    taskArr.push(new TaskObject("task", item)) 
		} else if (item.databaseBadge == "projects")
		{
		    taskArr.push(new TaskObject("project", item)) 
		}
            })
        });


        this.setState({taskList: taskArr, initialRenderingDone: true});
    }

    handleFetchMore() {
        this.setState({rendering: true}) // trigger loading screen
        const loader =  setTimeout(() => { // set a timeout to set the rendering to false 
            this.setState({rendering: false})

        }, 2);

        const updateTasks =  setTimeout(() => { // set another timeout for the actual task update
            this.setState({tasksShown: this.state.tasksShown+1}) 
            // increment tasksShown by one whenever fetch more is clicked
            // this renders 10 more items 
	    // // if item[0] == task, ... else, ...
            this.setState({rendering: false}) // set rendering to false
        }, 1)
	//console.log(this.state.pPandT[0][0])

        // disclaimer: I do not understand how this works. I was just messing around trying to debug and this happened to work.
        // if it ain't broke, dont fix it? 
    }

    random() { return (((1+Math.random())*0x10000)|0).toString(16)+"-"+(((1+Math.random())*0x10000)|0).toString(16);}

    render() {
        return (
            <IonPage>
                <div style={{overflowY: "scroll"}}>
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

                        <div className="header-container">
                            <div style={{display: "inline-block"}}>
                                <IonMenuToggle>
                                    <i className="fas fa-bars" 
                                        style={{marginLeft: 20, color: "var(--page-header-sandwich)"}} />
                                </IonMenuToggle> 
                                <h1 className="page-title">
                                    <i style={{paddingRight: 10}} 
                                        className="fas fa-check-circle">
                                    </i>
                                    Completed
                                </h1> 
                            </div>
                        </div>
                        {/* loop through the taskList ten times, multiplyed by the times we have fetched more */}
                        {/* if the cat is empty or the final item rendered is a label, don't render it */}
                        {/* otherwise, render a task */}
                        {/* for the fetch more, if we are currently rendering, render a loading animation. */}
                        {/* Otherwise, render a fetch more.*/}
                        <div style={{overflowY: "scroll"}}>
                            <Spinner ready={this.state.initialRenderingDone} />
                            {this.state.taskList? (this.state.taskList.
				    slice(0, 10*this.state.tasksShown).
				    map((content, i) => (
                        <div key={i} style={{marginLeft: 10, marginRight: 10}}>

				    {/*console.log("something here??", this.state.taskList[4])*/}
				    {(content.type == "label")?  

					(this.state.taskList[i+1] ? 
					    ((this.state.taskList[i+1].type == "label" || this.state.taskList.slice(0, 10*this.state.tasksShown).length == i+1) ? 
                                                "" 
						: 
						<p 
						    className="page-label" 
						    style={{marginBottom:0}}
						>{content.contents}</p>) 
					    : "")
					    : (content.type == "task"? 
						(<div 
						    key={content.contents}

						    style={{
							borderRadius: "8px",
							transition: "0.3s",
							background: (this.state.virtualSelectIndex == i && this.state.showVirtualSelect)? "var(--background-feature)" : "",
						    }}
						    onMouseEnter={(e) => {
							this.setState({
							    virtualSelectIndex: i,
							    showVirtualSelect: false,
							})
			    }}
						>
						    <Task 
							cm={this.props.cm} 
							localizations={this.props.localizations} 
							taskObject={content.contents} 
							startingCompleted={true}
							ref={(i == this.state.virtualSelectIndex)? this.virtualActive : null}
						    />
							
						</div>)


					    : 
						<a className="subproject" 
						    //style={{opacity:props.availability[item.content.id]?"1":"0.35"}} 
						    onClick={()=>{
							this.props.paginate("projects", content.contents.id);
							this.props.history.push(`/projects/${content.contents.id}`)
						    }}

						    style={{
							transition: "0.3s",
							background: (this.state.virtualSelectIndex == i && this.state.showVirtualSelect)? "var(--background-feature)" : "",
						    }}
						    ref={(i == this.state.virtualSelectIndex)? this.virtualActive : null}
						>
						    <div><i className="far fa-arrow-alt-circle-right subproject-icon"/><div style={{display: "inline-block"}}>
							{content.contents.name}</div></div></a>
					    )
				    } 
				</div>
				    ))) : ""}

			    <div className="fetch-more" > 
				{/* define the fetch more button */}
				{this.state.rendering? <p className="loader" >{this.props.localizations.loading}</p> : <p onClick={this.handleFetchMore}>{this.props.localizations.fetchmore}</p>}
			    </div> 
			    <div className="bottom-helper">&nbsp;</div>
			</div>

                    </div>
                </div>
            </IonPage>
        )
    }
}

export default withShortcut(Completed);
