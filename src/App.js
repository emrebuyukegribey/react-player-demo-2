import React, {useState, useRef} from 'react';
import { AppBar, Container, Toolbar, Typography } from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles'
import ReactPlayer from 'react-player';
import PlayerControls from './components/PlayerControls';
import screenfull from 'screenfull';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles({
  playerWrapper: {
    width: "100%",
    position: "relative",
  },
});

const format = (seconds) => {
  if(isNaN(seconds)) {
    return '00:00'
  }

  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, "0");
  if(hh) {
    return `${hh}:${mm.toString().padStart(2, "")}:${ss}`;
  }

  return `${mm}:${ss}`;
}

let count = 0;

function App() {

  const classes = useStyles();
  const [state, setState] = useState({
    playing: false,
    muted: false,
    volume: 0.5,
    playbackRate: 1.0,
    played: 0,
    seeking: false
  })

  const [timeDisplayFormat, setTimeDisplayFormat] = useState("normal");
  const [bookmarks, setBookmarks] = useState([])

  const {playing, muted, volume, playbackRate, played, seeking} = state;

  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const controlsRef = useRef(null);

  const handleRewind = () => {
    playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10);
  }

  const handleFastForward = () => {
    playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10);
  }

  const handlePlayPause = () => {
    console.log("handle play pause");
    setState({ ...state, playing: !state.playing});
  }

  const handleMute = () => {
    setState({...state, muted: !state.muted})
  }

  const handleVolumeChange = (e, newValue) => {
    setState({
      ... state, 
      volume: parseFloat(newValue / 100),
      muted: newValue === 0 ? true : false,
    })
  }

  const handleVolumeSeekUp = (e, newValue) => {
    setState({
      ... state, 
      volume: parseFloat(newValue / 100),
      muted: newValue === 0 ? true : false,
    })
  }

  const handlePlaybackRateChange = (rate) => {
    setState({ ...state, playbackRate: rate})
  }
  
  const toggleFullScreen = () => {
    screenfull.toggle(playerContainerRef.current)
  }

  const handleProgress = (changeState) => {
    console.log(changeState);

    if(count > 3) {
      controlsRef.current.style.visibility="hidden"
      count = 0
    }

    if(controlsRef.current.style.visibility == 'visible') {
      count += 1

    }

    if(!state.seeking) {
      setState({ ...state, ...changeState})
    }
    
  }

  const handleSeekChange = (e, newValue) => {
    setState({
      ...state,
      played: parseFloat(newValue / 100)
    });
  }

  const handleSeekMouseDown = (e) => {
    setState({
      ...state, 
      seeking: true
    })
  }

  const handleSeekMouseUp = (e, newValue) => {
    setState({
      ...state,
      seeking: false
    });

    playerRef.current.seekTo(newValue / 100);
  }

  const handleChangeDisplayFormat = () => {
    setTimeDisplayFormat(
      timeDisplayFormat === 'normal' ? 'remaining' : 'normal'
    );
  }

  const addBookmark = () => {
    const canvas = canvasRef.current;
    canvas.width = 160;
    canvas.height = 90;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      playerRef.current.getInternalPlayer(),
      0,
      0,
      canvas.width,
      canvas.height
    );
    const dataUri = canvas.toDataURL();
    canvas.width = 0;
    canvas.height = 0;
    const bookmarksCopy = [...bookmarks];
    bookmarksCopy.push({
      time: playerRef.current.getCurrentTime(),
      display: format(playerRef.current.getCurrentTime()),
      image: dataUri,
    });
    setBookmarks(bookmarksCopy);
  };

  const handleMouseMove = () => {
    controlsRef.current.style.visibility = "visible";
    count = 0 
  }

  const currentTime = playerRef.current ? playerRef.current.getCurrentTime() : '00:00';
  const duration = playerRef.current ? playerRef.current.getDuration() : '00:00';

  const elapsedTime = 
    timeDisplayFormat === 'normal' 
      ? format(currentTime)
      : `-${format(duration - currentTime)}`;
  const totalDuration = format(duration);
 
  return <>
    <AppBar position='fixed'>
      <Toolbar>
        <Typography variant="h6">React Video Player</Typography>
      </Toolbar>
    </AppBar>
    <Toolbar />
    <Container maxWidth="md">
      <div 
        ref={playerContainerRef} 
        className={classes.playerWrapper}
        onMouseMove={handleMouseMove}>
        <ReactPlayer
          ref={playerRef}
          width="100%"
          height="500px"
          url="https://www.youtube.com/watch?v=OrrrO91VwqI"
          muted={muted}
          playing={playing}
          volume={volume}
          playbackRate={playbackRate}
          onProgress={handleProgress}
          config={{
            file: {
              attributes: {
                crossOrigin: "anonymous"
              }
            }
          }}
        />

        <PlayerControls 
          ref={controlsRef}
          onPlayPause={handlePlayPause}
          playing={playing}
          onRewind={handleRewind}
          onFastForward={handleFastForward}
          muted={muted}
          onMute={handleMute}
          onVolumeChange={handleVolumeChange}
          onVolumeSeekUp={handleVolumeSeekUp}
          volume={volume}
          playbackRate={playbackRate}
          onPlaybackRateChange={handlePlaybackRateChange}
          onToggleFullScreen = {toggleFullScreen}
          played={played}
          onSeek={handleSeekChange}
          onSeekMouseDown={handleSeekMouseDown}
          onSeekMouseUp={handleSeekMouseUp}
          elapsedTime={elapsedTime}
          totalDuration={totalDuration}
          onChangeDisplayFormat={handleChangeDisplayFormat}
          onBookmark={addBookmark}
        />
      </div>

      <Grid container style={{marginTop: 20}} spacing={3}>
        {bookmarks.map((bookmark, index) => (
          <Grid item key={index}>
            <Paper onClick={() => playerRef.current.seekTo(bookmark.time)}>
              <img crossOrigin='anonymous' src={bookmark.image} />
              <Typography>Bookmark at{bookmark.display}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <canvas ref={canvasRef} />
    </Container>
  </>
}

export default App;
