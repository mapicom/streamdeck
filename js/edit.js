import { basicSetup } from "codemirror";
import { EditorView, keymap } from "@codemirror/view";
import { sass } from "@codemirror/lang-sass";
import { defaultKeymap } from "@codemirror/commands"
import { oneDark } from "@codemirror/theme-one-dark";
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import eruda from "eruda";

document.body.onload = async (event) => {
    eruda.init();

    let content = '';
    // Load user script
    await Filesystem.readFile({
        path: "user.msds",
        directory: Directory.Data,
        encoding: Encoding.UTF8
    }).then(async res => {
        content = res.data;
    })
    .catch(err => {
        console.error(err);
    });

    const view = new EditorView({
        doc: content,
        parent: document.getElementById("main"),
        extensions: [
            basicSetup,
            sass(),
            keymap.of(defaultKeymap),
            oneDark,
        ]
    });

    const saveBtnElem = document.getElementById("save-btn");
    saveBtnElem.onclick = async (event) => {
        await Filesystem.writeFile({
            path: "user.msds",
            directory: Directory.Data,
            encoding: Encoding.UTF8,
            data: view.state.doc.toString()
        }).then(async res => {
            content = res.data;
            saveBtnElem.textContent = "Saved";
            saveBtnElem.className = "save_btn saved";
            setTimeout(() => {
                saveBtnElem.textContent = "Save";
                saveBtnElem.className = "save_btn";
            }, 1000);
        })
        .catch(err => {
            saveBtnElem.textContent = "Error";
            saveBtnElem.className = "save_btn error";
            setTimeout(() => {
                saveBtnElem.textContent = "Save";
                saveBtnElem.className = "save_btn";
            }, 1000);
            console.error(err);
        });
    };
};
