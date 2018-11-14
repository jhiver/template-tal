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




/*
describe('redis', function() {
    return describe('flushall', function() {
      return it('should clear everything', function(done) {
        return Message.redis().flushall(function() {
          return Message.redis().keys('*', function(err, res) {
            if (err) {
              return done(err);
            }
            if (res.length === 0) {
              return done();
            }
            return done('redis keys not empty');
          });
        });
      });
    });
});

*/