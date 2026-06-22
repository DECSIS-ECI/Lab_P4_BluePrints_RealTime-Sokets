import { useState, useEffect, useRef, useCallback } from 'react';
import { createSocket } from '../lib/socketIoClient';
import { createStompClient, subscribeBlueprint } from '../lib/stompClient';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
const IO_BASE = import.meta.env.VITE_IO_BASE || 'http://localhost:3001';

export function useRealtime(tech, author, name, onPointReceived) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const stompRef = useRef(null);
  const socketRef = useRef(null);
  const unsubRef = useRef(null);

  const connect = useCallback(() => {
    // Limpiar conexiones anteriores
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }
    if (stompRef.current) {
      stompRef.current.deactivate?.();
      stompRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect?.();
      socketRef.current = null;
    }

    setConnected(false);
    setError(null);

    if (tech === 'stomp') {
      // Conexión STOMP
      const client = createStompClient(API_BASE);
      stompRef.current = client;
      
      client.onConnect = () => {
        setConnected(true);
        setError(null);
        console.log('STOMP connected');
        unsubRef.current = subscribeBlueprint(client, author, name, (data) => {
          onPointReceived(data);
        });
      };

      client.onStompError = (frame) => {
        setError(`STOMP error: ${frame.headers?.message || 'Unknown error'}`);
        setConnected(false);
      };

      client.onWebSocketClose = () => {
        setConnected(false);
      };

      client.activate();
    } else if (tech === 'socketio') {
      // Conexión Socket.IO
      const socket = createSocket(IO_BASE);
      socketRef.current = socket;

      socket.on('connect', () => {
        setConnected(true);
        setError(null);
        console.log('Socket.IO connected');
        const room = `blueprints.${author}.${name}`;
        socket.emit('join-room', room);
      });

      socket.on('connect_error', (err) => {
        setError(`Socket.IO error: ${err.message}`);
        setConnected(false);
      });

      socket.on('disconnect', () => {
        setConnected(false);
      });

      socket.on('blueprint-update', (data) => {
        onPointReceived(data);
      });
    }

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
      if (stompRef.current) {
        stompRef.current.deactivate?.();
        stompRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.disconnect?.();
        socketRef.current = null;
      }
      setConnected(false);
    };
  }, [tech, author, name, onPointReceived]);

  const sendPoint = useCallback((point) => {
    if (tech === 'stomp' && stompRef.current?.connected) {
      stompRef.current.publish({
        destination: '/app/draw',
        body: JSON.stringify({ author, name, point }),
      });
    } else if (tech === 'socketio' && socketRef.current?.connected) {
      const room = `blueprints.${author}.${name}`;
      socketRef.current.emit('draw-event', { room, author, name, point });
    } else {
      console.warn('No connected to send point');
    }
  }, [tech, author, name]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  return {
    connected,
    error,
    sendPoint,
  };
}