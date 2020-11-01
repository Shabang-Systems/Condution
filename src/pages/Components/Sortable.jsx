import React, { Component } from 'react';
import { useDrag } from 'react-use-gesture'
import { useSpring, animated } from 'react-spring'

import Task from './Task';

const SortableTaskList = (props)=>{
      const [{ x, y }, set] = useSpring(() => ({ x: 0, y: 0 }))
  // Set the drag hook and define component movement based on gesture data
  const bind = useDrag(({ down, movement: [mx, my] }) => {
    set({ x: down ? mx : 0, y: down ? my : 0 })
  })

    return props.list.map(id => {
        return <animated.div {...bind()} style={{marginBottom: y}} onDragStart={(e)=>e.stopPropagation()}><Task tid={id} key={id+"-"+props.prefix} datapack={props.datapack} uid={props.uid} engine={props.engine} gruntman={props.gruntman} availability={props.availability[id]} /></animated.div>
    });
}

export default SortableTaskList;
 


