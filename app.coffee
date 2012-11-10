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

started = false

players = []

io = require('socket.io').listen(server)
io.sockets.on 'connection', (socket) ->
  socket.emit 'news',
    hello: 'world'

  socket.on 'error', (data) ->
    console.log data

  socket.on 'start', (data) ->
    console.log 'start'
    game.start()

  socket.on 'stop', ->
    game.stop()

  socket.on 'player', ->
    console.log 'new player'
    players.push socket

  socket.on 'kick', (data)->
    if started
      velocity = data.z
      game.kick velocity;

      whosTurn = Math.floor(Math.random() * players.length)
      id = players[whosTurn].id

      console.log id

      io.sockets.socket(id).emit('turn')

  game.inRange ->
    started = true
  #   players = io.sockets.clients()
  #   whosTurn = Math.floor(Math.random() * players.length)
  #   id = players[whosTurn].id

  #   console.log id

  #   io.sockets.socket(id).emit('turn')
