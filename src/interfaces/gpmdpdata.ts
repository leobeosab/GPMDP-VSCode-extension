export default interface GPMDPData {
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