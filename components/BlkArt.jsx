import React, { useEffect, useState } from 'react';

import Image from 'next/image'

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

    let [image, setImage] = useState('../shared/static/BlkArt/BlkArt_2.png');

    useEffect(()=>{
        if (!props.visible) {
            let array = [
                '../shared/static/BlkArt/BlkArt_0.png',
                '../shared/static/BlkArt/BlkArt_1.png',
                '../shared/static/BlkArt/BlkArt_2.png',
            ];
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
