import React, { Component } from 'react';
import "./Clickbutton.css";

function TaskButton(props) {
    return (<div className={"taskbutton "+(props.active?"taskbutton-active":"")} onClick={(e)=>{
        if (props.onClick)
            props.onClick(e);
    }}>
        <i className={"taskicon "+props.icon}/> 
        </div>)
}

export default function ClickButton(props) {
    return (<div className={"clickbutton "+(props.active?"clickbutton-active":"")} onClick={(e)=>{
        if (props.onClick)
            props.onClick(e);
    }}>
        <i className={"clickicon "+props.icon}/> 
        </div>)
}

export { TaskButton };

