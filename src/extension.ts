import {window, StatusBarAlignment, StatusBarItem, ExtensionContext, commands} from 'vscode';
import {readFileSync} from 'fs';
const WebSocket = require('ws');
//Custom imports
import GPMDPData from './interfaces/gpmdpdata';


export function activate(context: ExtensionContext) {
    let mc = new MusicController();
    setInterval(mc.updateStatusBar.bind(mc), 1000);

    commands.registerCommand('player.pair', () => {
        console.log("pairing....")
        mc.pair();
    });

}

class MusicController {
    private _statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 10);
    private _connectionString: string = "ws://localhost:5672";
    private _connected: boolean = false;
    private _MAX_ATTEMPTS: number = 3;

    private _songData?: GPMDPData;
    private _ws: any;

    public constructor() {
        this.connect();
        this.updateStatusBar();
        this._statusBarItem.show();
    }

    // Take data from object and format it for StatusBar
    public updateStatusBar() {
        this._songData = this.getSongData();
        if (!this._songData)
            return;
        
        let currentTime = Math.floor((this._songData.time.current / 60000)) + ":" + Math.round(((this._songData.time.current % 60000) / 1000));
        let totaltime = Math.floor((this._songData.time.total / 60000)) + ":" + Math.round(((this._songData.time.total % 60000) / 1000));

        let playPause = this._songData.playing ? "$(triangle-right)" : "$(primitive-square)";
        let songtitle = this._songData.song.title + " : " + this._songData.song.artist;
        let progress = " ["+currentTime+" / "+totaltime+"]";

        this._statusBarItem.text = playPause + " " + songtitle + " " + progress;
    }

    public pair() {
        const connectionObject = {
            namespace: 'connect',
            method: 'connect',
            arguments: ["Visual Studio: Code"]
        };
        this.sendData(connectionObject);
    }

    private connect() {
        this._ws = new WebSocket(this._connectionString);
        this._ws.on('open', () => this._connected = true);
        this._ws.on('close', () => this._connected = false);

        this._ws.on('message', (data: any) => console.log(data));
    }

    private sendData(data: object, attempts: number = 0) {
        console.log(data, this._connected, attempts);
        if (!this._connected) {
            this.connect();
            attempts++

            if (attempts <= this._MAX_ATTEMPTS)
                setTimeout(() => this.sendData(data, attempts), 500);
            else
                window.showErrorMessage('Error could not connect to player');
            return;
        }

        this._ws.send(JSON.stringify(data));
    }

    // Read JSON file store don system
    private getSongData(): GPMDPData | undefined {
        try {
            return JSON.parse(readFileSync(process.env.APPDATA + "\\Google Play Music Desktop Player\\json_store\\playback.json").toString());
        } catch (e) {
            console.log(e)
            return undefined;
        }
    }

    dispose() {
        this._statusBarItem.dispose();
    }
}