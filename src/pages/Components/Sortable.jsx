import React, { useState, useRef, useEffect } from 'react';
import { useDrag } from 'react-use-gesture'
import { useSprings, animated, interpolate } from 'react-spring'

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

    const [activelyDragging, setActivelyDragging] = useState([]); // we are actively dragging...

    const order = useRef();
    const moveApplied = useRef();
    const currentIndex = useRef();


    let objRefs = props.list.map(_ => React.createRef());

    const getAnimationDestinationFromIndex = (activeIndex, mY, currentOrder, noAnim) => (indx) => {
        return activeIndex === indx ?  {
                y: ((currentOrder.indexOf(indx) !== -1 ? currentOrder.indexOf(indx) : indx)-indx)*41 + mY-((currentOrder.indexOf(indx)-indx)*41), // number of tasks the index is out of place * height of task + cursor movement => correct dragged position offset
                zIndex:1000, 
                config: {tension: 100, friction: 2, mass: 1, clamp: true},
            immediate:noAnim
        } : {
                y: ((currentOrder.indexOf(indx) !== -1 ? currentOrder.indexOf(indx) : indx)-indx)*41,  // number of tasks the index is out of place * height of task => correct adjustment to position
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
    const bind = useDrag( (async function ({ args: [index], down, movement: [_, movementY] , first, last}) {

        if (first) {
            currentIndex.current = index;

            if (!activelyDragging.includes(index))
                setActivelyDragging([...activelyDragging, index]);

            if (props.onSortStart)
                props.onSortStart({sorted: index, sortedID: props.list[index], list: props.list});
        }

        let moveBy = Math.floor(movementY/41) // the amount of tasks the active task moved over
        moveBy = moveBy <= -index ? -index : (moveBy >= (props.list.length-index) ? props.list.length-1 : moveBy); // clip moveby by the total task it could possibly move over

        if (Math.abs(moveBy) > 0 && moveBy!==moveApplied.current) {
            // @enquierer crushing @jemoka's hopes and dreams
            let newIndex = index+moveBy;
            order.current.splice(currentIndex.current, 1); // splice element out
            order.current.splice(newIndex, 0, index); // splice the index in, noting that we just took something out
            moveApplied.current = moveBy;
            currentIndex.current = newIndex;
        }
        set(getAnimationDestinationFromIndex(index, movementY, order.current)) // set the animation function


        if (last) {// if we are done dragging
            setTimeout(()=> setActivelyDragging(activelyDragging.filter(x=>x!==index)), 100); // wait for the lovely event bubble and say we are done
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


    }).bind(this), {delay:500, filterTaps: true})

    return props.list.map((id, i) => {
        let anim = springs[i];
        return (
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
                <Task ref={objRefs[i]} tid={id} key={id+"-"+props.prefix} datapack={props.datapack} uid={props.uid} engine={props.engine} gruntman={props.gruntman} availability={props.availability[id]} />
            </animated.div>
    )
    });
}

export default SortableTaskList;



