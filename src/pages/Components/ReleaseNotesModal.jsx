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
            if (res.value!=="onetwozero" && props.authType!=="workspace") {
                setIsShown(true);
                Storage.set({key: "condution_release", value: "onetwozero"});
            }
        });
    }, []);

    return (
        <IonModal ref={props.reference} isOpen={isShown} onDidDismiss={() => {}} style={{borderRadius: 5}} cssClass="releasenote-popover auto-height">
            <div className="inner-content releasenote-inside">
                <div className="condution-callout"><span className="condution-name">Condution</span><span className="condution-vn">1.2.0 <b>snow crash</b></span></div>
                <div className="releasenotes">Release Notes</div>
                <h1 className="header"> 👋 Heyooyoo! How goes it? </h1>
                <p className="content">Thanks for entrusting Condution for your task management. We are back with a release packed with cool user experience updates.</p>
                <h1 className="header"> 🏃 tl;dr </h1>
                <p className="content">Tags pane! Settings page! Command Palette! Wiz through our interface with blazing speed.</p>
                <div style={{borderTop: "solid 1px var(--background-feature)", width: "100%", height: 1}}>&nbsp;</div>
                <h1 className="header"> ⚙️ Settings Page </h1>
              <p className="content">Take a looksee! To the right of the logout button, there's now a new setting page.</p>
              <p className="content">This is your new, central place to control things like keybinds (see below!), tags, and customizable theming!.</p>
                <h1 className="header"> ⌨️️ Global Keybinds </h1>
              <p className="content">You can now wizz through our interface with brand-new global keybinds controllable in the new settings panel.</p>
                <p className="content">Getting things done has never required so little clicking!</p>
                <h1 className="header"> 🤛 Action Island </h1>
	      <p className="content"> To the right of the logout button, there is now a sandwich menu filled with actions. </p>
	      <p className="content"> Quickswitcher? It's there. Command Palette? Yup. Of course, you can pop open this panel from anywhere using new keybinds. </p>
                <div style={{borderTop: "solid 1px var(--background-feature)", width: "100%", height: 1}}>&nbsp;</div>
                <h1 className="header"> 🙌 Cheerio </h1>
                <p className="content">Building Condution has been great fun for all of us; we hope you enjoy the app as well. As always, let us know if you have any feedback <a href="https://discord.gg/3hS7yv3">on Discord</a> or <a href="https://github.com/Shabang-Systems/Condution">on GitHub</a>.</p>
              <p className="content">If you would like to support our Development, we would be incredibly happy if you would pitch in to support us; more details are on GitHub. Your contribution will help us keep servers running and features going.</p>
                <p className="content">As always, with ❤️  and 🥗, thanks for using Condution.</p>
            </div>
        </IonModal>
    )
}




export default ReleaseNotesModal;

