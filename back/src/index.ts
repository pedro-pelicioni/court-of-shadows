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
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    handleSocketConnection(io);

    return fastify;
}

const start = async () => {
    try {
        const server = await buildServer();
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
        server.listen({ port, host: '0.0.0.0' }, (err, address) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            console.log(`Server listening at ${address}`);
        });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
