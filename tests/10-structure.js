tal = require('../lib/template-tal')

talStructure = `
<html>
  <body tal:content="structure html">
  </body>
</html>
`

describe('expressionVarsData', function() {
  return it('should work', function(done) {
    opts = { "html": '<div class="markdown" id="6f828cb9-6616-403c-8e32-7df504aaf155"> <p>Hello <em>World</em>!</p> </div>' }
    tal.process(talStructure, opts, function (error, result){
      if (error) return done(error)
      if (result.match('<div class="markdown" id="6f828cb9-6616-403c-8e32-7df504aaf155"> <p>Hello <em>World</em>!</p> </div>')) return done()
      return done('unexpected string')
    })
  })
})