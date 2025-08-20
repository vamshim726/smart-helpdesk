let ioInstance = null;
const userIdToSocketIds = new Map();

const initRealtime = (server) => {
	const socketIo = require('socket.io');
	
	// Create Socket.IO server with proper CORS configuration
	const io = new socketIo.Server(server, { 
		cors: { 
			origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:4173"],
			credentials: true,
			methods: ["GET", "POST", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
		},
		transports: ['websocket', 'polling'],
		allowEIO3: true
	});

	ioInstance = io;
	
	console.log('Socket.IO server initialized with CORS configuration');
	console.log('Allowed origins:', ["http://localhost:5173", "http://localhost:3000", "http://localhost:4173"]);

	io.on('connection', (socket) => {
		console.log(`Socket.IO client connected: ${socket.id}`);
		
		// client should emit 'auth' event with userId after connecting
		socket.on('auth', (userId) => {
			console.log(`Socket.IO auth for user: ${userId}`);
			if (!userId) return;
			if (!userIdToSocketIds.has(userId)) userIdToSocketIds.set(userId, new Set());
			userIdToSocketIds.get(userId).add(socket.id);
			socket.join(`user:${userId}`);
			console.log(`User ${userId} joined room: user:${userId}`);
		});

		socket.on('disconnect', (reason) => {
			console.log(`Socket.IO client disconnected: ${socket.id}, reason: ${reason}`);
			for (const [userId, set] of userIdToSocketIds.entries()) {
				if (set.has(socket.id)) {
					set.delete(socket.id);
					if (set.size === 0) userIdToSocketIds.delete(userId);
					break;
				}
			}
		});
		
		socket.on('error', (error) => {
			console.error(`Socket.IO error for ${socket.id}:`, error);
		});
	});

	return ioInstance;
};

const io = () => ioInstance;

const emitToUser = (userId, event, payload) => {
	if (!ioInstance) return;
	ioInstance.to(`user:${userId}`).emit(event, payload);
};

module.exports = { initRealtime, io, emitToUser };
