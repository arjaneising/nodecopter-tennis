io = window.io

turnClassName = "myTurn"

log = (t) ->
    document.body.innerHTML = t #+ "<br />" + document.body.innerHTML

socket = io.connect("http://" + document.location.host )
socket.on "news", (data) ->
  console.log data
  socket.emit "my other event",
    my: "data"

socket.on "connect", ->

  playing = false
  checkInterval = undefined
  threshold = 3
  zMax = 0
  bottomThreshold = 1
  zForceDivider = 2.5

  done = ->
    socket.emit "kick",
      z: zMax

    reset()
    playing = false
    log "done"
    document.body.classList.remove turnClassName

  reset = ->
    zMax = 0
    log "reset"

  draw = ->
    log zMax

  log "connected"

  tick = (data) ->
    if !playing
      return

    acc = data.acceleration
    force = acc.z / zForceDivider

    if acc.z > bottomThreshold
      zMax = Math.max( force, zMax )
      draw()

    if force < zMax && zMax > threshold
      done()

  window.addEventListener "devicemotion", tick , false

  socket.on "turn", ->
    playing = true
    document.body.classList.add turnClassName
    log "Your turn now!"

  socket.emit "player"
