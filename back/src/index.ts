import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Server } from 'socket.io';
import { handleSocketConnection } from './roomService';

const fastify = Fastify({ logger: true });

async function buildServer() {
    await fastify.register(cors, {
        origin: '*', // For dev
    });

    fastify.get('/api/health', async () => {
        return { status: 'ok' };
    });

    // Attach socket.io
    await fastify.ready();

    const io = new Server(fastify.server, {
        cors: {
            origin: '*', // For dev
        },
    });

    handleSocketConnection(io);

    return fastify;
}

const start = async () => {
    try {
        const server = await buildServer();
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
        await server.listen({ port, host: '0.0.0.0' });
        console.log(`Backend server listening on port ${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
