// controller.js
const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://localhost')

var humonState = ''
var connected = false

client.on('connect', () => {
  client.subscribe('humon/connected')
  client.subscribe('humon/state')
})

client.on('message', (topic, message) => {
  switch (topic) {
    case 'humon/connected':
      return handleHumonConnected(message)
    case 'humon/state':
      return handleHumonState(message)
  }
  console.log('No handler for topic %s', topic)
})

function handleHumonConnected (message) {
  console.log('humon connected status %s', message)
  connected = (message.toString() === 'true')
}

function handleHumonState (message) {
  humonState = message
  console.log('humon state update to %s', message)
}

function switchOnHumon () {
  // can only open door if we're connected to mqtt and door isn't already open
  if (connected && humonState !== 'on') {
    // Ask the door to open
    client.publish('humon/on', 'true')
  }
}

function switchOffHumon () {
  // can only switchoff if we're connected to mqtt and humon isn't already off
  if (connected && humonState !== 'off') {
    // Ask the humon to switchoff
    client.publish('humon/off', 'true')
  }
}


