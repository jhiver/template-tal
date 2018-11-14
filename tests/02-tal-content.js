tal = require('../lib/template-tal')

talContent = `
<html>
    <body tal:content="self.bar">Dummy Content</body>
</html>
`

talContent2 = `
<html>
    <body tal:content="self.bar()">Dummy Content</body>
</html>
`

describe('data', function() {
  return it('should contain BAZ', function(done) {
    tal.process(talContent, {bar: 'BAZ'}, function (error, result){
      if (error) return done(error)
      if (String(result).match('<body>BAZ</body>')) return done()
      return done('unexpected ', + result)
    })
  })
})


describe('function', function() {
  return it('should contain BAZ', function(done) {
    tal.process(talContent2, {bar: function() { return 'BAZ' }}, function (error, result){
      if (error) return done(error)
      if (String(result).match('<body>BAZ</body>')) return done()
      return done('unexpected ', + result)
    })
  })
})


describe('asyncFunction', function() {
  return it('should contain BAZ', function(done) {
    var bazFunc = function() {
      return new Promise(function(resolve){
        setTimeout(function() { resolve("BAZ") }, 10)
      })
    }
    tal.process(talContent2, {bar: bazFunc}, function (error, result){
      if (error) return done(error)
      if (String(result).match('<body>BAZ</body>')) return done()
      return done('unexpected ', + result)
    })
  })
})