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

    // the order!
    useEffect(() => {
        order.current = props.list.map((_, i)=>i); // we start with just [0,1,2...]
        moveApplied.current = 0; // moves applied
        currentIndex.current = 0; // currentIndex
    }, [props.list, props.uid]);


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


    //const [{ x, y }, set] = useSpring(() => ({ x: 0, y: 0 }))
    const [springs, set, stop] = useSprings(props.list.length, getAnimationDestinationFromIndex(-1, 0, order.current))

    // Set the drag hook and define component movement based on gesture data
    const bind = useDrag(({ args: [index], down, movement: [_, movementY] , first, last}) => {

        if (first) {
            currentIndex.current = index;

            if (!activelyDragging.includes(index))
                setActivelyDragging([...activelyDragging, index]);
        }

        let moveBy = Math.floor(movementY/40) // the amount of tasks the active task moved over
        moveBy = moveBy <= -index ? -index : (moveBy >= (props.list.length-index) ? props.list.length-1 : moveBy); // clip moveby by the total task it could possibly move over

        if (Math.abs(moveBy) > 0 && moveBy!==moveApplied.current) {
            // @enquierer crushing @jemoka's hopes and dreams
            let newIndex = index+moveBy;
            order.current.splice(currentIndex.current, 1); // splice element out
            order.current.splice(newIndex, 0, index); // splice the index in, noting that we just took something out
            console.log(currentIndex.current, newIndex, moveBy, order.current);
            moveApplied.current = moveBy;
            currentIndex.current = newIndex;
        }

        set(getAnimationDestinationFromIndex(index, down?movementY:0, order.current)) // set the animation function

        if (last) {// if we are done dragging
            setTimeout(()=> setActivelyDragging(activelyDragging.filter(x=>x!==index)), 100); // wait for the lovely event bubble and say we are done
            // TODO probably should also calculate positions + hit the DB
            set(getAnimationDestinationFromIndex(-1, 0, order.current)) // reset animations
        }


    }, {delay:500})

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



