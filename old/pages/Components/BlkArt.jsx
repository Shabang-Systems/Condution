import React, { useEffect, useState } from 'react';
import cactus from '../../static/BlkArt/BlkArt_0.png';
import lazer from '../../static/BlkArt/BlkArt_1.png';
import lotus from '../../static/BlkArt/BlkArt_2.png';

import './BlkArt.css';

/*
 * Hello human,
 * good morning.
 *
 * CACTUS.
 *
 * @jemoka
 *
 */

function BlkArt(props) {

    let [image, setImage] = useState(lazer);

    useEffect(()=>{
        if (!props.visible) {
            let array = [cactus, lazer, lotus];
            setImage(array[Math.floor(Math.random() * array.length)]);
        }
    }, [props.visible]);

    return (
        <div className="blkArt" style={{display: props.visible ? "flex":"none"}}>
            <img className="blkArt-content" src={image} />
            <div className="blkArt-text"><span className="blkArt-title">{props.title}</span><span className="blkArt-subtitle">{props.subtitle}</span></div>
        </div>
    )
}

export default BlkArt;
