import React, { useEffect, useState } from 'react';
import { useKBar } from 'kbar';

const CommandPaletteHookExposer = (props) => {
    const [prev, setPrev] = useState(0);

    let { query } = useKBar()

    useEffect(() => {
	console.log(props.update)
	if (props.update != 0 && props.update != prev) {
	    setPrev(props.update)
	    query.setVisualState("visible");
	}
    }, [props.update]);

    return ( <></> )
}

export default CommandPaletteHookExposer;
