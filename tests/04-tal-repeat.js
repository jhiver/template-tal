tal = require('../lib/template-tal')

talRepeat = `
<html>
<body>
  <ul>
    <li tal:repeat="fruit fruits" tal:content="fruit">FAIL</li>
  </ul>
</body>
</html>
`

talRepeat2 = `
<html>
<body>
  <ul>
    <li tal:repeat="fruit fruits()" tal:content="fruit">FAIL</li>
  </ul>
</body>
</html>
`

FRUITS_LIST = [ 'apple', 'banana', 'strawberry' ]


describe('fruits_data', function() {
  return it('should pass', function(done) {
    tal.process(talRepeat, {fruits: FRUITS_LIST}, function (error, result){
      if (error) return done(error)
      if (!String(result).match('apple')) return done("apple not there")
      if (!String(result).match('banana')) return done("banana not there")
      if (!String(result).match('strawberry')) return done("strawberry not there")
      done()
    })
  })
})


describe('fruits_function', function() {
  return it('should pass', function(done) {
    tal.process(talRepeat2, {fruits: function() { return FRUITS_LIST }}, function (error, result){
      if (error) return done(error)
      if (!String(result).match('apple')) return done("apple not there")
      if (!String(result).match('banana')) return done("banana not there")
      if (!String(result).match('strawberry')) return done("strawberry not there")
      done()
    })
  })
})


describe('fruits_async_function', function() {
  return it('should pass', function(done) {
    var bazFunc = function() {
      return new Promise(function(resolve){
        setTimeout(function() { resolve(FRUITS_LIST) }, 10)
      })
    }
    tal.process(talRepeat2, {fruits: bazFunc}, function (error, result){
      if (error) return done(error)
      if (!String(result).match('apple')) return done("apple not there")
      if (!String(result).match('banana')) return done("banana not there")
      if (!String(result).match('strawberry')) return done("strawberry not there")
      done()
    })
  })
})
