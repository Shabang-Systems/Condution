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



function RollingReleaseNotesModal(props) {
    useEffect(()=>{

    }, []);

    return (
        <div
	    style={{
		borderRadius: 5,
		overflow: "scroll",
		height: "60vh",
		marginTop: "0.5rem",
	    }}
	    class="releasenote-popover"
	>
            <div className="inner-content rollingreleasenote-inside">
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





	    <div className="inner-content rollingreleasenote-inside">
		<div className="condution-callout"><span className="condution-name">Condution</span><span className="condution-vn">v1.0.2</span></div>
		<div className="releasenotes">Release Notes</div>
		<h1 className="header">👋 Hey, it's been a while.</h1>
		<p className="content">Thanks for entrusting Condution for your task management. After a few months of working on the app, we are ready to release our <b>next major version.</b></p>
		<p className="content">We promised to be a community driven task-management solution, and in 1.0, we aim do deliver on some of those promises. <a href="https://discord.gg/3hS7yv3">on Discord</a> and <a href="https://github.com/Shabang-Systems/Condution">on GitHub</a>.</p>
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

		<h1 className="header"> 📅 Task Calendar View </h1>
		<p className="content"> A new built-in tab comes to Condution! This is a much requested feature by this community. Tasks could now be viewed on a heatmap-style calendar that allows you to see how busy each day is at a glance. </p>
		<h1 className="header"> 📏 Upcoming Timeline </h1>
		<p className="content"> We replaced the one-week datebox on the Upcoming view with an infinitely-scrollable timeline! </p>
		<p className="content"> Tap "show timeline" below the Due-Soon section of Upcoming view and you will see every task with a due date sorted in chronological order. </p>
		<h1 className="header"> 🛌 Niceties </h1>
		<p className="content"> We added a plethora of niceties to make the app more fluid and streamlined. </p>
		<p className="content"> 
		    Just a few of these niceties include: completable projects, sidebar drag & drop, easy navigation with a quick-switcher and key-binds, deletable and editable tags, an intuitive perspective builder, deletable tasks, and so much more!</p> 
		<div style={{borderTop: "solid 1px var(--background-feature)", width: "100%", height: 1}}>&nbsp;</div>
		<h1 className="header">🙌 Cheerio</h1>
		<p className="content">Building Condution has been great fun for all of us; we hope you enjoy the app as well. As always, let us know if you have any feedback <a href="https://discord.gg/3hS7yv3">on Discord</a> or <a href="https://github.com/Shabang-Systems/Condution">on GitHub</a>.</p>
		<p className="content">If you would like to support our Development, we would be incredibly happy if you would pitch in on Patreon. Your contribution will help us keep servers running and features going.</p>
		<p className="content">As always, with ❤️  and 🥗, thanks for using Condution.</p>
	    </div>



	    <div className="inner-content rollingreleasenote-inside">
		<div className="condution-callout"><span className="condution-name">Condution</span><span className="condution-vn">v1.0.1</span></div>
		<div className="releasenotes">Release Notes</div>
		<h1 className="header">👋 Hey, it's been a while.</h1>
		<p className="content">Thanks for entrusting Condution for your task management. After a few months of working on the app, we are ready to release our <b>next major version.</b></p>
		<p className="content">We promised to be a community driven task-management solution, and in 1.0, we aim do deliver on some of those promises. <a href="https://discord.gg/3hS7yv3">on Discord</a> and <a href="https://github.com/Shabang-Systems/Condution">on GitHub</a>.</p>
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


	    <div className="inner-content rollingreleasenote-inside">
		<div className="condution-callout"><span className="condution-name">Condution</span><span className="condution-vn">alpha-v1.0.0</span></div>
		<div className="releasenotes">Release Notes</div>
		<h1 className="header">👋 Hey, it's been a while.</h1>
		<p className="content">Thanks for entrusting Condution for your task management. After a few months of working on the app, we are ready to release our <b>next major version.</b></p>
		<p className="content">We promised to be a community driven task-management solution, and in 1.0, we aim do deliver on some of those promises. <a href="https://discord.gg/3hS7yv3">on Discord</a> and <a href="https://github.com/Shabang-Systems/Condution">on GitHub</a>.</p>
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


        </div>
    )
}

export default RollingReleaseNotesModal;
