tal = require('../lib/template-tal')

talConditionzero = `
<html>
    <body tal:condition="true:self.zero">FAIL</body>
    <body tal:condition="false:self.zero">PASS</body>
</html>
`

talConditionzero2 = `
<html>
    <body tal:condition="true:self.zero()">FAIL</body>
    <body tal:condition="false:self.zero()">PASS</body>
</html>
`

describe('zero_data', function() {
  return it('should pass', function(done) {
    tal.process(talConditionzero, {zero: 0}, function (error, result){
      if (error) return done(error)
      if (String(result).match('FAIL')) return done("unexpected fail")
      if (String(result).match('PASS')) return done("")
      return done('unexpected ', + result)
    })
  })
})


describe('zero_function', function() {
  return it('should pass', function(done) {
    tal.process(talConditionzero2, {zero: function() { return 0 }}, function (error, result){
      if (error) return done(error)
      if (String(result).match('FAIL')) return done("unexpected fail")
      if (String(result).match('PASS')) return done("")
      return done('unexpected ', + result)
    })
  })
})


describe('zero_async_function', function() {
  return it('should pass', function(done) {
    var bazFunc = function() {
      return new Promise(function(resolve){
        setTimeout(function() { resolve(0) }, 10)
      })
    }
    tal.process(talConditionzero2, {zero: bazFunc}, function (error, result){
      if (error) return done(error)
      if (String(result).match('FAIL')) return done("unexpected fail")
      if (String(result).match('PASS')) return done("")
      return done('unexpected ', + result)
    })
  })
})
