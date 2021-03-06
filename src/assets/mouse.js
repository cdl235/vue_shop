/* 鼠标特效 */
;(function() {
  var coreSocialistValues = ['♥富强♥', '♥民主♥', '♥文明♥', '♥和谐♥', '♥自由♥', '♥平等♥', '♥公正♥', '♥法治♥', '♥爱国♥', '♥敬业♥', '♥诚信♥', '♥友善♥']

  var index = Math.floor(Math.random() * coreSocialistValues.length)

  document.body.addEventListener('click', function(e) {
    if (e.target.tagName === 'A') {
      return
    }

    var x = e.pageX

    var y = e.pageY

    var span = document.createElement('span')

    span.textContent = coreSocialistValues[index]

    index = (index + 1) % coreSocialistValues.length // 取模循环

    span.style.cssText = ['z-index: 9999999; position: absolute; font-weight: bold; color: #ff6651; top: ', y - 20, 'px; left: ', x, 'px;'].join('')

    document.body.appendChild(span)

    animate(span)
  })

  function animate(el) {
    // 动画
    var i = 0

    var top = parseInt(el.style.top)

    var id = setInterval(frame, 24)

    function frame() {
      // 帧
      if (i > 180) {
        clearInterval(id)

        el.parentNode.removeChild(el)
      } else {
        i += 2

        el.style.top = top - i + 'px'

        el.style.opacity = (180 - i) / 180
      }
    }
  }
})()
