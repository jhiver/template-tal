tal = require('../lib/template-tal')

talOmitTag = `
<html>
  <body>
    <omit tal:omit-tag="true:trueExpr">omit</omit>
    <dontomit tal:omit-tag="false:trueExpr">dontomit</dontomit>
  </body>
</html>
`

talOmitTag2 = `
<html>
  <body>
    <omit tal:omit-tag="true:trueExpr()">omit</omit>
    <dontomit tal:omit-tag="false:trueExpr()">dontomit</dontomit>
  </body>
</html>
`

talOmitTag3 = `
<html>
  <body>
    <span tal:omit-tag="">omit</span>
  </body>
</html>
`

describe('omitTagData3', function() {
  return it('should work', function(done) {
    tal.process(talOmitTag3, {}, function (error, result){
      if (error) return done(error)
      if (String(result).match('span')) return done("omit isn't working")
      return done()
    })
  })
})


describe('omitTagData', function() {
  return it('should work', function(done) {
    tal.process(talOmitTag, {trueExpr: "something"}, function (error, result){
      if (error) return done(error)
      if (!String(result).match(' omit')) return done("omit isn't working")
      if (!String(result).match('<dontomit>dontomit</dontomit>')) return done("dontomit isn't working")
      return done()
    })
  })
})


describe('omitTagFunction', function() {
  return it('should contain BAZ', function(done) {
    tal.process(talOmitTag2, {trueExpr: function() { return 'something' }}, function (error, result){
      if (error) return done(error)
      if (!String(result).match(' omit')) return done("omit isn't working")
      if (!String(result).match('<dontomit>dontomit</dontomit>')) return done("dontomit isn't working")
      return done()
    })
  })
})


describe('omitTagAsyncFunction', function() {
  return it('should contain BAZ', function(done) {
    var trueExpr = function() {
      return new Promise(function(resolve){
        setTimeout(function() { resolve("something") }, 10)
      })
    }
    tal.process(talOmitTag2, {trueExpr: trueExpr}, function (error, result) {
      if (error) return done(error)
      if (!String(result).match(' omit')) return done("omit isn't working")
      if (!String(result).match('<dontomit>dontomit</dontomit>')) return done("dontomit isn't working")
      return done()
    })
  })
})
