import React, { useState } from 'react';
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

    let [activelyDragging, setActivelyDragging] = useState([]); // we are actively dragging...

    const getAnimationDestinationFromIndex = (activeIndex, y, currentOrder) => (indx) => {
        return activeIndex === indx ?  {
            y: (currentOrder[indx]-indx)*40 + y, // number of tasks the index is out of place * height of task + cursor movement => correct dragged position offset
            zIndex:1000, 
            marginTopBottom: 10, 
            config: {tension: 100, friction: 2, mass: 1, clamp: true}
        } : {
            y: (currentOrder[indx]-indx)*40,  // number of tasks the index is out of place * height of task => correct adjustment to position
            zIndex:0, 
            marginTopBottom: 0
        }; // if the index is the one that's being dragged, move up by howevermuch needed
    }

    // the order!
    let order = props.list.map((_, i)=>i); // we start with just [0,1,2...]

    //const [{ x, y }, set] = useSpring(() => ({ x: 0, y: 0 }))
    const [springs, set, stop] = useSprings(props.list.length, getAnimationDestinationFromIndex(-1, 0, order))

    // Set the drag hook and define component movement based on gesture data
    const bind = useDrag(({ args: [index], down, movement: [_, movementY] , first, last}) => {
        let moveBy = Math.floor(movementY/40) // the amount of tasks the active task moved over

        moveBy = moveBy <= -index ? -index : (moveBy >= (props.list.length-index) ? props.list.length-1 : moveBy); // clip moveby by the total task it could possibly move over

        console.log(moveBy);
        set(getAnimationDestinationFromIndex(index, down?movementY:0, order)) // set the animation function
        if (Math.abs(movementY) > 10 && !activelyDragging.includes(index))// if we are actually dragging + draged more than 10 px
            setActivelyDragging([...activelyDragging, index]);
        if (last) {// if we are done dragging
            setTimeout(()=> setActivelyDragging(activelyDragging.filter(x=>x!==index)), 100); // wait for the lovely event bubble and say we are done
            // TODO probably should also calculate positions + hit the DB
            set(getAnimationDestinationFromIndex(-1, 0, order)) // reset animations
        }
    })

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
                    margin: interpolate([anim.marginTopBottom], (tb) => `${tb}px 2px`) // interpolate the margins
                }} 
                onClickCapture={(e)=>{
                    if (activelyDragging.includes(i)){ // if we are still dragging
                        e.stopPropagation(); // no clicky!
                    }
                }}
            >
                <Task tid={id} key={id+"-"+props.prefix} datapack={props.datapack} uid={props.uid} engine={props.engine} gruntman={props.gruntman} availability={props.availability[id]} />
            </animated.div>
    )
    });
}

export default SortableTaskList;



