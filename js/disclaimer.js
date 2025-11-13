import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';

document.body.onload = async (event) => {
    const acceptBtnElem = document.getElementById("accept-btn");
    const quitBtnElem = document.getElementById("quit-btn");

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
