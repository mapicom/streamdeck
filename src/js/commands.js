// Copyright (c) Maksim Pinigin <at@pinig.in>. Licensed under the MIT Licence.
// See the LICENCE file in the repository root for full licence text.

import { obs, showNotification } from "./index.js";

export const Commands = {
    "SetCurrentScene": async function (args) {
        if(args.length === 2) {
            try {
                await obs.call("SetCurrentProgramScene", {
                    sceneName: args[1]
                });
            } catch (error) {
                console.error(error);
                showNotification(`${args[0]}: ${error}`, 8000);
                return false;
            }

            return true;
        } else {
            console.error(`${args[0]}: Missed required scene name`);
            showNotification(`${args[0]}: Missed required scene name`, 8000);
            return false;
        }
    },

    "ToggleInputMute": async function (args) {
        if(args.length >= 2) {
            let forceToggle = null;
            if(args.length === 3) {
                if(args[2] === "1") forceToggle = true;
                else if(args[2] === "0") forceToggle = false;
            }

            if(forceToggle === null) {
                try {
                    await obs.call("ToggleInputMute", {
                        inputName: args[1]
                    });
                } catch (error) {
                    console.error(`${args[0]}: ${error}`);
                    showNotification(`${args[0]}: ${error}`, 8000);
                    return false;
                }
            } else {
                try {
                    await obs.call("SetInputMute", {
                        inputName: args[1],
                        inputMuted: forceToggle
                    });
                } catch (error) {
                    console.error(`${args[0]}: ${error}`);
                    showNotification(`${args[0]}: ${error}`, 8000);
                    return false;
                }
            }

            return true;
        } else {
            console.error(`${args[0]}: Missed required input name`);
            showNotification(`${args[0]}: Missed required input name`, 8000);
            return false;
        }
    },

    "ToggleSourceFilter": async function (args) {
        if(args.length >= 3) {
            let forceToggle = null;
            if(args.length === 4) {
                if(args[3] === "1") forceToggle = true;
                else if(args[3] === "0") forceToggle = false;
            }

            if(forceToggle === null) {
                try {
                    const { filterEnabled } = await obs.call("GetSourceFilter", {
                        sourceName: args[1],
                        filterName: args[2]
                    });

                    await obs.call("SetSourceFilterEnabled", {
                        sourceName: args[1],
                        filterName: args[2],
                        filterEnabled: !filterEnabled
                    });
                } catch (error) {
                    console.error(`${args[0]}: ${error}`);
                    showNotification(`${args[0]}: ${error}`, 8000);
                    return false;
                }
            } else {
                await obs.call("SetSourceFilterEnabled", {
                    sourceName: args[1],
                    filterName: args[2],
                    filterEnabled: forceToggle
                });
            }

            return true;
        } else {
            console.error(`${args[0]}: Missed required source and filter name`);
            showNotification(`${args[0]}: Missed required source and filter name`, 8000);
            return false;
        }
    },

    "ToggleSceneItem": async function (args) {
        if(args.length >= 3) {
            let forceToggle = null;
            if(args.length === 4) {
                if(args[3] === "1") forceToggle = true;
                else if(args[3] === "0") forceToggle = false;
            }

            let itemId = null;
            try {
                const { sceneItemId } = await obs.call("GetSceneItemId", {
                    sceneName: args[1],
                    sourceName: args[2]
                });
                itemId = sceneItemId;
            } catch (error) {
                console.error(`${args[0]}: ${error}`);
                showNotification(`${args[0]}: ${error}`, 8000);
                return false;
            }

            console.log(itemId);

            if(forceToggle === null) {
                try {
                    const { sceneItemEnabled } = await obs.call("GetSceneItemEnabled", {
                        sceneName: args[1],
                        sceneItemId: itemId
                    });

                    await obs.call("SetSceneItemEnabled", {
                        sceneName: args[1],
                        sceneItemId: itemId,
                        sceneItemEnabled: !sceneItemEnabled
                    });
                } catch (error) {
                    console.error(`${args[0]}: ${error}`);
                    showNotification(`${args[0]}: ${error}`, 8000);
                    return false;
                }
            } else {
                try {
                    await obs.call("SetSceneItemEnabled", {
                        sceneName: args[1],
                        sceneItemId: itemId,
                        sceneItemEnabled: forceToggle
                    });
                } catch (error) {
                    console.error(`${args[0]}: ${error}`);
                    showNotification(`${args[0]}: ${error}`, 8000);
                }
            }

            return true;
        } else {
            console.error(`${args[0]}: Missed required scene and source name`);
            showNotification(`${args[0]}: Missed required scene and source name`, 8000);
            return false;
        }
    },

    "ToggleRecord": async function (args) {
        let forceToggle = null;
        if(args.length === 2) {
            if(args[1] === "1") forceToggle = true;
            else if(args[1] === "0") forceToggle = false;
        }

        if(forceToggle === null) {
            try {
                await obs.call("ToggleRecord");
            } catch (error) {
                console.error(`${args[0]}: ${error}`);
                showNotification(`${args[0]}: ${error}`, 8000);
            }
        } else {
            try {
                if(forceToggle) await obs.call("StartRecord");
                else await obs.call("StopRecord");
            } catch (error) {
                console.error(`${args[0]}: ${error}`);
                showNotification(`${args[0]}: ${error}`, 8000);
            }
        }
    }
};
