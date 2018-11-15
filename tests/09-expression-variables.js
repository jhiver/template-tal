tal = require('../lib/template-tal')

talExpressionVariables = `
<html>
  <body tal:define="one Number(1); two Number(2)">
    <p tal:content="one + two">four?</p>
  </body>
</html>
`

describe('expressionVarsData', function() {
  return it('should work', function(done) {
    tal.process(talExpressionVariables, {}, function (error, result){
      if (error) return done(error)
      if (String(result).match('<p>3</p>')) return done()
      return done('unexpected string')
    })
  })
})