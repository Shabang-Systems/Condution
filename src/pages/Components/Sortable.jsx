import React, { useState } from 'react';
import { useDrag } from 'react-use-gesture'
import { useSprings, animated, interpolate } from 'react-spring'

import Task from './Task';

const SortableTaskList = (props)=>{

    let activelyDragging = []; // we are actively dragging...

    const getAnimationDestinationFromIndex = (activeIndex, y) => (indx) => {
        return activeIndex === indx ? {y, zIndex:1000, marginTopBottom: 10, config: {tension: 150, friction: 2, mass: 1, clamp: true}} : {y: 0, zIndex:0, marginTopBottom: 0}; // if the index is the one that's being dragged, move up by howevermuch needed
    }

    //const [{ x, y }, set] = useSpring(() => ({ x: 0, y: 0 }))
    const [springs, set, stop] = useSprings(props.list.length, getAnimationDestinationFromIndex(-1, 0))

    // Set the drag hook and define component movement based on gesture data
    const bind = useDrag(({ args: [index], down, movement: [_, my] , first, last}) => {
        set(getAnimationDestinationFromIndex(index, down?my:0)) // set the animation function
        if (Math.abs(my) > 10 && !activelyDragging.includes(index)) // if we are actually dragging + draged more than 10 px
            activelyDragging.push(index); // we are dragging
        if (last) {// if we are done dragging
            setTimeout(()=>activelyDragging.pop(activelyDragging.indexOf(index)), 100); // wait for the lovely event bubble and say we are done
            // TODO probably should also calculate positions + hit the DB
            set(getAnimationDestinationFromIndex(-1, 0)) // reset animations
        }
    })

    return props.list.map((id, i) => {
        let anim = springs[i];
        return (
            <animated.div 
                {...bind(i)} 
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



