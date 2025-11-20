# Mapicom StreamDeck
This application allows you to use your tablet or other mobile device to quickly control OBS Studio functions through its built-in WebSocket server.

Originally, it was intended to be a simple web application running in a browser, but Security Context limitations made this impossible, and running it via HTTPS is not feasible because the OBS WebSocket server operates in an unsecured mode*. Therefore, this application uses Capacitor, which allows it to run as a native Android or iOS application, albeit through a WebView.

*Nevertheless, you can use a WebSocket connection over HTTPS through [tunneling](https://github.com/obsproject/obs-websocket/wiki/SSL-Tunneling).

## Preparing OBS Studio
Enable the WebSocket server as follows:
1. Click the **Tools (T)** menu and select **WebSocket Server Settings**.
2. Set the server password in the corresponding field.
3. Set the desired port or keep the default one.
4. Check the box next to **Enable WebSocket server**.
5. Click **OK**.

It is highly recommended to set a password, especially if you are not the only user on your local network.

## Writing a configuration file
The configuration file contains the buttons (blocks) that will be displayed on the application's screen, as well as the actions they will perform.

The configuration uses a simple syntax like the example below:
```
block "Scene: Main" #27ae60 {
    SetCurrentScene "Main"
}

block "Microphone" #2980b9 {
    ToggleInputMute "Mic/Aux"
}
```


Each block is defined with three components: the `block` keyword, followed by its name in quotes, and then a color in HEX format (the `#` prefix is mandatory). After this comes a space and an opening curly brace `{`.

Inside the block, you list the commands that will be sent to OBS Studio. At the moment, the list of commands is limited, but it includes the most important ones. Each command occupies one line. If an argument contains spaces, it must be enclosed in quotes.

Command names are inspired by the original OBS WebSocket naming, though some may differ slightly.

See the list of commands in `docs/COMMANDS.md`.

After writing the commands for the block, close it with a closing curly brace `}` on a new line.

The configuration file must end with the `.msds` extension.

## Third-party libraries used in this project
* [Capacitor](https://capacitorjs.com/) and its official plugins.
* [obs-websocket-js](https://github.com/obs-websocket-community-projects/obs-websocket-js)
* [Vite](https://vite.dev/) for packaging the web application.
* [node-html-to-image](https://github.com/frinyvonnick/node-html-to-image) for rendering the logo.
* ... and their dependencies.
