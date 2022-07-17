import React, { useEffect, useState } from 'react';
import { KBarProvider , KBarPortal, KBarPositioner, KBarAnimator, KBarSearch, useMatches, NO_GROUP, KBarResults } from "kbar";


const CommandPalette = () => {

    return (
	<KBarPortal>
	    <KBarPositioner>
		<KBarAnimator>
		    <KBarSearch />
		    <RenderResults />;
		</KBarAnimator>
	    </KBarPositioner>
	</KBarPortal>
    )
}

const RenderResults = () =>  {
    const { results } = useMatches();

    return (
	<KBarResults
	    items={results}
	    onRender={({ item, active }) =>
		    typeof item === "string" ? (
			<div>{item}</div>
		    ) : (
			<div
			    style={{
				background: active ? "#eee" : "transparent",
			    }}
			>
			    {item.name}
			</div>
		    )
	    }
	/>
    );
}

export default CommandPalette;
