import { IonModal, IonContent, IonSelect, IonSelectOption } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, {useEffect, useState} from 'react';
//import OutsideClickHandler from 'react-outside-click-handler';

// Capacitor Core Plugins
import { Plugins } from '@capacitor/core';


import "./ReleaseNotesModal.scss";

const { Storage } = Plugins;


/*
 * Hello human,
 * good morning.
 *
 * That's the point of this modal
 *
 * @jemoka
 *
 */



function ReleaseNotesModal(props) {
    let [isShown, setIsShown] = useState(false);
    useEffect(()=>{
        Storage.get({key: "condution_release"}).then((res) => {
            if (res.value!=="onezerozero") {
                setIsShown(true);
                Storage.set({key: "condution_release", value: "onezerozero"});
            }
        });
    }, []);

    return (
        <IonModal ref={props.reference} isOpen={isShown} onDidDismiss={() => {}} style={{borderRadius: 5}} cssClass="releasenote-popover auto-height">
            <div className="inner-content releasenote-inside">
                <div className="condution-callout"><span className="condution-name">Condution</span><span className="condution-vn">alpha-v1.0.0</span></div>
                <div className="releasenotes">Release Notes</div>
                <h1 className="header">👋 Hey, it's been a while.</h1>
                <p className="content">Thanks for entrusting Condution for your task management. After a few months of working on the app, we are ready to release our <b>next major version.</b></p>
                <p className="content">We promised to be a community driven task-management solution, and in 1.0, we aim do deliver on some of those promises. All of the features of 1.0 are proposed by our community <a href="https://discord.gg/3hS7yv3">on Discord</a> and <a href="https://github.com/Shabang-Systems/Condution">on GitHub</a>.</p>
                <h1 className="header">🏃 tl;dr</h1>
                <p className="content">A refreshed interface, tag weights, and shared workspaces comes to this all-new release of Condution. We are also building out an API so that you could customize it even further. Enjoy!</p>
                <p className="content">Now, here's a rundown of some major features added.</p>
                <div style={{borderTop: "solid 1px var(--background-feature)", width: "100%", height: 1}}>&nbsp;</div>
                <h1 className="header">🤝 Shared Workspaces</h1>
                <p className="content">On the Upcoming page, you will notice a new <a className="workspace-name" style={{display: "inline-block", margin: 0}}>Personal Workspace</a> icon. Tapping on that icon allows you to create, share, and open a workspace.</p>
                <p className="content">Here at Condution, we use workspaces to help manage our tasks too. We each have our own accounts, but share a collaborative Condution workspace.</p>
                <h1 className="header">🏷  Weighted Tags</h1>
                <p className="content">Throughout the interface, you will notice that we sprinkled some indicators (heatmaps, progressbars, etc.) of how much a project/group of tasks are completed. The weights of those indicators are driven by user-specificed tag weights!</p>
                <p className="content">The tag pane <i className="fas fa-tags"></i> accessible from every task allows you to pick tags and set their weights. These serve as the foundation of calculating the weight of a tag (and by extension, a project).</p>
                <p className="content">A "High Energy" tag, for instance, could have a higher weight; so, tasks tagged with that tag will be weighted more heavily.</p>
                <div style={{borderTop: "solid 1px var(--background-feature)", width: "100%", height: 1}}>&nbsp;</div>
                <h1 className="header">🙌 Cheerio</h1>
                <p className="content">Building Condution has been great fun for all of us; we hope you enjoy the app as well. As always, let us know if you have any feedback <a href="https://discord.gg/3hS7yv3">on Discord</a> or <a href="https://github.com/Shabang-Systems/Condution">on GitHub</a>.</p>
                <p className="content">If you would like to support our Development, we would be incredibly happy if you would pitch in on <a href="https://www.patreon.com/condution">Patreon</a>. Your contribution will help us keep servers running and features going.</p>
                <p className="content">As always, with ❤️  and 🥗, thanks for using Condution.</p>
            </div>
        </IonModal>
    )
}




export default ReleaseNotesModal;

