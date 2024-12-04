import { io, Socket } from 'socket.io-client';

const url = import.meta.env.VITE_BACKEND_URL

const socket: Socket = io(url)

export default socket;