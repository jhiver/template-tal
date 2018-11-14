tal = require('../lib/template-tal')

talAttributes = `
<html>
    <body tal:attributes="something foo; somethingelse bar">Dummy Content</body>
</html>
`

talAttributes2 = `
<html>
    <body tal:attributes="something foo(); somethingelse bar()">Dummy Content</body>
</html>
`

describe('attributesData', function() {
  return it('should work', function(done) {
    tal.process(talAttributes, {foo: 'FOO', bar: 'BAR'}, function (error, result){
      if (error) return done(error)
      if (!String(result).match('something="FOO"')) return done("FOO not there")
      if (!String(result).match('somethingelse="BAR"')) return done("BAR not there")
      return done()
    })
  })
})


describe('attributesFunction', function() {
  return it('should contain BAZ', function(done) {
    tal.process(talAttributes2, {foo: function() { return 'FOO' }, bar: function() { return 'BAR' }}, function (error, result){
      if (error) return done(error)
      if (!String(result).match('something="FOO"')) return done("FOO not there")
      if (!String(result).match('somethingelse="BAR"')) return done("BAR not there")
      return done()
    })
  })
})


describe('attributesAsyncFunction', function() {
  return it('should contain BAZ', function(done) {
    var fooFunc = function() {
      return new Promise(function(resolve){
        setTimeout(function() { resolve("FOO") }, 20)
      })
    }
    var barFunc = function() {
      return new Promise(function(resolve){
        setTimeout(function() { resolve("BAR") }, 10)
      })
    }
    tal.process(talAttributes2, {foo: fooFunc, bar: barFunc}, function (error, result) {
      if (error) return done(error)
      if (!String(result).match('something="FOO"')) return done("FOO not there")
      if (!String(result).match('somethingelse="BAR"')) return done("BAR not there")
      return done()
    })
  })
})