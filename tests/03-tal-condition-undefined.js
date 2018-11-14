tal = require('../lib/template-tal')

talConditionUndefined = `
<html>
    <body tal:condition="true:undefined">FAIL</body>
    <body tal:condition="false:undefined">PASS</body>
</html>
`

talConditionUndefined2 = `
<html>
    <body tal:condition="true:undefined()">FAIL</body>
    <body tal:condition="false:undefined()">PASS</body>
</html>
`

describe('undefined_data', function() {
  return it('should pass', function(done) {
    tal.process(talConditionUndefined, {undefined: undefined}, function (error, result){
      if (error) return done(error)
      if (String(result).match('FAIL')) return done("unexpected fail")
      if (String(result).match('PASS')) return done("")
      return done('unexpected ', + result)
    })
  })
})


describe('undefined_function', function() {
  return it('should pass', function(done) {
    tal.process(talConditionUndefined2, {undefined: function() { return undefined }}, function (error, result){
      if (error) return done(error)
      if (String(result).match('FAIL')) return done("unexpected fail")
      if (String(result).match('PASS')) return done("")
      return done('unexpected ', + result)
    })
  })
})


describe('undefined_async_function', function() {
  return it('should pass', function(done) {
    var bazFunc = function() {
      return new Promise(function(resolve){
        setTimeout(function() { resolve(undefined) }, 10)
      })
    }
    tal.process(talConditionUndefined2, {undefined: bazFunc}, function (error, result){
      if (error) return done(error)
      if (String(result).match('FAIL')) return done("unexpected fail")
      if (String(result).match('PASS')) return done("")
      return done('unexpected ', + result)
    })
  })
})
