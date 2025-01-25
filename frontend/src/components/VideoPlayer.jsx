import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { BACKEND_API_URL } from '../utils/helpers';

const socket = io(BACKEND_API_URL);

const VideoPlayer = ({ isAdmin }) => {
    const videoRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

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
            } else if (data.action === 'pause') {
                video.pause();
            }
        });

        socket.on('seek-video', (timestamp) => {
            const video = videoRef.current;
            video.currentTime = timestamp;
            setCurrentTime(timestamp);
        });

        return () => clearInterval(interval);
    }, []);

    const handlePlay = () => {
        socket.emit('video-control', { action: 'play' });
    };

    const handlePause = () => {
        socket.emit('video-control', { action: 'pause' });
    };

    const handleSeek = (e) => {
        const timestamp = e.target.value;
        socket.emit('seek-video', timestamp);
    };

    return (
        <div className='video-area'>
            <video
                ref={videoRef}
                src={`${BACKEND_API_URL}/video/stream`}
                style={{ width: '80vw' }}
            ></video>

            {isAdmin && (
                <div>
                    <button onClick={handlePlay}>Play</button>
                    <button onClick={handlePause}>Pause</button>
                    <input
                        type="range"
                        min="0"
                        max={duration}
                        step="0.1"
                        value={currentTime}
                        onChange={handleSeek}
                    />

                </div>
            )}
            <br /><br />
            <span>{Math.floor(currentTime)} / {Math.floor(duration)} seconds</span>
        </div>
    );
};

export default VideoPlayer;
