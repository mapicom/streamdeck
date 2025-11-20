import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';

document.body.onload = async (event) => {
    const acceptBtnElem = document.getElementById("accept-btn");
    const quitBtnElem = document.getElementById("quit-btn");

    const devInfo = await Device.getInfo();
    if(devInfo.platform !== "android") {
        quitBtnElem.remove();
    }

    acceptBtnElem.onclick = async (event) => {
        await Preferences.set({
            key: "accept-risk",
            value: "true"
        });

        location.href = "./index.html";
    };

    quitBtnElem.onclick = async (event) => {
        await App.exitApp();
    };
};
