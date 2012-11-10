io = window.io

log = (t) ->
    document.body.innerHTML = t + "<br />" + document.body.innerHTML

socket = io.connect("http://" + document.location.host )
socket.on "news", (data) ->
  console.log data
  socket.emit "my other event",
    my: "data"

socket.on "connect", ->
  playing = true
  checkInterval = undefined
  threshold = 5
  zMax = 0
  bottomThreshold = 1

  done = ->
    socket.emit "kick", { z: zMax }
    reset()
    playing = false
    log "done"

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

    if acc.z > bottomThreshold
      zMax = Math.max(acc.z, zMax)
      draw()

    if acc.z < zMax && zMax > threshold
      done()

  window.addEventListener "devicemotion", tick , false

  socket.on "turn", ->
    playing = true