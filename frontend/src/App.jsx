import { useState } from 'react';
import Login from './components/Login';
import VideoPlayer from './components/VideoPlayer';
import CameraButton from './components/CameraButton';
import MicrophoneButton from './components/MicrophoneButton';
import ThemeChanger from './components/ThemeChanger';

const App = () => {
  const [role, setRole] = useState(null);

  const handleLogin = (userRole) => {
    setRole(userRole);
  };

  if (!role) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className='main-page'>
      <div className='header'>
        <h1>Welcome, {role === 'admin' ? 'Admin' : 'User'}!</h1>
        <ThemeChanger />
      </div>
      <div className='content'>
        <VideoPlayer isAdmin={role === 'admin' ? true : false} />
        <div className='controls'>
          <CameraButton role={role} />
          <MicrophoneButton />
        </div>
      </div>
    </div>
  );
};

export default App;
