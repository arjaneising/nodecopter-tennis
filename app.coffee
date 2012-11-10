express = require('express')
http = require('http')
connect = require('connect')
io = require('socket.io')
app = express()
game = require('./lib/game')


#
# * ... skipping some of your app settings ...
#
app.use express.bodyParser()

app.set('port', 1337)

server = http.createServer(app)
server.listen app.get('port'), ->
  console.log 'Express server listening on port ' + app.get('port')





app.configure ->
  app.use('/public', express.static(__dirname + '/public'))
  app.use(express.static(__dirname + '/public'))




###
Socket.io
###
io = require('socket.io').listen(server)
io.sockets.on 'connection', (socket) ->
  socket.emit 'news',
    hello: 'world'

  socket.on 'kick', (data) ->
    console.log data

  socket.on 'error', (data) ->
    console.log data

  socket.on 'start', (data) ->
    console.log 'start'
    game.start()

  socket.on 'stop', ->
    game.stop()

  socket.on 'kick', (data)->
    velocity = data.z
    game.kick velocity;
    game.switchPlayer()

  socket.emit "turn"