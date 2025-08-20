let ioInstance = null;
const userIdToSocketIds = new Map();

const initRealtime = (server) => {
	const { Server } = require('socket.io');
	ioInstance = new Server(server, { cors: { origin: true, credentials: true } });

	ioInstance.on('connection', (socket) => {
		// client should emit 'auth' event with userId after connecting
		socket.on('auth', (userId) => {
			if (!userId) return;
			if (!userIdToSocketIds.has(userId)) userIdToSocketIds.set(userId, new Set());
			userIdToSocketIds.get(userId).add(socket.id);
			socket.join(`user:${userId}`);
		});

		socket.on('disconnect', () => {
			for (const [userId, set] of userIdToSocketIds.entries()) {
				if (set.has(socket.id)) {
					set.delete(socket.id);
					if (set.size === 0) userIdToSocketIds.delete(userId);
					break;
				}
			}
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
