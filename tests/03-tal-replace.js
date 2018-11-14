tal = require('../lib/template-tal')

talReplace = `
<html>
    <body tal:replace="bar">Dummy Content</body>
</html>
`

talReplace2 = `
<html>
    <body tal:replace="bar()">Dummy Content</body>
</html>
`

describe('data', function() {
  return it('should contain BAZ', function(done) {
    tal.process(talReplace, {bar: 'BAZ'}, function (error, result){
      if (error) return done(error)
      if (String(result).match('<body>BAZ</body>')) return done("not a replace")
      if (String(result).match('BAZ')) return done()
      return done('unexpected ', + result)
    })
  })
})


describe('function', function() {
  return it('should contain BAZ', function(done) {
    tal.process(talReplace2, {bar: function() { return 'BAZ' }}, function (error, result){
      if (error) return done(error)
      if (String(result).match('<body>BAZ</body>')) return done("not a replace")
      if (String(result).match('BAZ')) return done()
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
    tal.process(talReplace2, {bar: bazFunc}, function (error, result){
      if (error) return done(error)
      if (String(result).match('<body>BAZ</body>')) return done("not a replace")
      if (String(result).match('BAZ')) return done()
      return done('unexpected ', + result)
    })
  })
})
