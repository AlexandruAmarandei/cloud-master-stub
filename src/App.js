import React, { Component } from 'react';
import './App.css';
import SpotifyPlayer from 'react-spotify-player';
import YouTube from 'react-youtube';
import SpotifyWebApi from 'spotify-web-api-js';
import { Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import SplitterLayout from 'react-splitter-layout';



const spotifyApi = new SpotifyWebApi();

const size = {
    width: '100%',
    height: '390',
};
const view = 'list'; // or 'coverart'
const theme = 'black'; // or 'white'
const youtubeOptions = {
    height: '390',
    width: '100%',
    playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: 1
    }
};
class App extends Component {


    constructor(){
        super();
        const params = this.getHashParams();
        var token = params.access_token;
        if (token) {
            spotifyApi.setAccessToken(token);
        }
        this.state = {
            loggedIn: token ? true : false,
            spotifyURI : 'spotify:track:2SL6oP2YAEQbqsrkOzRGO4',
            youtubeId: '2g811Eo7K8U',
            queue: [],
            votes: [],
            type: 's',
            nowPlaying: { name: 'Not Checked', albumArt: '' },
            currentSong: 0,
            token: token
        };
        // automatic refresh every 2 seconds
        let timerId = setInterval(() => this.updateQueueFromServer('tick'), 2000);
    }


    getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        e = r.exec(q)
        while (e) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
            e = r.exec(q);
        }
        return hashParams;
    }

    getNowPlaying(){
        spotifyApi.getMyCurrentPlaybackState()
            .then((response) => {
                this.setState({
                    nowPlaying: {
                        name: response.item.name,
                        albumArt: response.item.album.images[0].url
                    }
                });
            })
    }

    // call this function at the end of a song

    addSong( songLink, votes){
      var newQueue = this.state.queue;
      var newVotesQueue = this.state.votes;
      newQueue.push(songLink);
      newVotesQueue.push(votes);
      this.setState({queue : newQueue});
      this.setState({votes: newVotesQueue});

    }

    onSongEnd(){
        this.playNext();
    }

    updateQueueFromServer(){
        this.addSong("spotify:track:2SL6oP2YAEQbqsrkOzRGO4", 0);
        this.addSong("2g811Eo7K8U", 0);
        //var newQueue = getQueueFromServer();
        //this.setState({queue: newQueue});
    }

    // call this on the page refresh
    // we might need to expand this
    refreshPage(){
        //this.playNext();
    }

    playNext(){
      this.updateQueueFromServer();

        if (this.state.queue === undefined || this.state.queue.length == 0) {
            // if queue is empty
            //             //
        }else {
            this.playSong(0);
        }
    }

    playSong(songPosition){
        var newCurrentSongs = this.state.currentSong + 1;
        this.setState({currentSong: newCurrentSongs });
        this.setState({type: "n"});
        var newCurrentSong = this.state.queue[songPosition];
        this.removeSong(songPosition);
        if(newCurrentSong.startsWith('spotify:')) {
            this.setState({type: 's', spotifyURI: newCurrentSong});
        }else{
            this.setState({type: 'y', youtubeId: newCurrentSong});
        }


    }

    removeSong(songPosition){
        this.state.queue.splice(songPosition, 1);
        this.state.votes.splice(songPosition, 1);
        // this should call our api and remove a song
    }
    render() {
        return (
            <div >

                <a href='http://localhost:8888' > Login to Spotify </a>
                <a> Token: {this.state.token} </a>
                <div>
                    Now Playing: { this.state.nowPlaying.name }
                </div>
                <button onClick={() => this.getNowPlaying("spotify:track:2SL6oP2YAEQbqsrkOzRGO4")}>
                    Get now playing.
                </button>
                <SplitterLayout>
                <div>
                { this.state.type === "s" && this.state.currentSong % 2 === 1 &&
                    <SpotifyPlayer
                        uri= {this.state.spotifyURI}
                        size={size}
                        view={view}
                        theme={theme}
                    />
                }
                { this.state.type === "s" && this.state.currentSong %2 === 0 &&
                    <SpotifyPlayer
                        uri= {this.state.spotifyURI}
                        size={size}
                        view={view}
                        theme={theme}
                    />
                 }
                {this.state.type === "y" && this.state.currentSong %2 === 1 &&
                    <YouTube
                        videoId= {this.state.youtubeId}
                        opts={youtubeOptions}
                    />

                }
                {this.state.type === "y" && this.state.currentSong %2 === 0 &&
                    <YouTube
                        videoId= {this.state.youtubeId}
                        opts={youtubeOptions}
                    />

                }
                </div>

                <div>
                    {this.displaySongs()}
                </div>
                </SplitterLayout>

            </div>
        );
    }

    displaySongs(){
        return(
        <div className = "songs">
        <ListGroup>
            {this.displaySongList()}
        </ListGroup>
        </div>
        );
     }

    displaySongList(){
       var currentSongsInQueue = this.state.queue;
       return currentSongsInQueue.map(
            (song, i) =>
                <ListGroupItem>
                    { !song.startsWith('spotify:') &&
                        <img src={require('./youtubeLogo.png')} width="50" height="50"/>
                    }
                    {  song.startsWith('spotify:') &&
                        <img src={require('./spotifyLogo.png')} width="50" height="50"/>
                    }
                    <Button bsStyle="primary" onClick={() => this.playSong(i)}>
                        Play
                    </Button>
                    {song}
                    <span> </span> Votes: {this.state.votes[i]}
                    <Button bsStyle="primary" onClick={() => this.removeSong(i)}>
                        Remove
                    </Button>
                </ListGroupItem>
       );}


    _onReady(event) {
        // access to player in all event handlers via event.target
        event.target.pauseVideo();
    }


}

export default App;
