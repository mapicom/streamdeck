/*
 *  Novokuznetsk, Siberia @ 12.11.2025
*/

import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { OBSWebSocket } from 'obs-websocket-js';
import { Blocks, ExecuteBlock, ParseScript } from "./interpreter.js";
import { Commands } from './commands.js';
import eruda from "eruda";

export class Block {
    constructor(name, color) {
        this.name = name;
        this.color = color;
        this.code = [];
        this.id = crypto.randomUUID();
    }

    addToPage() {
        const blocksElem = document.getElementById("blocks");
        
        const newDiv = document.createElement("div");
        newDiv.className = "block disabled";
        newDiv.style.backgroundColor = this.color;
        newDiv.dataset.id = this.id;
        newDiv.innerHTML = this.name.replaceAll("\n", "<br>");
        newDiv.onclick = handleBlock;

        blocksElem.appendChild(newDiv);
    }
}

function handleBlock(event) {
    if(obs === null || !obs.identified) return;
    const element = event.target;
    if(element.classList.length === 2) return;
    console.log(`Clicked on ${element.dataset.id}`);
    const blockId = element?.dataset?.id;
    if(blockId && Blocks[blockId]) ExecuteBlock(blockId);
}

const statusElem = document.getElementById("status");
function setStatus(new_status) {
    statusElem.className = new_status;
    const blocksElem = document.getElementById("blocks");
    switch (new_status) {
        case "online":
            statusElem.innerText = "Online";
            blocksElem.childNodes.forEach(block => {
                block.className = "block";
            });
            break;
        case "offline":
            statusElem.innerText = "Offline";
            blocksElem.childNodes.forEach(block => {
                block.className = "block disabled";
            });
            break;
        case "connecting":
            statusElem.innerText = "Connecting...";
            blocksElem.childNodes.forEach(block => {
                block.className = "block disabled";
            });
            break;
        default:
            statusElem.innerText = "Unknown status!";
    }
}

export let obs = null;

document.body.onload = async (event) => {
    eruda.init();

    // Load user script
    Filesystem.readFile({
        path: "user.msds",
        directory: Directory.Data,
        encoding: Encoding.UTF8
    }).then(async res => {
        const data = res.data;

        const result = await ParseScript(data);
        if(result === true) {
            Object.values(Blocks).forEach(block => {
                block.addToPage();
            });
        } else {
            console.error(`Error on ${result} line in user's script`);
        }
    })
    .catch(err => {
        console.error(err);
    });

    const {value: wsHost} = await Preferences.get({
        key: "ws-hostname"
    });

    const {value: wsPass} = await Preferences.get({
        key: "ws-password"
    });

    if(!wsHost) {
        return;
    }

    console.log(`Will use address ${wsHost}`);

    if(location.hash === "#design") {
        const blocksElem = document.getElementById("blocks");
        blocksElem.childNodes.forEach(block => {
                block.className = "block";
            });
        return;
    }

    console.log("Running initWS...");
    initWS(wsHost, wsPass);
};

async function initWS(wsHost, wsPass = null) {
    let isConnecting = false;
    obs = new OBSWebSocket();
    setInterval(async () => {
        if(isConnecting) return;
        if(!obs.identified) {
            isConnecting = true;
            setStatus("connecting");
            try {
                if(!wsPass) await obs.connect(wsHost);
                else await obs.connect(wsHost, wsPass);

                isConnecting = false;
                console.log(obs.identified);
                setStatus("online");
            } catch (error) {
                console.error(error);
                isConnecting = false;
            }
        }
    }, 1000);

    obs.on("ConnectionClosed", (error) => {
        setStatus("offline");
    });
}

const wakeLockElem = document.getElementById("wake-lock");
let wakeLock = null;
wakeLockElem.onclick = async (event) => {
    if(wakeLock === null) {
        try {
            wakeLock = await navigator.wakeLock.request("screen");
            wakeLockElem.classList = "wake_lock enabled";

            wakeLock.onrelease = async () => {
                wakeLockElem.className = "wake_lock disabled";
                wakeLock = null;
            };
        } catch (error) {
            console.error(error);
        }
    } else {
        wakeLock.release();
    }
};
