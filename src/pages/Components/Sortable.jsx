import React, { Component } from 'react';
import { useDrag } from 'react-use-gesture'
import { useSprings, animated, interpolate } from 'react-spring'

import Task from './Task';

const SortableTaskList = (props)=>{
    const getAnimationDestinationFromIndex = (activeIndex, y) => (indx) => {
        return activeIndex === indx ? {y, zIndex:1000} : {y: 0, zIndex:0}; // if the index is the one that's being dragged, move up by howevermuch needed
                                                       // if not, move up by nada
    }

    //const [{ x, y }, set] = useSpring(() => ({ x: 0, y: 0 }))
    const [springs, set, stop] = useSprings(props.list.length, getAnimationDestinationFromIndex(0, 0))

    // Set the drag hook and define component movement based on gesture data
    const bind = useDrag(({ args: [index], down, movement: [_, my] }) => {
        set(getAnimationDestinationFromIndex(index, down?my:0))
    })

    return props.list.map((id, i) => {
        let anim = springs[i];
        return (
            <animated.div 
                {...bind(i)} 
                style={{
                    zIndex: anim.zIndex,  // z-index is 1000 during drag
                    transform: interpolate([anim.y], (y) => `translate3d(0,${y}px,0)`) // interpolate the transform, b/c that's, uh, the dragging part
                }} 
                onClick={(e)=>{
                    if(anim.zIndex === 1000) // we are being dragged 
                        e.stopPropagation(); // no clicky!
                }}
            >
                <Task tid={id} key={id+"-"+props.prefix} datapack={props.datapack} uid={props.uid} engine={props.engine} gruntman={props.gruntman} availability={props.availability[id]} />
            </animated.div>
    )
    });
}

export default SortableTaskList;



