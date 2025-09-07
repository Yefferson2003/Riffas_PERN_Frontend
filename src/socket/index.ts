
import { io, Socket } from "socket.io-client";

const url = import.meta.env.VITE_API_URL;


const socket: Socket = io(url, {
    transports: ["websocket"], 
    reconnection: true,        
    reconnectionAttempts: 2,   
    reconnectionDelay: 1000,  
});

export default socket;
