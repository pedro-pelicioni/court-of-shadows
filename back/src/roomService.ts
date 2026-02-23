import { Server, Socket } from 'socket.io';
import { initializeMatch, activeMatches, serializeMatchStateForClient } from './matchState';
import { drawCard, playCardFaceDown, declareCard, respond } from './gameActions';
import { ActionType, CardClass, SlotPosition } from './types';

export interface Player {
    id: string; // Socket ID
    walletAddress: string;
}

export interface Room {
    id: string;
    host: Player;
    guest?: Player;
    status: 'waiting' | 'in_match';
}

const rooms = new Map<string, Room>();

const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
};

const broadcastMatchState = (io: Server, roomId: string) => {
    const match = activeMatches.get(roomId);
    if (!match) return;
    const room = rooms.get(roomId);
    if (!room) return;

    // Check if the match is over (someone's influence <= 0)
    const hostWon = match.host.influence > 0 && match.guest.influence <= 0;
    const guestWon = match.guest.influence > 0 && match.host.influence <= 0;
    const isTie = match.host.influence <= 0 && match.guest.influence <= 0;
    const isOver = hostWon || guestWon || isTie;

    // Send perspective-based state privately to each client
    io.to(room.host.id).emit('match:state', serializeMatchStateForClient(match, room.host.id));
    if (room.guest) {
        io.to(room.guest.id).emit('match:state', serializeMatchStateForClient(match, room.guest.id));
    }

    // Emit match:ended so both clients navigate to the result screen
    if (isOver) {
        io.to(roomId).emit('match:ended');
        // Clean up after a brief delay to let state settle
        setTimeout(() => {
            activeMatches.delete(roomId);
            rooms.delete(roomId);
        }, 5000);
    }
};

export const handleSocketConnection = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);

        // Create a new room
        socket.on('room:create', ({ walletAddress }: { walletAddress: string }, callback) => {
            let roomId = generateRoomId();
            while (rooms.has(roomId)) {
                roomId = generateRoomId();
            }

            const room: Room = {
                id: roomId,
                host: { id: socket.id, walletAddress },
                status: 'waiting',
            };

            rooms.set(roomId, room);
            socket.join(roomId);

            console.log(`[Room] ${roomId} created by ${walletAddress}`);
            callback({ success: true, roomId });
        });

        // Join an existing room
        socket.on('room:join', ({ roomId, walletAddress }: { roomId: string, walletAddress: string }, callback) => {
            const room = rooms.get(roomId);
            if (!room) {
                return callback({ success: false, error: 'Room not found' });
            }

            if (room.guest) {
                return callback({ success: false, error: 'Room is full' });
            }

            room.guest = { id: socket.id, walletAddress };
            rooms.set(roomId, room);
            socket.join(roomId);

            console.log(`[Room] ${roomId} joined by ${walletAddress}`);

            // Notify the host
            io.to(roomId).emit('room:update', room);

            callback({ success: true, room });
        });

        // Get room details
        socket.on('room:get', ({ roomId }: { roomId: string }, callback) => {
            const room = rooms.get(roomId);
            if (!room) {
                return callback({ success: false, error: 'Room not found' });
            }

            // Ensure the socket is in the room if they somehow disconnected and reconnected
            socket.join(roomId);

            callback({ success: true, room });
        });

        // Reconnect to an active match (e.g., after page reload)
        socket.on('room:reconnect', ({ roomId, walletAddress }: { roomId: string, walletAddress?: string }) => {
            const room = rooms.get(roomId);
            const match = activeMatches.get(roomId);
            if (!room || !match) {
                socket.emit('match:error', 'Room or match not found for reconnection.');
                return;
            }

            // Re-join the socket room channel
            socket.join(roomId);

            // Patch the socket ID if the same wallet comes back with a new socket
            if (walletAddress) {
                if (room.host.walletAddress === walletAddress) {
                    room.host.id = socket.id;
                    match.host.playerId = socket.id;
                } else if (room.guest?.walletAddress === walletAddress) {
                    room.guest.id = socket.id;
                    match.guest.playerId = socket.id;
                }
                rooms.set(roomId, room);
            }

            // Resend current state
            socket.emit('match:state', serializeMatchStateForClient(match, socket.id));
            console.log(`[Socket] ${socket.id} reconnected to room ${roomId}`);
        });

        // Match actions
        socket.on('room:start_match', ({ roomId }) => {
            const room = rooms.get(roomId);
            if (!room || !room.guest) return;
            if (room.host.id !== socket.id) return; // Only host starts

            room.status = 'in_match';
            rooms.set(roomId, room);

            initializeMatch(roomId, room.host.id, room.host.walletAddress, room.guest.id, room.guest.walletAddress);

            io.to(roomId).emit('room:update', room);
            io.to(roomId).emit('match:started');
            broadcastMatchState(io, roomId);
        });

        socket.on('match:draw', ({ roomId }) => {
            try {
                const match = activeMatches.get(roomId);
                if (match) {
                    drawCard(match, socket.id);
                    broadcastMatchState(io, roomId);
                }
            } catch (e: any) {
                socket.emit('match:error', e.message);
            }
        });

        socket.on('match:play_card_face_down', ({ roomId, cardId }) => {
            try {
                const match = activeMatches.get(roomId);
                if (match) {
                    playCardFaceDown(match, socket.id, cardId);
                    broadcastMatchState(io, roomId);
                }
            } catch (e: any) {
                socket.emit('match:error', e.message);
            }
        });

        socket.on('match:declare_card', ({ roomId, declaredClass, targetSlot, targetGuess }: { roomId: string, declaredClass: CardClass, targetSlot?: SlotPosition, targetGuess?: string }) => {
            try {
                const match = activeMatches.get(roomId);
                if (match) {
                    declareCard(match, socket.id, declaredClass, targetSlot, targetGuess);
                    broadcastMatchState(io, roomId);
                }
            } catch (e: any) {
                socket.emit('match:error', e.message);
            }
        });

        socket.on('match:respond', ({ roomId, response }: { roomId: string, response: ActionType }) => {
            try {
                const match = activeMatches.get(roomId);
                if (match) {
                    respond(match, socket.id, response);
                    broadcastMatchState(io, roomId);
                }
            } catch (e: any) {
                socket.emit('match:error', e.message);
            }
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`[Socket] Client disconnected: ${socket.id}`);

            // Basic cleanup (in production we'd want a grace period for reconnects)
            for (const [roomId, room] of rooms.entries()) {
                if (room.host.id === socket.id) {
                    io.to(roomId).emit('player:disconnected', { role: 'host' });
                    rooms.delete(roomId);
                } else if (room.guest?.id === socket.id) {
                    room.guest = undefined;
                    room.status = 'waiting';
                    rooms.set(roomId, room);
                    io.to(roomId).emit('player:disconnected', { role: 'guest' });
                    io.to(roomId).emit('room:update', room);
                }
            }
        });
    });
};
