// Copyright (c) Maksim Pinigin <at@pinig.in>. Licensed under the MIT Licence.
// See the LICENCE file in the repository root for full licence text.

import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';

const setLightStatusBar = async () => {
    await StatusBar.setStyle({ style: Style.Dark });
};

setLightStatusBar();

App.addListener('resume', setLightStatusBar);
