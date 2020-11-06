import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Pages.css';

const autoBind = require('auto-bind/react');

function Loader(props) {
    return (
        <div style={{width: "100%", height: "100%", position: "absolute", display: "flex", justifyContent: "center", alignItems: "center"}}>
            <div style={{marginRight: 20, maxWidth: 500}}>
                <b>Condution v1.0.0-alpha.0</b> <br />

                    <i>Like, why are you reading this?</i> <br />

                    If there is something here [{props.error}], <br />
                then talk to Jack or something. Or fix it. <br />
                    INTERNAL USE ONLY. DO NOT DISTRIBUTE.
            </div>
            <div style={{marginLeft: 20, maxWidth: 500}}>
                <br />

                <pre style={{fontSize: 10}}>
                    {`
    Copyright (C) 2019-2020. Shabang Systems, LLC

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see https://www.gnu.org/licenses/.
                    `}
                </pre>
            </div>

        </div>
    )
}

export default Loader;

