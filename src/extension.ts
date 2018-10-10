import {window, StatusBarAlignment, StatusBarItem, ExtensionContext} from 'vscode';
import {readFileSync} from 'fs';

interface GPMDPData {
    playing: boolean,
    song: {
        title: String,
        artist: String,
        album: String,
        albumArt: String
    },
    rating: {
        liked: boolean,
        disliked: boolean
    },
    time: {
        current: number,
        total: number
    },
    songLyrics: String,
    volume?: number,
    shuffle?: String,
    repeat?: String
}

export function activate(context: ExtensionContext) {
    console.log("controller ready");

    let mc = new MusicController();
    setInterval(mc.updateStatusBar.bind(mc), 1000);

}

class MusicController {
    private _statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 10);
    private _songData?: GPMDPData;

    private progressDone: String = "-"
    private progressNotDone: String = "~";

    public constructor() {
        this.updateStatusBar();
        this._statusBarItem.show();
    }

    public updateStatusBar() {
        this._songData = this.getSongData();
        if (!this._songData)
            return;
        
        let currentTime = Math.floor((this._songData.time.current / 60000)) + ":" + Math.round(((this._songData.time.current % 60000) / 1000));
        let totaltime = Math.floor((this._songData.time.total / 60000)) + ":" + Math.round(((this._songData.time.total % 60000) / 1000));

        let playPause = this._songData.playing ? "$(octicon-triangle-right)" : "$(octicon-primitive-square)";
        let songtitle = this._songData.song.title + " : " + this._songData.song.artist;
        let progress = "$(octicon-triangle-right) ["+currentTime+" / "+totaltime+"]";

        this._statusBarItem.text = playPause + " " + songtitle + " " + progress;
    }

    private getSongData(): GPMDPData {
        return JSON.parse(readFileSync(process.env.APPDATA + "\\Google Play Music Desktop Player\\json_store\\playback.json").toString());
    }

    dispose() {
        console.log("dispose");
        this._statusBarItem.dispose();
    }
}