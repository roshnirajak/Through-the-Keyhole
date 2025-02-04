import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { Camera } from 'lucide-react';
import { BACKEND_API_URL } from '../utils/helpers';
import Chatbox from './ChatBox';

const socket = io(BACKEND_API_URL);

const CameraMicrophone = () => {
  const localVideoRef = useRef(null);
  const [remoteVideos, setRemoteVideos] = useState([]);
  const localStreamRef = useRef(null);
  const peerConnections = useRef({});
  const [isCameraOn, setIsCameraOn] = useState(false);

  const toggleCamera = async () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      await startCamera();
    }
  };

  const startCamera = async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
      localStreamRef.current = localStream;
      setIsCameraOn(true);

      // Notify other peers that this user has turned on the camera
      socket.emit('camera-toggle', { userId: socket.id, active: true });

      // Reconnect with all existing peers
      Object.keys(peerConnections.current).forEach((userId) => {
        peerConnections.current[userId].getSenders().forEach((sender) => {
          peerConnections.current[userId].removeTrack(sender);
        });

        localStream.getTracks().forEach((track) => {
          peerConnections.current[userId].addTrack(track, localStream);
        });

        peerConnections.current[userId]
          .createOffer()
          .then((offer) => peerConnections.current[userId].setLocalDescription(offer))
          .then(() => {
            socket.emit('signal', { to: userId, signal: peerConnections.current[userId].localDescription });
          });
      });
    } catch (error) {
      console.error('Error starting camera:', error);
    }
  };

  const stopCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      setIsCameraOn(false);

      // Notify peers that this user has turned off their camera
      socket.emit('camera-toggle', { userId: socket.id, active: false });

      // Remove tracks from peer connections
      Object.keys(peerConnections.current).forEach((userId) => {
        peerConnections.current[userId].getSenders().forEach((sender) => {
          peerConnections.current[userId].removeTrack(sender);
        });
      });
    }
  };

  const createPeerConnection = (userId) => {
    if (peerConnections.current[userId]) return;

    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;

      // Check if stream is valid before adding
      if (!remoteStream || !remoteStream.getTracks().some(track => track.readyState === 'live')) {
        return; // Skip adding blank feeds
      }

      setRemoteVideos((prev) => {
        if (prev.some((video) => video.id === userId)) {
          return prev;
        }
        return [...prev, { id: userId, stream: remoteStream }];
      });
    };


    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { to: userId, candidate: event.candidate });
      }
    };

    peerConnection
      .createOffer()
      .then((offer) => peerConnection.setLocalDescription(offer))
      .then(() => {
        socket.emit('signal', { to: userId, signal: peerConnection.localDescription });
      });

    peerConnections.current[userId] = peerConnection;
  };

  useEffect(() => {
    socket.on('user-joined', (userId) => {
      if (userId !== socket.id && !peerConnections.current[userId]) {
        createPeerConnection(userId);
      }
    });

    socket.on('signal', async ({ from, signal }) => {
      if (!peerConnections.current[from]) {
        createPeerConnection(from);
      }
      await peerConnections.current[from].setRemoteDescription(new RTCSessionDescription(signal));
      if (signal.type === 'offer') {
        const answer = await peerConnections.current[from].createAnswer();
        await peerConnections.current[from].setLocalDescription(answer);
        socket.emit('signal', { to: from, signal: peerConnections.current[from].localDescription });
      }
    });

    socket.on('ice-candidate', ({ from, candidate }) => {
      if (peerConnections.current[from]) {
        peerConnections.current[from].addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on('camera-toggle', ({ userId, active }) => {
      if (!active) {
        setRemoteVideos((prev) => prev.filter((video) => video.id !== userId));
      } else {
        createPeerConnection(userId);
      }

      // Remove blank feeds
      setRemoteVideos((prev) => prev.filter(({ stream }) =>
        stream && stream.getTracks().some(track => track.readyState === 'live')
      ));
    });


    socket.on('user-left', (userId) => {
      setRemoteVideos((prev) => prev.filter((video) => video.id !== userId));

      if (peerConnections.current[userId]) {
        peerConnections.current[userId].close();
        delete peerConnections.current[userId];
      }
    });

    return () => {
      socket.off('user-joined');
      socket.off('signal');
      socket.off('ice-candidate');
      socket.off('user-left');
      socket.off('camera-toggle');
    };
  }, []);


  return (
    <div className="camera-container">
      <button className="camera-btn" onClick={toggleCamera}>
        {isCameraOn ? <Camera size={24} color="black" /> : <Camera size={24} color="white" />}
      </button>
      <div className="camera-feeds">
        <video ref={localVideoRef} autoPlay muted className="camera-feed"></video>
        {remoteVideos
          .filter(({ stream }) => stream && stream.getTracks().some(track => track.readyState === 'live'))
          
          .map(({ id, stream }) => (
            <video
              key={id}
              autoPlay
              ref={(el) => {
                if (el) el.srcObject = stream;
              }}
              className="camera-feed"
            ></video>
          ))}


      </div>
      <Chatbox />
    </div>
  );
};

export default CameraMicrophone;
