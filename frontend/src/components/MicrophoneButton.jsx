const MicrophoneButton = () => {
    const startMicrophone = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Microphone stream started:', stream);

            const audio = document.createElement('audio');
            audio.srcObject = stream;
            audio.play();
        } catch (error) {
            console.error('Error starting the microphone:', error.message);
            alert('Unable to access the microphone. Please ensure permissions are granted.');
        }
    };

    return (
        <div>
            <button onClick={startMicrophone}>Start Microphone</button>
        </div>
    );
};

export default MicrophoneButton;
