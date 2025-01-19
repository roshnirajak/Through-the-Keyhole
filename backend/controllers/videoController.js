const path = require('path');

exports.streamVideo = (req, res) => {
  const videoPath = path.join(__dirname, '..', '..', 'backend/videos', 'video2.mp4');
  res.sendFile(videoPath);
};
