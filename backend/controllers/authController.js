exports.authenticateRoom = (req, res) => {
    const { roomName, password } = req.body;
  
    if (
      (roomName === process.env.ADMIN_ROOM && password === process.env.ADMIN_PASSWORD) ||
      (roomName === process.env.USER_ROOM && password === process.env.USER_PASSWORD)
    ) {
      res.status(200).json({ success: true, role: roomName === process.env.ADMIN_ROOM ? 'admin' : 'user' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  };
  