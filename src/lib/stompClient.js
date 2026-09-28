import { Client } from '@stomp/stompjs'
// import SockJS from 'sockjs-client' // si quieres fallback

export function createStompClient(baseUrl) {
  const token = localStorage.getItem('token')
  const client = new Client({
    brokerURL: `${baseUrl.replace(/\/$/,'')}/ws-blueprints`,
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    // webSocketFactory: () => new SockJS(`${baseUrl}/ws-blueprints`),
    reconnectDelay: 1000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onStompError: (f) => console.error('STOMP error', f.headers['message']),
  })
  return client
}

export function subscribeBlueprint(client, author, name, onMsg) {
  return client.subscribe(`/topic/blueprints.${author}.${name}`, (m) => {
    onMsg(JSON.parse(m.body))
  })
}
