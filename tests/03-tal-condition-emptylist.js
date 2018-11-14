tal = require('../lib/template-tal')

talConditionEmptylist = `
<html>
    <body tal:condition="true:self.Emptylist">FAIL</body>
    <body tal:condition="false:self.Emptylist">PASS</body>
</html>
`

talConditionEmptylist2 = `
<html>
    <body tal:condition="true:self.Emptylist()">FAIL</body>
    <body tal:condition="false:self.Emptylist()">PASS</body>
</html>
`

describe('Emptylist_data', function() {
  return it('should pass', function(done) {
    tal.process(talConditionEmptylist, {Emptylist: []}, function (error, result){
      if (error) return done(error)
      if (String(result).match('FAIL')) return done("unexpected fail")
      if (String(result).match('PASS')) return done("")
      return done('unexpected ', + result)
    })
  })
})


describe('Emptylist_function', function() {
  return it('should pass', function(done) {
    tal.process(talConditionEmptylist2, {Emptylist: function() { return [] }}, function (error, result){
      if (error) return done(error)
      if (String(result).match('FAIL')) return done("unexpected fail")
      if (String(result).match('PASS')) return done("")
      return done('unexpected ', + result)
    })
  })
})


describe('Emptylist_async_function', function() {
  return it('should pass', function(done) {
    var bazFunc = function() {
      return new Promise(function(resolve){
        setTimeout(function() { resolve([]) }, 10)
      })
    }
    tal.process(talConditionEmptylist2, {Emptylist: bazFunc}, function (error, result){
      if (error) return done(error)
      if (String(result).match('FAIL')) return done("unexpected fail")
      if (String(result).match('PASS')) return done("")
      return done('unexpected ', + result)
    })
  })
})
