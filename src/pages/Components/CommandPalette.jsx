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
    background: "var(--background)",
    //color: "var(--foreground)",
    //color: "var(--menu-background)",
    color: "white",
};

const animatorStyle = {
    maxWidth: "600px",
    width: "100%",
    background: "var(--background)",
    //color: "var(--foreground)",
    color: "white",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "var(--shadow)",
};

const groupNameStyle = {
    padding: "8px 16px",
    fontSize: "10px",
    textTransform: "uppercase",
    opacity: 0.5,
};






//const CommandPalette = (props) => {
//    const { shortcut } = props;
//    //console.log(shortcut);

//    return (
//        <KBarPortal>
//            <KBarPositioner>
//                <KBarAnimator>
//                    <KBarSearch />
//                    <RenderResults />;
//                </KBarAnimator>
//            </KBarPositioner>
//        </KBarPortal>
//    )
//}

//const RenderResults = () =>  {
//    const { results } = useMatches();

//    return (
//        <KBarResults
//            items={results}
//            onRender={({ item, active }) =>
//                    typeof item === "string" ? (
//                        <div>{item}</div>
//                    ) : (
//                        <div
//                            style={{
//                                background: active ? "#eee" : "transparent",
//                            }}
//                        >
//                            {item.name}
//                        </div>
//                    )
//            }
//        />
//    );
//}


function CommandPalette(props) {
    const { query } = useKBar();
    const getActions = () => {
	const { shortcut } = props;
	
	let actionDict = {}
    
	let actions = []

	// check if keybind already exists
	// if so, push the new shortcut keys to the existing shortcut keys, 
	// otherwise, create a new keybind
	for (const [idx, s] of shortcut.shortcuts.entries()) {
	    if (s.title in actionDict) {
		actions[actionDict[s.title]].keys.push(s.keys)
		//console.log(actionDict)
		    //.keys.push(s.keys)
	    } else {
		actionDict[s.title] = actions.length
		actions.push(s)
	    }
	}

	actions = actions.map(v => {
	    return {
		id: nanoid(),
		name: v.title,
		subtitle: v.desciption, // TODO impl
		shortcut: v.keys,
		perform: () => { 
		    setTimeout(() => {
			v.method() 
		    }, 1) // man.
		},
		keywords: v.desciption, // jank?
	    }
	})
	
	//let actions = shortcut.shortcuts.map(v => {
	//    return {
	//        id: nanoid(),
	//        name: v.title,
	//        subtitle: v.desciption, // TODO impl
	//        shortcut: v.keys,
	//        perform: () => { 
	//            setTimeout(() => {
	//                v.method() 
	//            }, 1) // man.
	//        },
	//        keywords: v.desciption, // jank?
	//    }
	//})

	//let actions = [
	//    {
	//        id: "blog",
	//        name: "Blog",
	//        shortcut: ["b"],
	//        keywords: "writing words",
	//        perform: () => (window.location.pathname = "blog"),
	//    },
	//    {
	//        id: "contact",
	//        name: nanoid(),
	//        shortcut: ["c"],
	//        keywords: "email",
	//        perform: () => (window.location.pathname = "contact"),
	//    },
	//]
	return actions
    }
    //useDocsActions();
    //useThemeActions();
    useRegisterActions(getActions(), [props.historyPath, props.mounted])
    //const idk = () => {
    //}
    //React.useEffect(() => {
    //    console.log("hist changing");
    //    const { shortcut } = props
    //    //console.log(shortcut.shortcuts.length)
    //    //useRegisterActions(getActions())
    //    idk()
    //}, [props.historyPath])
    return (
	<KBarPortal>
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
          background: active ? "var(--a1)" : "transparent",
          borderLeft: `2px solid ${
            active ? "var(--foreground)" : "transparent"
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
              <kbd
                key={sc}
                style={{
                  padding: "4px 6px",
                  background: "rgba(0 0 0 / .1)",
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
