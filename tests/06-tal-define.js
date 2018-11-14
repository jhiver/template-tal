tal = require('../lib/template-tal')

talDefine = `
<html>
    <body tal:define="foo bar" tal:content="foo">Dummy Content</body>
</html>
`

talDefine2 = `
<html>
    <body tal:define="foo bar()" tal:content="foo">Dummy Content</body>
</html>
`

describe('defineData', function() {
  return it('should contain BAZ', function(done) {
    tal.process(talDefine, {bar: 'BAZ'}, function (error, result){
      if (error) return done(error)
      if (String(result).match('<body>BAZ</body>')) return done()
      return done('unexpected ', + result)
    })
  })
})


describe('defineFunction', function() {
  return it('should contain BAZ', function(done) {
    tal.process(talDefine2, {bar: function() { return 'BAZ' }}, function (error, result){
      if (error) return done(error)
      if (String(result).match('<body>BAZ</body>')) return done()
      return done('unexpected ', + result)
    })
  })
})


describe('defineAsyncFunction', function() {
  return it('should contain BAZ', function(done) {
    var bazFunc = function() {
      return new Promise(function(resolve){
        setTimeout(function() { resolve("BAZ") }, 10)
      })
    }
    tal.process(talDefine2, {bar: bazFunc}, function (error, result){
      if (error) return done(error)
      if (String(result).match('<body>BAZ</body>')) return done()
      return done('unexpected ', + result)
    })
  })
})