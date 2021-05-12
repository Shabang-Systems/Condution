import Head from 'next/head';

import React, { useEffect } from 'react';

import '@ionic/react/css/core.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Themefiles */
import '../shared/themefiles/condutiontheme-default-adapter.css';
import '../shared/themefiles/condutiontheme-default.css';
import '../shared/themefiles/condutiontheme-default-dark.css';
import '../shared/themefiles/condutiontheme-default-light.css';
//import../shared/./themefiles/condutiontheme-default-new.css';
import '../shared/themefiles/condutiontheme-black-n-red.css';

/* Font awesome */
import '../shared/static/fa/scripts/all.min.css';

/* Theme variables */
import '../shared/theme/variables.css';

/* Old Styleshets */
import '../shared/styles/Pages.css'
import '../shared/styles/Task.css'
import '../shared/styles/BlkArt.css'
import '../shared/styles/Repeat.css'
import '../shared/styles/Calendar.css'
import '../shared/styles/TagEditor.css'
import '../shared/styles/FirstInteraction.css'


import LocalizedStrings from 'react-localization';

import Context from "../components/ContextWizard";

import $ from "jquery";

let localizations = new LocalizedStrings({
    en: require("../shared/static/I18n/main.json"),
    zh: require("../shared/static/I18n/zh-CN.json"),
    de: require("../shared/static/I18n/de-DE.json"),
});

function App({ Component, pageProps }) {
    useEffect(()=> {
        if (window.matchMedia('(prefers-color-scheme:dark)').matches) {
            $("body").removeClass();
            $("body").addClass("condutiontheme-default-dark");
        }
        else {
            $("body").removeClass();
            $("body").addClass("condutiontheme-default-light");
        }
    }, []);

    return (
        <>
            <Head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0, viewport-fit=cover"
                ></meta>
                <script src="https://unpkg.com/ionicons@5.2.3/dist/ionicons.js"></script>
            </Head>
            <Component {...pageProps} cm={Context} localizations={localizations} />
        </>
    );
}

export default App;

//export default App;
