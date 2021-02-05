import React, { useState, useRef, useEffect } from 'react';
import { useDrag } from 'react-use-gesture'
import { useSprings, animated, interpolate } from 'react-spring'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import GuttedTask from './GuttedTask';


import '../Projects.css';

import Task from './Task';



/*
 *
 * Hello human,
 * good afternoon.
 *
 * I am clumsy sortable!
 *
 * Use me to sort things
 * and make sortable task lists
 *
 * TODO => put actual documentation here
 *
 * So there.
 *
 * @jemoka
 *
 */

const SortableTaskList = (props)=>{

    const itemHeight = 42; // height of single item to calculate animation

    const [activelyDragging, setActivelyDragging] = useState([]); // we are actively dragging...

    const order = useRef();
    const moveApplied = useRef();
    const currentIndex = useRef();
    const dragEnvelope = useRef();
    const [dragEnabled, setDragEnabled] = useState(true);


    let objRefs = props.list.map(_ => React.createRef());

    const getAnimationDestinationFromIndex = (activeIndex, mY, currentOrder, noAnim, down) => (indx) => {
        return activeIndex === indx ?  {
                y: ((currentOrder.indexOf(indx) !== -1 ? currentOrder.indexOf(indx) : indx)-indx)*itemHeight + (down ? mY-((currentOrder.indexOf(indx)-indx)*itemHeight):0), // number of tasks the index is out of place * height of task + cursor movement => correct dragged position offset
                zIndex:1000, 
                config: {tension: 100, friction: 2, mass: 1, clamp: true},
            immediate:noAnim
        } : {
                y: ((currentOrder.indexOf(indx) !== -1 ? currentOrder.indexOf(indx) : indx)-indx)*itemHeight,  // number of tasks the index is out of place * height of task => correct adjustment to position
                zIndex:0, 
            immediate:noAnim
        }; // if the index is the one that's being dragged, move up by howevermuch needed
    }


    //const [{ x, y }, set] = useSpring(() => ({ x: 0, y: 0 }))
    const [springs, set, stop] = useSprings(props.list.length, getAnimationDestinationFromIndex(-1, 0, order.current, true))

    // initialize presistant refs
    useEffect(() => {
        order.current = props.list.map((_, i)=>i);
        moveApplied.current = 0; // moves applied
        currentIndex.current = 0; // currentIndex
        set(getAnimationDestinationFromIndex(-1, 0, order.current, true)) // initialize the animation function
    }, [props.list, props.uid]);

    // Set the drag hook and define component movement based on gesture data
    const bind = useDrag( (async function ({ args: [index], down, movement: [_, movementY] , first, last, tap}) {

        if (first) {
            currentIndex.current = index;

            if (!activelyDragging.includes(index))
                setActivelyDragging([...activelyDragging, index]);

            if (props.onSortStart)
                props.onSortStart({sorted: index, sortedID: props.list[index], list: props.list});
        }

        let moveBy = Math.floor(movementY/itemHeight) // the amount of tasks the active task moved over
        moveBy = moveBy <= -index ? -index : (moveBy >= (props.list.length-index) ? props.list.length-1 : moveBy); // clip moveby by the total task it could possibly move over

        if (Math.abs(moveBy) > 0 && moveBy!==moveApplied.current) {
            // @enquierer crushing @jemoka's hopes and dreams
            let newIndex = index+moveBy;
            order.current.splice(currentIndex.current, 1); // splice element out
            order.current.splice(newIndex, 0, index); // splice the index in, noting that we just took something out
            moveApplied.current = moveBy;
            currentIndex.current = newIndex;
        }

        //if (!tap) { // TODO THIS LINE IS EVIL
            set(getAnimationDestinationFromIndex(index, movementY, order.current, false, down)) // set the animation function
        //} // TODO CANNOT UNCOMMENT, OR YOU RISK BREAKING THE DATEPICKER
        // As to why something in Sortable checking for taps breaks the datepicker, I blame Chuck Norris. Why not?


        if (last) {// if we are done dragging
            setTimeout(()=> setActivelyDragging(activelyDragging.filter(x=>x!==index)), 100); // wait for the lovely event bubble and say we are done
            moveApplied.current = 0; // moves applied
            currentIndex.current = 0; // currentIndex
	    console.log(order.current)
            await props.gruntman.do( // call a gruntman function
                "macro.applyOrder", { 
                    uid: props.uid, // pass it the things vvv
                    order: order.current, 
                    items: props.list.map(i=>{return {type:"task", content:i}}),
                }
            );

            if (props.onSortEnd)
                props.onSortEnd({sorted: index, sortedID: props.list[index], newOrder: order.current, movementY, moveBy, list:props.list});

        }


    }).bind(this), {drag:{delay:100}, filterTaps: true, enabled: dragEnabled})

    return props.list.map((id, i) => {
        let anim = springs[i];
        return (
            <div ref={(e)=>{dragEnvelope.current=e}}>
            <animated.div 
                {...bind(i)} 
                className={activelyDragging.includes(i) ? "drag-envelope dragging" : "drag-envelope"}
                style={{
                    borderRadius: 7,
                    position: "relative",
                    cursor: "pointer",
                    zIndex: anim.zIndex,  // z-index is 1000 during drag
                    transform: interpolate([anim.y], (y) => `translate3d(0,${y}px,0)`), // interpolate the transform, b/c that's, uh, the dragging part
                }} 
                onClickCapture={(e)=>{
                    if (activelyDragging.includes(i)){ // if we are still dragging
                        e.stopPropagation(); // no clicky!
                    }
                }}
            >
                <Task ref={objRefs[i]} tid={id} key={id+"-"+props.prefix} datapack={props.datapack} uid={props.uid} engine={props.engine} gruntman={props.gruntman} availability={props.availability[id]} envelope={dragEnvelope} setDragEnabled={setDragEnabled} />
            </animated.div>
            </div>
    )
    });
}

const SortableProjectList = (props)=>{

    //const itemHeight = 42; // height of single item to calculate animation

    //const [activelyDragging, setActivelyDragging] = useState([]); // we are actively dragging...

    //const order = useRef();
    //const moveApplied = useRef();
    //const currentIndex = useRef();
    //const dragEnvelope = useRef();
    //const [dragEnabled, setDragEnabled] = useState(true);


    //let objRefs = props.list.map(_ => React.createRef());

    //const getAnimationDestinationFromIndex = (activeIndex, mY, currentOrder, noAnim, down) => (indx) => {
    //    return activeIndex === indx ?  {
    //            y: ((currentOrder.indexOf(indx) !== -1 ? currentOrder.indexOf(indx) : indx)-indx)*itemHeight + (down ? mY-((currentOrder.indexOf(indx)-indx)*itemHeight):0), // number of tasks the index is out of place * height of task + cursor movement => correct dragged position offset
    //            zIndex:1000, 
    //            config: {tension: 100, friction: 2, mass: 1, clamp: true},
    //        immediate:noAnim
    //    } : {
    //            y: ((currentOrder.indexOf(indx) !== -1 ? currentOrder.indexOf(indx) : indx)-indx)*itemHeight,  // number of tasks the index is out of place * height of task => correct adjustment to position
    //            zIndex:0, 
    //        immediate:noAnim
    //    }; // if the index is the one that's being dragged, move up by howevermuch needed
    //}


    ////const [{ x, y }, set] = useSpring(() => ({ x: 0, y: 0 }))
    //const [springs, set, stop] = useSprings(props.list.length, getAnimationDestinationFromIndex(-1, 0, order.current, true))

    //// initialize presistant refs
    //useEffect(() => {
    //    order.current = props.list.map((_, i)=>i);
    //    moveApplied.current = 0; // moves applied
    //    currentIndex.current = 0; // currentIndex
    //    set(getAnimationDestinationFromIndex(-1, 0, order.current, true)) // initialize the animation function
    //}, [props.list, props.uid]);

    //// Set the drag hook and define component movement based on gesture data
    //const bind = useDrag( (async function ({ args: [index], down, movement: [_, movementY] , first, last, tap}) {

    //    if (first) {
    //        currentIndex.current = index;

    //        if (!activelyDragging.includes(index))
    //            setActivelyDragging([...activelyDragging, index]);

    //        if (props.onSortStart)
    //            props.onSortStart({sorted: index, sortedID: props.list[index], list: props.list});
    //    }

    //    let moveBy = Math.floor(movementY/itemHeight) // the amount of tasks the active task moved over
    //    moveBy = moveBy <= -index ? -index : (moveBy >= (props.list.length-index) ? props.list.length-1 : moveBy); // clip moveby by the total task it could possibly move over

    //    if (Math.abs(moveBy) > 0 && moveBy!==moveApplied.current) {
    //        // @enquierer crushing @jemoka's hopes and dreams
    //        let newIndex = index+moveBy;
    //        order.current.splice(currentIndex.current, 1); // splice element out
    //        order.current.splice(newIndex, 0, index); // splice the index in, noting that we just took something out
    //        moveApplied.current = moveBy;
    //        currentIndex.current = newIndex;
    //    }

    //    //if (!tap) { // TODO THIS LINE IS EVIL
    //        set(getAnimationDestinationFromIndex(index, movementY, order.current, false, down)) // set the animation function
    //    //} // TODO CANNOT UNCOMMENT, OR YOU RISK BREAKING THE DATEPICKER
    //    // As to why something in Sortable checking for taps breaks the datepicker, I blame Chuck Norris. Why not?


    //    if (last) {// if we are done dragging
    //        setTimeout(()=> setActivelyDragging(activelyDragging.filter(x=>x!==index)), 100); // wait for the lovely event bubble and say we are done
    //        moveApplied.current = 0; // moves applied
    //        currentIndex.current = 0; // currentIndex
    //        await props.gruntman.do( // call a gruntman function
    //            "macro.applyOrder", { 
    //                uid: props.uid, // pass it the things vvv
    //                order: order.current, 
    //                items: props.list.map(i=>{return {type:i.type, content:i.type==="project"?i.content.id:i.content}}),
    //            }
    //        );

    //        if (props.onSortEnd)
    //            props.onSortEnd({sorted: index, sortedID: props.list[index], newOrder: order.current, movementY, moveBy, list:props.list});

    //    }


    //}).bind(this), {drag:{delay:100}, filterTaps: true, enabled: dragEnabled})
    //let prevList = []
    
    //useEffect(() => {
    //    let isMounted = true;
    //    if (prevList != props.list && isMounted) {
    //        prevList = props.list
    //        setList(props.list)
    //    }

    //});

    //let [stateList, setList] = useState(props.list)
    //useEffect(() => {
    //    if (stateList != props.list) { setList(props.list) }

    //})
    
    //const reorder = async (order) => {
    //    await props.gruntman.do( // call a gruntman function
    //        "macro.applyOrder", { 
    //            uid: props.uid, // pass it the things vvv
    //            order: order, 
    //            //items: stateList.map(i=>{return {type:i.type, content:i.type==="project"?i.content.id:i.content}}),
    //            items: props.list.map(i=>{return {type:i.type, content:i.type==="project"?i.content.id:i.content}}),
    //        }
    //    );
    //}
    
    //const onDragEnd = result => {

	//if (!result.destination || (result.destination.droppableId == result.source.droppableId && result.destination.index == result.source.index)) {
	//    console.log("bad drop")
	//    return
	//}


	//let order = props.list.map(item => (item.sortOrder))
	//order.splice(result.source.index, 1);
	//order.splice(result.destination.index, 0, result.source.index);
	//reorder(order)



	//let list = props.list
	//let order = stateList.map(item => (item.sortOrder))
	//order.splice(result.source.index, 1);
	//order.splice(result.destination.index, 0, result.source.index);


	//let inDrag = stateList[result.source.index]
	//let list = stateList
	//list.splice(result.source.index, 1);
	//list.splice(result.destination.index, 0, inDrag);
	//setList(list)

	//console.log(order)
	//await props.gruntman.do( // call a gruntman function
	//    "macro.applyOrder", { 
	//        uid: props.uid, // pass it the things vvv
	//        order: order, 
	//        //items: stateList.map(i=>{return {type:i.type, content:i.type==="project"?i.content.id:i.content}}),
	//        items: props.list.map(i=>{return {type:i.type, content:i.type==="project"?i.content.id:i.content}}),
	//    }
	//);
	




    //}
    function usePrevious(value) {
	const ref = useRef();
	useEffect(() => {
	    ref.current = value;
	});
	return ref.current;
    }

    //let previousProps = null

    let [stateList, setList] = useState([])

    const prevList = usePrevious(props.list)

    useEffect(() => { // Whenever props change, set statelist
	//mounted = true
	//if (previous != props.list) {
	//    prevProps = props.list
	//    setList(props.list)
	//    console.log("setting propss")
	//}
	//if (stateList.length < 1) {
	//    setList(props.list)
	//    console.log(props.list, "no good")
	//}
	//console.log(stateList)
	
	//console.log(props.list, stateList, "yeeeeeet")
	if (prevList !== props.list) {
	    setList(props.list)
	    console.log("updatin")
	}
    }, [props.list])



    const onDragEnd = result => {
	// Bad drop code
	if (!result.destination || (result.destination.droppableId == result.source.droppableId && result.destination.index == result.source.index)) { return }

	let listItems = [...stateList]

	let inDrag = listItems[result.source.index]
	listItems.splice(result.source.index, 1);
	listItems.splice(result.destination.index, 0, inDrag);
	setList(listItems)

    }


// PRAHN:
    // have front end render out statelist
    // on drag, we reorder statelist
    // then we loop through statelist and apply order to each item
    // set statelist to props.list if props have changed? or will that break? 
	// set statelist to props.list if props.list != statelist before drag? 




    const renderTask = (item, i, provided, snapshot) => {
	return ( 
	    <div
		{...provided.draggableProps}
		{...provided.dragHandleProps}
		ref={provided.innerRef}
		key={item.content.id}
		    //style={{
		    //    //background: `${snapshot.isDragging ? "var(--menu-semiaccent-background)" : ""}`
		    //}}
	    >
		<div
		    style={{
			background: `${snapshot.isDragging ? "var(--background-feature)" : ""}`, // TODO: make this work
			borderRadius: "8px",

		    }}

		>
		<Task 
		    tid={item.content} key={item.content+"-"+props.prefix} datapack={props.datapack} uid={props.uid} engine={props.engine} gruntman={props.gruntman} availability={props.availability[item.content]}
		/>
		    </div>
	    </div>
	)
    }
   
    const renderProject = (item, i, provided, snapshot) => {
	if (item.type === "project" && (item.content.isComplete == props.parentComplete) || (item.content.isComplete != true && props.parentComplete == true)) {
	    return ( 
		    <div
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					ref={provided.innerRef}
					key={item.content.id}
		    >
		    <a className="subproject" 
			style={{
			    opacity:props.availability[item.content.id]?"1":"0.35",
			    background: `${snapshot.isDragging ? "var(--background-feature)" : ""}`, // TODO: make this work
			    borderRadius: "8px",
			}} 
			onClick={()=>{
			    props.paginate("projects", item.content.id);
			    props.history.push(`/projects/${item.content.id}`)
			    console.log(item)
			}}>
			<div><i className="far fa-arrow-alt-circle-right subproject-icon"/><div style={{display: "inline-block"}}>{props.possibleProjects[item.content.id]}</div></div></a>
		</div>
	    )
	}
    }


    return ( 
	<DragDropContext onDragEnd={onDragEnd}>
	    {//console.log(stateList, props.list)
	    }
	    <Droppable droppableId={"main"}
		renderClone={(provided, snapshot, rubric) => (
		    <div
		    >
			{(stateList[rubric.source.index].type == "task")? renderTask(stateList[rubric.source.index], rubric.source.index, provided, snapshot): renderProject(stateList[rubric.source.index], rubric.source.index, provided, snapshot)}
		    </div>
		)}
	    >
		{provided => (
		    <div
			ref = {provided.innerRef}
			{...provided.droppableProps}
		    >
			{stateList.map((item, i) => (
			    <Draggable draggableId={(item.type == "task")? item.content : item.content.id} key={item.content.id} index={i}
			    >
				{(provided, snapshot) => (
				    <div
					style={(snapshot.isDragging)? 
						{ 
						} 
						: {}}

				    >
					{(item.type == "task")? renderTask(item, i, provided, snapshot): renderProject(item, i, provided, snapshot)}
				    </div>

				)}
			    </Draggable>
			)
			)
			}
			{provided.placeholder}
		    </div>
		)}
	    </Droppable>
	</DragDropContext>
    );
}

export { SortableTaskList, SortableProjectList };



