tal = require('../lib/template-tal')

talConditionEmptystring = `
<html>
    <body tal:condition="true:Emptystring">FAIL</body>
    <body tal:condition="false:Emptystring">PASS</body>
</html>
`

talConditionEmptystring2 = `
<html>
    <body tal:condition="true:Emptystring()">FAIL</body>
    <body tal:condition="false:Emptystring()">PASS</body>
</html>
`

describe('Emptystring_data', function() {
  return it('should pass', function(done) {
    tal.process(talConditionEmptystring, {Emptystring: ''}, function (error, result){
      if (error) return done(error)
      if (String(result).match('FAIL')) return done("unexpected fail")
      if (String(result).match('PASS')) return done("")
      return done('unexpected ', + result)
    })
  })
})


describe('Emptystring_function', function() {
  return it('should pass', function(done) {
    tal.process(talConditionEmptystring2, {Emptystring: function() { return '' }}, function (error, result){
      if (error) return done(error)
      if (String(result).match('FAIL')) return done("unexpected fail")
      if (String(result).match('PASS')) return done("")
      return done('unexpected ', + result)
    })
  })
})


describe('Emptystring_async_function', function() {
  return it('should pass', function(done) {
    var bazFunc = function() {
      return new Promise(function(resolve){
        setTimeout(function() { resolve('') }, 10)
      })
    }
    tal.process(talConditionEmptystring2, {Emptystring: bazFunc}, function (error, result){
      if (error) return done(error)
      if (String(result).match('FAIL')) return done("unexpected fail")
      if (String(result).match('PASS')) return done("")
      return done('unexpected ', + result)
    })
  })
})
