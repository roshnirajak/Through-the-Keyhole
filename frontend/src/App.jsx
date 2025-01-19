import { useState } from 'react';
import Login from './components/Login';
import VideoPlayer from './components/VideoPlayer';
import CameraButton from './components/CameraButton';
import MicrophoneButton from './components/MicrophoneButton';

const App = () => {
  const [role, setRole] = useState(null);

  const handleLogin = (userRole) => {
    setRole(userRole);
  };

  if (!role) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div>
      <h1>Welcome, {role === 'admin' ? 'Admin' : 'User'}!</h1>
      <VideoPlayer isAdmin={role === 'admin' ? true : false}/>
      <div style={{ marginTop: '20px' }}>
        <CameraButton />
        <MicrophoneButton />
      </div>
    </div>
  );
};

export default App;
