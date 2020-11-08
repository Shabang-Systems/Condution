import React, { useState, useRef, useEffect } from 'react';
import { useDrag } from 'react-use-gesture'
import { useSprings, animated, interpolate } from 'react-spring'

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


    }).bind(this), {drag:{delay:100}, filterTaps: true})

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
                <Task ref={objRefs[i]} tid={id} key={id+"-"+props.prefix} datapack={props.datapack} uid={props.uid} engine={props.engine} gruntman={props.gruntman} availability={props.availability[id]} envelope={dragEnvelope}/>
            </animated.div>
            </div>
    )
    });
}

const SortableProjectList = (props)=>{

    const itemHeight = 42; // height of single item to calculate animation

    const [activelyDragging, setActivelyDragging] = useState([]); // we are actively dragging...

    const order = useRef();
    const moveApplied = useRef();
    const currentIndex = useRef();
    const dragEnvelope = useRef();


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
            await props.gruntman.do( // call a gruntman function
                "macro.applyOrder", { 
                    uid: props.uid, // pass it the things vvv
                    order: order.current, 
                    items: props.list.map(i=>{return {type:i.type, content:i.type==="project"?i.content.id:i.content}}),
                }
            );

            if (props.onSortEnd)
                props.onSortEnd({sorted: index, sortedID: props.list[index], newOrder: order.current, movementY, moveBy, list:props.list});

        }


    }).bind(this), {drag:{delay:100}, filterTaps: true})

    return props.list.map((item, i) => {
        let anim = springs[i];
        if (item.type === "task")
            return (
                <div ref = {dragEnvelope}>
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
                        <Task ref={props.activeTaskID===item.content ? props.activeTaskRef : objRefs[i]} tid={item.content} key={item.content+"-"+props.prefix} datapack={props.datapack} uid={props.uid} engine={props.engine} gruntman={props.gruntman} availability={props.availability[item.content]} envelope={dragEnvelope}/>
                    </animated.div>
                </div>
            )
        else if (item.type === "project") {
            return (
            <div ref={dragEnvelope}>
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
                    <a className="subproject" style={{opacity:props.availability[item.content.id]?"1":"0.35"}} onClick={()=>{props.paginate("projects", item.content.id);props.history.push(`/projects/${item.content.id}`)}}><div><i className="far fa-arrow-alt-circle-right subproject-icon"/><div style={{display: "inline-block"}}>{props.possibleProjects[item.content.id]}</div></div></a>
                </animated.div>
            </div>
            )
        }
    });
}

export { SortableTaskList, SortableProjectList };



