tal = require('../lib/template-tal')

talConditionNull = `
<html>
    <body tal:condition="true:zob">FAIL</body>
    <body tal:condition="false:zob">PASS</body>
</html>
`

talConditionNull2 = `
<html>
    <body tal:condition="true:zob()">FAIL</body>
    <body tal:condition="false:zob()">PASS</body>
</html>
`

describe('null_data', function() {
  return it('should pass', function(done) {
    tal.process(talConditionNull, {"zob": null}, function (error, result){
      if (error) return done(error)
      if (String(result).match('FAIL')) return done("unexpected fail")
      if (String(result).match('PASS')) return done("")
      return done('unexpected ', + result)
    })
  })
})


describe('null_function', function() {
  return it('should pass', function(done) {
    tal.process(talConditionNull2, {"zob": function() { return null }}, function (error, result){
      if (error) return done(error)
      if (String(result).match('FAIL')) return done("unexpected fail")
      if (String(result).match('PASS')) return done("")
      return done('unexpected ', + result)
    })
  })
})


describe('null_async_function', function() {
  return it('should pass', function(done) {
    var bazFunc = function() {
      return new Promise(function(resolve){
        setTimeout(function() { resolve(null) }, 10)
      })
    }
    tal.process(talConditionNull2, {"zob": bazFunc}, function (error, result){
      if (error) return done(error)
      if (String(result).match('FAIL')) return done("unexpected fail")
      if (String(result).match('PASS')) return done("")
      return done('unexpected ', + result)
    })
  })
})
