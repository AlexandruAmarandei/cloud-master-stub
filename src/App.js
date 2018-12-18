import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import SpotifyWebApi from 'spotify-web-api-js';
const spotifyApi = new SpotifyWebApi();
// things to look into
// should the queue be a state? i don't think so
// normalize
class App extends Component {
    constructor(){
        super();
        const params = this.getHashParams();
        const token = params.access_token;
        if (token) {
            spotifyApi.setAccessToken(token);
        }
        this.state = {
            queue: [],
            loggedIn: token ? true : false,
            type: 's',
            nowPlaying: { name: 'Not Checked', albumArt: '' }
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

    addSong( songLink){
      var newQueue = this.state.queue;
      newQueue.push(songLink);
      this.setState({queue : newQueue});

    }

    onSongEnd(){
        this.playNext();
    }

    updateQueueFromServer(){
        //var newQueue = getQueueFromServer();
        //this.setState({queue: newQueue});
    }

    // call this on the page refresh
    // we might need to expand this
    refreshPage(){
        this.playNext();
    }

    playNext(){
      this.updateQueueFromServer();
        if (this.state.queue === undefined || this.state.queue.length == 0) {
            // if queue is empty
            //
        }else {
            var newCurrentSong = this.state.queue.shift();
            //check if song is from youtube or from spotify
            this.setState({type: 's'});
            this.setState({nowPlaying: {name: newCurrentSong}});
        }
    }

    // to add spotify and youtube specific api
  // and to add display a list of songs also giving the possiblity to play them now or remove them
    render() {
        return (
            <div className="App">
                <a href='http://localhost:8888' > Login to Spotify </a>
                <div>
                    Now Playing: { this.state.nowPlaying.name }
                </div>
                <div>
                    <img src={this.state.nowPlaying.albumArt} style={{ height: 150 }}/>
                </div>
                { this.state.loggedIn &&
                <button onClick={() => this.getNowPlaying()}>
                    Check Now Playing
                </button>
                }
                <button onClick={() => this.addSong()}>
                    {this.state.queue}
                </button>


            </div>
        );
    }
}

export default App;
