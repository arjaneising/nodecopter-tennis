express = require('express')
http = require('http')
connect = require('connect')
io = require('socket.io')
app = express()
game = require('./lib/game')


app.use express.bodyParser()

app.set('port', 1338)

server = http.createServer(app)
server.listen app.get('port'), ->
  console.log 'Express server listening on port ' + app.get('port')



app.configure ->
  app.use('/public', express.static(__dirname + '/public'))
  app.use(express.static(__dirname + '/public'))


# TODO implement this :-)
game.inRange = (evt) ->
  console.log evt


io = require('socket.io').listen(server)
io.sockets.on 'connection', (socket) ->
  socket.emit 'news',
    hello: 'world'

  socket.on 'my other event', (data) ->
    io.sockets.emit 'weeej',
      mek: 'DUDE'

  socket.on 'error', (data) ->
    console.log data

  socket.on 'start', (data) ->
    console.log 'start'
    game.start()

  socket.on 'stop', ->
    game.stop()

  socket.on 'kick', ->
    game.kick 8

  game.inRange ->
    players = io.sockets.clients()
    whosTurn = Math.floor(Math.random() * players.length)
    id = players[whosTurn].id

    console.log id

    io.sockets.socket(id).emit('turn')