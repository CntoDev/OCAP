/*global io*/

const socket = io();

function generateId () {
  return Math.random().toString(36).substring(2, 10)
}

socket.addEventListener('message', function ({data: json}) {
  const data = JSON.parse(json)
  switch (data.type) {
    case 'connected':
      return handleConnected(data)
    case 'sessionCreated':
      return handleSessionCreated(data)
    default:
      return
  }
})

socket.addEventListener('open', function () {

})

function handleConnected({clientId, sessions}) {
  console.log(clientId, sessions)

  const sessionList = document.querySelector('#clientList')
  sessionList.innerHTML = ''

  sessions.forEach(session => {
    const sessionItem = document.createElement('li')
    sessionItem.innerText = session.name + ' (#' + session.id + ')'
    sessionItem.addEventListener('click', () => {
      socket.send(JSON.stringify({
        type: 'joinSession',
        clientName: 'Shakan',
        sessionId: session.id,
      }))
    })
    sessionList.appendChild(sessionItem)
  })
}

function handleSessionCreated({sessionId, sessionName, clients}) {
  console.log(sessionId, sessionName, clients)

  const clientList = document.querySelector('#clientList')
  clientList.innerHTML = ''

  clients.forEach(client => {
    const clientItem = document.createElement('li')
    clientItem.innerText = client.name + ' (#' + client.id + ')'
    clientItem.addEventListener('click', () => {})
    clientList.appendChild(clientItem)
  })
}

document.querySelector('#createSession').addEventListener('click', () => {
  socket.send(JSON.stringify({
    type: 'createSession',
    clientName: 'Shakan',
    sessionName: 'Debriefing ' + generateId(),
    captureName: 'VR',
    playbackState: 'paused',
    playbackIndex: 0,
  }))
})
