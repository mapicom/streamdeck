import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { OBSWebSocket } from 'obs-websocket-js';
import { Blocks, ExecuteBlock, ParseScript } from "./interpreter.js";
import { Haptics, ImpactStyle } from '@capacitor/haptics';

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
    if(blockId && Blocks[blockId]) {
        ExecuteBlock(blockId);
        Haptics.impact({
            style: ImpactStyle.Medium
        }).catch(console.error);
    }
}

const statusElem = document.getElementById("status");
statusElem.onclick = async (event) => {
    connectWS();
};

function setStatus(new_status) {
    statusElem.className = new_status;
    const blocksElem = document.getElementById("blocks");
    switch (new_status) {
        case "online":
            statusElem.innerText = "Online";
            if(blocksCount > 0)
                blocksElem.childNodes.forEach(block => {
                    block.className = "block";
                });
            break;
        case "offline":
            statusElem.innerText = "Offline. Click here to connect.";
            if(blocksCount > 0)
                blocksElem.childNodes.forEach(block => {
                    block.className = "block disabled";
                });
            break;
        case "connecting":
            statusElem.innerText = "Connecting...";
            if(blocksCount > 0)
                blocksElem.childNodes.forEach(block => {
                    block.className = "block disabled";
                });
            break;
        default:
            statusElem.innerText = "Unknown status!";
    }
}

export let obs = null;
let isConnecting = false;
let hasWebSocketHost = false;
let webSocketHost = null;
let webSocketPass = null;
let blocksCount = 0;

const noBlocksText = `<span class="no-blocks">There is no blocks yet.<br>Create or upload user's configuration in setup.</span>`;

document.body.onload = async (event) => {
    const {value: isAcceptedRisk} = await Preferences.get({
        key: "accept-risk"
    });

    if(!isAcceptedRisk) {
        location.href = "./disclaimer.html";
        return;
    }

    const blocksElem = document.getElementById("blocks");

    // Load user script
    await Filesystem.readFile({
        path: "user.msds",
        directory: Directory.Data,
        encoding: Encoding.UTF8
    }).then(async res => {
        const data = res.data;

        const result = await ParseScript(data);
        if(result === true) {
            Object.values(Blocks).forEach(block => {
                block.addToPage();
                blocksCount++;
            });
        } else {
            console.error(`Error on ${result} line in user's script`);
            showNotification(`You have an error in your configuration at ${result} line.`);
        }
    })
    .catch(err => {
        console.error(err);
    });

    if(blocksCount === 0) {
        blocksElem.innerHTML = noBlocksText;
    }

    const {value: wsHost} = await Preferences.get({
        key: "ws-hostname"
    });

    const {value: wsPass} = await Preferences.get({
        key: "ws-password"
    });

    if(!wsHost) {
        return;
    }
    
    hasWebSocketHost = true;
    webSocketHost = wsHost;
    if(wsPass) webSocketPass = wsPass;
    statusElem.innerText = "Offline. Click here to connect.";

    console.log(`Will use address ${webSocketHost}`);

    if(location.hash === "#design") {
        const blocksElem = document.getElementById("blocks");
        blocksElem.childNodes.forEach(block => {
                block.className = "block";
            });
        return;
    }

    console.log("Running initWS...");
    initWS();
};

async function initWS() {
    obs = new OBSWebSocket();

    obs.on("ConnectionClosed", (error) => {
        setStatus("offline");
    });
    
    await connectWS();
}

async function connectWS() {
    if(!hasWebSocketHost) return;
    if(isConnecting) return;
    if(!obs.identified) {
        isConnecting = true;
        setStatus("connecting");
        try {
            if(!webSocketPass) await obs.connect(webSocketHost);
            else await obs.connect(webSocketHost, webSocketPass);

            isConnecting = false;
            console.log(obs.identified);
            setStatus("online");
        } catch (error) {
            console.error(error);
            isConnecting = false;
        }
    } else {
        obs.disconnect();
    }
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
            showNotification("Unable to set wake lock state.", 5000);
        }
    } else {
        wakeLock.release();
    }
};

const notificationElem = document.getElementById("notification");

notificationElem.onclick = (event) => {
    notificationElem.className = "";
};

export function showNotification(text, duration = 0) {
    notificationElem.innerText = text;
    notificationElem.className = "visible";
    if(duration > 0) {
        setTimeout(() => {
            notificationElem.className = "";
        }, duration);
    }
}
