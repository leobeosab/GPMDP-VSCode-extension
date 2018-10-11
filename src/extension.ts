import {window, StatusBarAlignment, StatusBarItem, ExtensionContext} from 'vscode';
import {readFileSync} from 'fs';

interface GPMDPData {
    playing: boolean,
    song: {
        title: string,
        artist: string,
        album: string,
        albumArt: string
    },
    rating: {
        liked: boolean,
        disliked: boolean
    },
    time: {
        current: number,
        total: number
    },
    songLyrics: string,
    volume?: number,
    shuffle?: string,
    repeat?: string
}

export function activate(context: ExtensionContext) {
    let mc = new MusicController();
    setInterval(mc.updateStatusBar.bind(mc), 1000);
}

class MusicController {
    private _statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 10);
    private _songData?: GPMDPData;

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

        let playPause = this._songData.playing ? "$(triangle-right)" : "$(primitive-square)";
        let songtitle = this._songData.song.title + " : " + this._songData.song.artist;
        let progress = " ["+currentTime+" / "+totaltime+"]";

        this._statusBarItem.text = playPause + " " + songtitle + " " + progress;
    }

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