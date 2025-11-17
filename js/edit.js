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

    const loadExampleBtnElem = document.getElementById("put-example-btn");
    loadExampleBtnElem.onclick = async (event) => {
        try {
            const res = await fetch("/examples/example.msds");
            if(res.ok) {
                res.text().then(data => {
                    view.dispatch({
                        changes: {
                            from: 0,
                            to: view.state.doc.length,
                            insert: data
                        }
                    });
                    loadExampleBtnElem.className = "save_btn saved";
                    setTimeout(() => {
                        loadExampleBtnElem.className = "";
                    }, 1000);
                }).catch(err => {
                    console.error(err);
                    loadExampleBtnElem.className = "save_btn error";
                    setTimeout(() => {
                        loadExampleBtnElem.className = "";
                    }, 1000);
                });
            } else {
                console.error(res.status);
            }
        } catch (error) {
            console.error(error);
            loadExampleBtnElem.className = "save_btn error";
            setTimeout(() => {
                loadExampleBtnElem.className = "";
            }, 1000);
        }
    };

    const deleteBtn = document.getElementById("delete-btn");
    deleteBtn.onclick = async (event) => {
        if(confirm("Are you sure to delete current script?")) {
            Filesystem.deleteFile({
                directory: Directory.Data,
                path: "user.msds"
            }).then(res => {
                view.dispatch({
                    changes: {
                        from: 0,
                        to: view.state.doc.length,
                        insert: ""
                    }
                });
            }).catch(console.error);
        }
    };
};
