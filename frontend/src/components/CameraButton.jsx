import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { BACKEND_API_URL } from '../utils/helpers';

const socket = io(BACKEND_API_URL);

const CameraButton = () => {
  const localVideoRef = useRef(null);
  const [remoteVideos, setRemoteVideos] = useState([]);
  const localStreamRef = useRef(null);
  const peerConnections = useRef({});

  const startCamera = async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
      localStreamRef.current = localStream;

      // Notify the server about joining
      socket.emit('join-room');

      socket.on('user-joined', (userId) => {
        createPeerConnection(userId, localStream);
      });

      // Handle incoming WebRTC signaling messages
      socket.on('signal', async ({ from, signal }) => {
        if (!peerConnections.current[from]) {
          createPeerConnection(from, localStream, false);
        }
        await peerConnections.current[from].setRemoteDescription(
          new RTCSessionDescription(signal)
        );
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

      socket.on('user-disconnected', (userId) => {
        if (peerConnections.current[userId]) {
          peerConnections.current[userId].close();
          delete peerConnections.current[userId];
          setRemoteVideos((prev) => prev.filter((video) => video.id !== userId));
        }
      });
    } catch (error) {
      console.error('Error starting camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const createPeerConnection = (userId, localStream, isInitiator = true) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    // Add local tracks to the peer connection
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

    // Handle remote streams
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteVideos((prev) => [...prev, { id: userId, stream: remoteStream }]);
    };

    // Send ICE candidates to the other peer
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { to: userId, candidate: event.candidate });
      }
    };

    // Create and send offer
    if (isInitiator) {
      peerConnection
        .createOffer()
        .then((offer) => peerConnection.setLocalDescription(offer))
        .then(() => {
          socket.emit('signal', { to: userId, signal: peerConnection.localDescription });
        });
    }

    peerConnections.current[userId] = peerConnection;
    return peerConnection;
  };

  return (
    <div>
      <button onClick={startCamera}>Start Camera</button>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
        {/* My Video */}
        <video
          ref={localVideoRef}
          autoPlay
          muted
          style={{ width: '30%', border: '2px solid black' }}
        ></video>

        {/* Their Videos */}
        {remoteVideos.map(({ id, stream }) => (
          <video
            key={id}
            autoPlay
            style={{ width: '30%', border: '2px solid blue' }}
            ref={(el) => {
              if (el) el.srcObject = stream;
            }}
          ></video>
        ))}
      </div>
    </div>
  );
};

export default CameraButton;
