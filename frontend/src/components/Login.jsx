import { useState } from 'react';
import { BACKEND_API_URL } from '../utils/helpers';
import '../App.css';

const Login = ({ onLogin }) => {
    const [roomName, setRoomName] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        const response = await fetch(`${BACKEND_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomName, password }),
        });

        const data = await response.json();
        if (data.success) {
            onLogin(data.role);
        } else {
            alert(data.message);
        }
    };

    return (
        <div class="login-page">
            <div className="login-container">
                <h2>Login</h2>
                <input placeholder="Room Name" onChange={(e) => setRoomName(e.target.value)} />
                <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
                <button onClick={handleLogin}>Join</button>
            </div>
        </div>
    );
};

export default Login;
