"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const socket_io_1 = require("socket.io");
const roomService_1 = require("./roomService");
const fastify = (0, fastify_1.default)({ logger: true });
async function buildServer() {
    await fastify.register(cors_1.default, {
        origin: '*', // For dev
    });
    fastify.get('/api/health', async () => {
        return { status: 'ok' };
    });
    // Attach socket.io
    await fastify.ready();
    const io = new socket_io_1.Server(fastify.server, {
        cors: {
            origin: '*', // For dev
        },
    });
    (0, roomService_1.handleSocketConnection)(io);
    return fastify;
}
const start = async () => {
    try {
        const server = await buildServer();
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
        await server.listen({ port, host: '0.0.0.0' });
        console.log(`Backend server listening on port ${port}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
