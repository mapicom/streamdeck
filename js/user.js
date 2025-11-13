import { Block, obs } from "./index.js";

new Block("Сцена: Start", "#27ae60", async () => {
    await obs.call("SetCurrentProgramScene", {
        sceneName: "Start"
    });
});

new Block("Сцена: Main", "#27ae60", async () => {
    await obs.call("SetCurrentProgramScene", {
        sceneName: "Main"
    });
});

new Block("Микрофон", "#2980b9", async () => {
    const inputName = "Mic/Aux";
    const { inputMuted } = await obs.call("ToggleInputMute", {
        inputName
    });

    await obs.call("SetSourceFilterEnabled", {
        sourceName: "Webcam",
        filterName: "Composite Blur",
        filterEnabled: inputMuted
    });
});

new Block("Desktop Audio", "#2980b9", async () => {
    const inputName = "Desktop Audio";
    const { inputMuted } = await obs.call("ToggleInputMute", {
        inputName
    });
});

new Block("Блюр захвата", "#9b59b6", async () => {
    const inputName = "Capture";
    const { inputMuted } = await obs.call("ToggleInputMute", {
        inputName
    });

    await obs.call("SetSourceFilterEnabled", {
        sourceName: "Capture",
        filterName: "Composite Blur",
        filterEnabled: inputMuted
    });
});

new Block("Вкл/выкл вебку", "#34495e", async () => {
    const { sceneItemId } = await obs.call("GetSceneItemId", {
        sceneName: "Main",
        sourceName: "Webcam"
    });

    const { sceneItemEnabled } = await obs.call("GetSceneItemEnabled", {
        sceneName: "Main",
        sceneItemId: sceneItemId
    });

    await obs.call("SetSceneItemEnabled", {
        sceneName: "Main",
        sceneItemId: sceneItemId,
        sceneItemEnabled: !sceneItemEnabled
    });
});

new Block("Запись", "#c0392b", async () => {
    await obs.call("ToggleRecord");
});
