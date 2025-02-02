import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { BACKEND_API_URL } from '../utils/helpers';
import { Play, Pause } from 'lucide-react';
const socket = io(BACKEND_API_URL);

const VideoPlayer = ({ isAdmin }) => {
    const videoRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(false);

    useEffect(() => {
        const video = videoRef.current;

        video.addEventListener('loadedmetadata', () => {
            setDuration(video.duration);
        });

        const interval = setInterval(() => {
            if (video.paused) return;
            setCurrentTime(video.currentTime);
        }, 100);

        socket.on('video-control', (data) => {
            const video = videoRef.current;
            if (data.action === 'play') {
                video.play();
                setIsPlaying(true);
            } else if (data.action === 'pause') {
                video.pause();
                setIsPlaying(false);
            }
        });

        socket.on('seek-video', (timestamp) => {
            const video = videoRef.current;
            video.currentTime = timestamp;
            setCurrentTime(timestamp);
        });

        return () => clearInterval(interval);
    }, []);

    const togglePlayPause = () => {
        const video = videoRef.current;
        if (video.paused) {
            socket.emit('video-control', { action: 'play' });
            video.play();
            setIsPlaying(true);
        } else {
            socket.emit('video-control', { action: 'pause' });
            video.pause();
            setIsPlaying(false);
        }
    };

    const handleSeek = (e) => {
        const timestamp = e.target.value;
        socket.emit('seek-video', timestamp);
        videoRef.current.currentTime = timestamp;
        setCurrentTime(timestamp);
    };

    return (
        <div
            className="video-container"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <video
                ref={videoRef}
                src={`${BACKEND_API_URL}/video/stream`}
                className="video"
                onClick={togglePlayPause}
            ></video>

            <div className={`controls-overlay ${showControls ? 'visible' : ''}`}>
               
                        <button className="play-pause-btn" onClick={togglePlayPause}>
                            {isPlaying ? <Pause size={30} /> : <Play size={30} />}
                        </button>
                        {isAdmin && (
                    <>
                        <input
                            type="range"
                            min="0"
                            max={duration}
                            step="0.1"
                            value={currentTime}
                            onChange={handleSeek}
                            className="seek-bar"
                        />
                        </>
                )}
                        <span className="time">
                            {Math.floor(currentTime)} / {Math.floor(duration)} sec
                        </span>
                    
            </div>
        </div>
    );
};

export default VideoPlayer;
