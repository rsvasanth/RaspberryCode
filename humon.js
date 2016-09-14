// humon.js
const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://localhost')

/**
 * The state of the humon, defaults to closed
 * Possible states : off, switchingon, on, switchingoff
 */
var state = 'closed'

client.on('connect', () => {
  client.subscribe('humon/on')
  client.subscribe('humon/off')

  // Inform controllers that humon is connected
  client.publish('humon/connected', 'true')
  sendStateUpdate()
})

client.on('message', (topic, message) => {
  console.log('received message %s %s', topic, message)
  switch (topic) {
    case 'humon/on':
      return handleOnRequest(message)
    case 'humon/off':
      return handleOffRequest(message)
  }
})

function sendStateUpdate () {
  console.log('sending state %s', state)
  client.publish('humon/state', state)
}

function handleOnRequest (message) {
  if (state !== 'on' && state !== 'switchingon') {
    console.log('humon is on')
    state = 'switchingon'
    sendStateUpdate()

    // simulate  on after 5 seconds (would be listening to hardware)
    setTimeout(() => {
      state = 'on'
      sendStateUpdate()
    }, 5000)
  }
}

setInterval(sendTemperature, 2000, client);

function sendTemperature(client){
  var t = {
    T: Math.random() * 100,
    Units: "C"
  };
 var v = "on";
 var f = "off";    
      if (state !== 'off' && state !== 'switchingoff'){
          
          client.publish('humon/on', JSON.stringify(v));
          
      }else{
            console.log('humon is on allready')

          
      }
    
  
}





function handleOffRequest (message) {
  if (state !== 'off' && state !== 'switchingoff') {
          console.log('humon is off')

    state = 'switchingoff'
    sendStateUpdate()

    // simulate  off after 5 seconds (would be listening to hardware)
    setTimeout(() => {
      state = 'switchingoff'
      sendStateUpdate()
    }, 5000)
  }
}

/**
 * Want to notify controller that humon is disconnected before shutting down
 */
function handleAppExit (options, err) {
  if (err) {
    console.log(err.stack)
  }

  if (options.cleanup) {
    client.publish('humon/connected', 'false')
  }

  if (options.exit) {
    process.exit()
  }
}

/**
 * Handle the different ways an application can shutdown
 */
process.on('exit', handleAppExit.bind(null, {
  cleanup: true
}))
process.on('SIGINT', handleAppExit.bind(null, {
  exit: true
}))
process.on('uncaughtException', handleAppExit.bind(null, {
  exit: true
}))
