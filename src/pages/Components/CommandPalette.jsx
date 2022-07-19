//import React, { useEffect, useState } from 'react';
import * as React from "react";
import "./CommandPalette.scss";

import { withShortcut, ShortcutProvider, ShortcutConsumer } from '../../static/react-keybind'
//import { KBarProvider , KBarPortal, KBarPositioner, KBarAnimator, KBarSearch, useMatches, NO_GROUP, KBarResults } from "kbar";
import {
    ActionId,
    KBarAnimator,
    KBarProvider,
    KBarPortal,
    KBarPositioner,
    KBarSearch,
    KBarResults,
    createAction,
    useMatches,
    useRegisterActions,
    ActionImpl,
    useKBar,
} from "kbar";
import { nanoid } from 'nanoid'


const searchStyle = {
    padding: "12px 16px",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
    border: "none",
    //background: "var(--background-feature)",
    background: "var(--ion-background-color)",
    //background: "var(--background-feature)",
    //color: "var(--foreground)",
    //color: "var(--menu-background)",
    //color: "white",
    color: "var(--decorative-light-accent)",
    //color: "var(--content-normal-accent)",
};

const animatorStyle = {
    maxWidth: "600px",
    width: "100%",
    //background: "var(--background)",
    //background: "var(--background-feature)",
    background: "var(--ion-background-color)",
    //color: "var(--foreground)",
    color: "var(--decorative-light-accent)",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "var(--shadow)",
    //boxShadow: "0px 13px 39px var(--qs-shadow-intensity) var(--qs-shadow-color);",
};

const groupNameStyle = {
    padding: "8px 16px",
    fontSize: "10px",
    textTransform: "uppercase",
    opacity: 0.5,
};


function CommandPalette(props) {
    const [shouldUpdate, setShouldUpdate] = React.useState(0);
    const { shortcut } = props;

    const { query } = useKBar();

    const getActions = () => {
	
	let actionDict = {}
    
	let actions = []

	const { shortcut } = props;
	// check if keybind already exists
	// if so, push the new shortcut keys to the existing shortcut keys, 
	// otherwise, create a new keybind
	for (const [idx, s] of shortcut.shortcuts.entries()) {
	    const [,registerType, registerId] = s.description.split("&")[1].split("/")
	    const [,currentType, currentId] = window.location.pathname.split("/")
	    // if we are in a project,
		// ignore perspective keybinds
		// ignore keybinds that are not in the current project
	    // if we are in a perspective,
		// ignore project keybinds
		// ignore keybinds that are not in the current perspective
	    // if we are not in either, ignore keybinds from both

	    //if (registerType === "project" && currentType === "project") {
	    //console.log(registerType, currentType, ["project", "perspective"].includes(registerType))
	    if (
		(["projects", "perspectives"].includes(registerType)) && 
		(["projects", "perspectives"].includes(currentType)) // if we are in either a project or perspective,
	    ) {
		if (registerType != currentType) { // if we are in diff types
		    //console.log("no good", registerId, currentId, s, 1)
		    continue;
		}
		
		if (registerId != currentId  // if we are in diff ids
		    && currentType != "projects")  // projects don't seem to err?
		{
		    //console.log("no good", registerId, currentId, s, 2)
		    continue;
		}
	    } 

	    if (!["projects", "perspectives"].includes(currentType)) { // if we are not in either,
		if (["projects", "perspectives"].includes(registerType)) { // and we registered in one
		    //console.log("no good", registerId, currentId, s, 3)
		    continue
		}
		
		// if register type is different and not home, then don't show it
		if (
		    s.description.split("&").length != 3  && // not registered in home
		    (["completed", "upcoming", "calendar"].includes(registerType)) && 
		    (["completed", "upcoming", "calendar"].includes(currentType)) && // both in one of the constant pages
		    registerType != currentType) // but the constant pages dont match
		{
		    //console.log("no good", registerId, currentId, s, 4)
		    continue
		}
	    }

	    if (s.title in actionDict) {
		if (!actions[actionDict[s.title]].keys.includes(...s.keys)) {
		    actions[actionDict[s.title]].keys.push(...s.keys)
		    //console.log(s.keys, "whee", actions[actionDict[s.title]].keys)
		}
	    } else {
		actionDict[s.title] = actions.length
		actions.push(s)
	    }
	}
	actions = actions.map(v => {
	    return {
		id: nanoid(),
		name: v.title,
		subtitle: v.description.split("&")[0],
		//subtitle: v.description,
		shortcut: Array.from(new Set(v.keys)),
		perform: () => { 
		    setTimeout(() => {
			//console.log("running keyind function from palette", v.title)
			v.method() 
		    }, 10) // man.
		},
		keywords: v.description, // jank?
		//section: "test",
	    }
	})

	//console.log(shortcut, actions.map(v => v.perform), "here.")
	actions.push({

	})

	return actions
    }

    //const { shortcut } = props;
    //console.log("sfs", shortcut.shortcuts)

    useRegisterActions([], [shortcut.shortcuts])
    useRegisterActions(getActions(), [shortcut.shortcuts])
    //console.log(props, useKBar())

    return (
	<KBarPortal>
		    <div style={{
			position: "absolute",
			//height: "100vh",
			//width: "100vh",
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
			//border: "1px solid red",
			background: "#000",
			opacity: "0.5",
		    }}> 

		    </div>
	    <KBarPositioner>
		<KBarAnimator style={animatorStyle}>
		    <KBarSearch style={searchStyle} />
		    <RenderResults />
		</KBarAnimator>
	    </KBarPositioner>
	</KBarPortal>
    );
}

function RenderResults() {
  const { results, rootActionId } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === "string" ? (
          <div style={groupNameStyle}>{item}</div>
        ) : (
          <ResultItem
            action={item}
            active={active}
            currentRootActionId={rootActionId}
          />
        )
      }
    />
  );
}








const ResultItem = React.forwardRef(
  (
    {
      action,
      active,
      currentRootActionId,
    }: {
      action: ActionImpl;
      active: boolean;
      currentRootActionId: ActionId;
    },
    ref: React.Ref<HTMLDivElement>
  ) => {
    const ancestors = React.useMemo(() => {
      if (!currentRootActionId) return action.ancestors;
      const index = action.ancestors.findIndex(
        (ancestor) => ancestor.id === currentRootActionId
      );
      // +1 removes the currentRootAction; e.g.
      // if we are on the "Set theme" parent action,
      // the UI should not display "Set theme… > Dark"
      // but rather just "Dark"
      return action.ancestors.slice(index + 1);
    }, [action.ancestors, currentRootActionId]);

    return (
      <div
        ref={ref}
        style={{
          padding: "12px 16px",
          background: active ? "var(--background-feature)" : "transparent",
          borderLeft: `2px solid ${
            active ? "var(--content-normal-accent)" : "transparent"
          }`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            fontSize: 14,
          }}
        >
          {action.icon && action.icon}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div>
              {ancestors.length > 0 &&
                ancestors.map((ancestor) => (
                  <React.Fragment key={ancestor.id}>
                    <span
                      style={{
                        opacity: 0.5,
                        marginRight: 8,
                      }}
                    >
                      {ancestor.name}
                    </span>
                    <span
                      style={{
                        marginRight: 8,
                      }}
                    >
                      &rsaquo;
                    </span>
                  </React.Fragment>
                ))}
              <span>{action.name}</span>
            </div>
            {action.subtitle && (
              <span style={{ fontSize: 12 }}>{action.subtitle}</span>
            )}
          </div>
        </div>
        {action.shortcut?.length ? (
          <div
            aria-hidden
            style={{ display: "grid", gridAutoFlow: "column", gap: "4px" }}
          >
            {action.shortcut.map((sc) => (
	    sc && 
              <kbd
                key={nanoid()}
                style={{
	          color: "var(--decorative-light-accent)",
                  padding: "4px 6px",
                  background: "var(--content-normal)",
                  borderRadius: "4px",
                  fontSize: 14,
                }}
              >
                {sc}
              </kbd>
	    
            ))}
          </div>
        ) : null}
      </div>
    );
  }
);


export default withShortcut(CommandPalette);
