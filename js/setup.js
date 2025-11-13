import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import eruda from "eruda";

const hostnameElem = document.getElementById("hostname");
const passwordElem = document.getElementById("password");
const scriptFileElem = document.getElementById("script-file");
const saveBtnElem = document.getElementById("save-btn");

document.body.onload = async (event) => {
    eruda.init();

    const {value: wsHost} = await Preferences.get({
        key: "ws-hostname"
    });

    if(wsHost) {
        hostnameElem.value = wsHost;
    }

    const {value: wsPass} = await Preferences.get({
        key: "ws-password"
    });

    if(wsPass) {
        passwordElem.value = wsPass;
    }
};

saveBtnElem.onclick = async (event) => {
    if(hostnameElem.value === "") {
        await Preferences.remove({
            key: "ws-hostname"
        });
    } else {
        await Preferences.set({
            key: "ws-hostname",
            value: hostnameElem.value
        });
    }

    if(passwordElem.value === "") {
        await Preferences.remove({
            key: "ws-password"
        });
    } else {
        await Preferences.set({
            key: "ws-password",
            value: passwordElem.value
        });
    }

    if(scriptFileElem.files.length === 1) {
        const file = scriptFileElem.files[0];
        if(file.name.length > 5 && file.name.slice(file.name.length-4) === "msds") {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target.result;
                Filesystem.writeFile({
                    path: "user.msds",
                    data: content,
                    directory: Directory.Data,
                    encoding: Encoding.UTF8
                }).then(res => {
                    console.log(res);
                    saveBtnElem.textContent = "Saved";
                    saveBtnElem.className = "save_btn saved";
                    setTimeout(() => {
                        saveBtnElem.textContent = "Save";
                        saveBtnElem.className = "save_btn";
                    }, 1000);
                })
                .catch(error => {
                    console.error(error);
                    saveBtnElem.textContent = "Error";
                    saveBtnElem.className = "save_btn error";
                    setTimeout(() => {
                        saveBtnElem.textContent = "Save";
                        saveBtnElem.className = "save_btn";
                    }, 1000);
                });
            };

            reader.readAsText(file);
        } else {
            console.log(file.type, file.name);
            saveBtnElem.textContent = "Select .msds file";
            saveBtnElem.className = "save_btn error";
            setTimeout(() => {
                saveBtnElem.textContent = "Save";
                saveBtnElem.className = "save_btn";
            }, 1000);
        }
    } else {
        saveBtnElem.textContent = "Saved";
        saveBtnElem.className = "save_btn saved";
        setTimeout(() => {
            saveBtnElem.textContent = "Save";
            saveBtnElem.className = "save_btn";
        }, 1000);
    }
};
