io = window.io

socket = io.connect('http://localhost')
socket.on 'news', (data) ->
  socket.emit 'my other event',
    my: 'data'
  console.log data if console?.log
socket.on 'weeej', (data) ->
  console.log data if console?.log