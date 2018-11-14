tal = require('../lib/template-tal')

talOnerror = `
<html>
<body>
  <p tal:on-error="string:something bad happened">
    <b tal:replace="this.does.not.exist()" />
  </p>
</body>
</html>
`

talOnerror2 = `
<html>
<body>
  <p tal:on-error="string:something bad happened">
    <b tal:replace="makeerror()" />
  </p>
</body>
</html>
`


describe('onerror_data', function() {
  return it('should pass', function(done) {
    tal.process(talOnerror, {}, function (error, result){
      if (error) return done(error)
      if (String(result).match('something bad happened')) return done()
      done("unexpected result")
    })
  })
})


describe('onerror_function', function() {
  return it('should pass', function(done) {
    tal.process(talOnerror2, {makeerror: function() { return foo + bar }}, function (error, result){
      if (error) return done(error)
      if (String(result).match('something bad happened')) return done()
      done("unexpected result")
    })
  })
})


describe('onerror_async_promise', function() {
  return it('should pass', function(done) {
    var bazFunc = function() {
      return new Promise(function(resolve, reject){
        setTimeout(function() { reject("screw this") }, 10)
      })
    }
    tal.process(talOnerror2, {onerror: bazFunc}, function (error, result){
      if (error) return done(error)
      if (String(result).match('something bad happened')) return done()
      done("unexpected result")
    })
  })
})


describe('onerror_async_makeitdie', function() {
  return it('should pass', function(done) {
    var bazFunc = function() {
      return new Promise(function(resolve, reject){
        setTimeout(function() { return foo + bar }, 10)
      })
    }
    tal.process(talOnerror2, {onerror: bazFunc}, function (error, result){
      if (error) return done(error)
      if (String(result).match('something bad happened')) return done()
      done("unexpected result")
    })
  })
})
