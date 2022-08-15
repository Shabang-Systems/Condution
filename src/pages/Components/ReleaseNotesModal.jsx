import { IonModal, IonContent, IonSelect, IonSelectOption } from '@ionic/react';
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
            if (res.value!=="oneonezero" && props.authType!=="workspace") {
                setIsShown(true);
                Storage.set({key: "condution_release", value: "oneonezero"});
            }
        });
    }, []);

    return (
        <IonModal ref={props.reference} isOpen={isShown} onDidDismiss={() => {}} style={{borderRadius: 5}} cssClass="releasenote-popover auto-height">
            <div className="inner-content releasenote-inside">
                <div className="condution-callout"><span className="condution-name">Condution</span><span className="condution-vn">1.1.1 <b>echos</b></span></div>
                <div className="releasenotes">Release Notes</div>
                <h1 className="header"> 👋 Hewo! How goes it? </h1>
                <p className="content">Thanks for entrusting Condution for your task management. Its been a few months of busy-backend work here at the Condution shops.</p>
                <p className="content">Also, a few cool front-end features have been added per overwhelming user request. Learn more about them on the notes below!</p>
                <h1 className="header"> 🏃 tl;dr </h1>
                <p className="content">Revitalized backend with mach-10 speed and smoothness, plugins and self-hosting (coming soon), Markdown enabled descriptions, and Drag and Drop Everywhere!</p>
                <div style={{borderTop: "solid 1px var(--background-feature)", width: "100%", height: 1}}>&nbsp;</div>
                <h1 className="header"> 🚀 Speed </h1>
                <p className="content">You may notice the app being <b>significantly</b> faster. We have worked <a href="https://github.com/Shabang-Systems/CondutionEngine/commits/v1.1.0">quite hard</a> in improving the speed and efficiency (and, honestly, code clarity) of the new backend.</p>
                <p className="content">Through this refactor, an integration system is now possible. This also laid the groundwork for self hosting and a plugin ecosystem, due to release late summer.</p>
                <h1 className="header"> ⬇️ Markdown descriptions </h1>
                <p className="content">The description field now supports Markdown! So <b>**this**</b>, <i>_this_</i> and <b style={{color:"blue"}}>#this</b> your way to success!</p>
                <p className="content">Psst: you can now press the down arrow to expand the description field so that you can write to your heart's content!</p>
                <h1 className="header"> 🤛 Draggy </h1>
		<p className="content"> We have updated the dragging experience such that dragging... Tasks into tasks! Projects into tasks! Tasks into projects! all have unique meaning and a beautiful spring animation. Try it out! </p>
                <div style={{borderTop: "solid 1px var(--background-feature)", width: "100%", height: 1}}>&nbsp;</div>
                <h1 className="header"> 🙌 Cheerio </h1>
                <p className="content">Building Condution has been great fun for all of us; we hope you enjoy the app as well. As always, let us know if you have any feedback <a href="https://discord.gg/3hS7yv3">on Discord</a> or <a href="https://github.com/Shabang-Systems/Condution">on GitHub</a>.</p>
                <p className="content">If you would like to support our Development, we would be incredibly happy if you would pitch in on Patreon. Your contribution will help us keep servers running and features going.</p>
                <p className="content">As always, with ❤️  and 🥗, thanks for using Condution.</p>
            </div>
        </IonModal>
    )
}




export default ReleaseNotesModal;

