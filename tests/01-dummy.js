tal = require('../lib/template-tal')

dummy = '<p>hello</p>'

describe('dummy', function() {
  return it('should pass', function(done) {
    done();
  })
})

describe('simple', function() {
  return it('should process very simple data', function(done) {
    tal.process(dummy, {}, function (error, result){
      if(error) return done(error)
      done()
    })
  })
})