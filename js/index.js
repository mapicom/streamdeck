import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { OBSWebSocket } from 'obs-websocket-js';
import { Blocks, ExecuteBlock, ParseScript } from "./interpreter.js";
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
statusElem.onclick = async (event) => {
    connectWS();
};

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
            statusElem.innerText = "Offline. Click here to connect.";
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
let isConnecting = false;
let hasWebSocketHost = false;
let webSocketHost = null;
let webSocketPass = null;

const noBlocksText = `<span class="no-blocks">There is no blocks yet.<br>Create or upload user's script in setup.</span>`;
const errorText = `<span class="no-blocks">You have an error in your script at {{_LINE_}} line.</span>`;

document.body.onload = async (event) => {
    const {value: isAcceptedRisk} = await Preferences.get({
        key: "accept-risk"
    });

    if(!isAcceptedRisk) {
        location.href = "./disclaimer.html";
        return;
    }

    eruda.init();

    const blocksElem = document.getElementById("blocks");
    let gotError = false;

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
            });
        } else {
            console.error(`Error on ${result} line in user's script`);
            blocksElem.innerHTML = errorText.replace("{{_LINE_}}", result.toString());
            gotError = true;
        }
    })
    .catch(err => {
        console.error(err);
    });

    if(!gotError && blocksElem.childNodes.length === 0) {
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
        }
    } else {
        wakeLock.release();
    }
};
