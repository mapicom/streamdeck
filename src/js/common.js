
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';

const setLightStatusBar = async () => {
    await StatusBar.setStyle({ style: Style.Dark });
};

setLightStatusBar();

App.addListener('resume', setLightStatusBar);
