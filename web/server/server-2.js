const http = require('http')
const server = require('socket.io')(http)

function generateId () {
  return Math.random().toString(36).substring(2, 10)
}

const sessions = {}

http.listen(80, function() {
  console.log('listening on *:3000');
});

server.on('connection', function (client) {
  client.id = generateId()

  client.on('disconnect', function(){
    Object.values(sessions).forEach(session => {
      if (session.clients[client.id]) {
        delete session.clients[client.id]
        broadcastState({type: 'leftSession', clientId: client.id, sessionId: session.id})
      }
    })
  });

  client.on('message', function handleMessage (json) {
    const data = JSON.parse(json)

    switch (data.type) {
      case 'createSession':
        return createSession(client, data)
      case 'joinSession':
        return joinSession(client, data)
      case 'leaveSession':
        return leaveSession(client, data)

      case 'changePlaybackState':
        return changePlaybackState(client, data)
      default:
        return
    }
  })

  client.send(JSON.stringify({
    type: 'connected',
    clientId: client.id,
    sessions: getSessionList(),
  }))
})

function getSessionList () {
  return Object.values(sessions).map(session => ({
    id: session.id,
    name: session.name,
  }))
}

function broadcastState (data, blacklist = []) {
  [...server.clients].filter(client => !blacklist.includes(client)).forEach(client => {
    client.send(JSON.stringify(data))
  })
}

function changePlaybackState (client, {sessionId, playbackState, playbackIndex}) {
  const session = sessions[sessionId]

  Object.assign(session, {
    playbackState,
    playbackIndex,
  })

  broadcastState({
    type: 'playbackStateChanged',
    playbackState,
    playbackIndex,
  }, [client])

  console.log(`Client ${client.name} (#${client.id}) changed playback state.`)
}

function createSession (client, {clientName, sessionName, captureId, playbackState, playbackIndex}) {
  client.name = clientName
  const session = {
    id: generateId(),
    name: sessionName,
    clients: {
      [client.id]: client,
    },
    captureId,
    playbackState,
    playbackIndex,
  }
  sessions[session.id] = session

  console.log(`Client ${client.name} (#${client.id}) created session #${session.id}.`)
  broadcastState({
    type: 'sessionCreated',
    sessionId: session.id,
    sessionName: session.name,
    clients: [
      {
        id: client.id,
        name: client.name,
      },
    ],
  })
  return session
}

function joinSession (client, {clientName, sessionId}) {
  client.name = clientName
  console.log(`Client ${client.name} (#${client.id}) joined session #${sessionId}.`)
  broadcastState({
    type: 'sessionJoined',
    clientId: client.id,
    clientName,
    sessionId,
  })
}

function leaveSession (client, {sessionId}) {
  console.log(`Client ${client.name} (#${client.id}) left session #${sessionId}.`)
  Object.values(sessions).forEach(session => {
    if (session.clients[client.id]) {
      delete session.clients[client.id]
      broadcastState({type: 'leftSession', clientId: client.id, sessionId: session.id})
    }
  })
}
