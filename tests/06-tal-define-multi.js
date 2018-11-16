tal = require('../lib/template-tal')

talDefineMulti = `
<html>
    <body tal:define="
      foo foo;
      bar bar();
      baz baz()
    ">
      <p tal:content="foo"></p>
      <p tal:content="bar"></p>
      <p tal:content="baz"></p>
    </body>
</html>
`


describe('defineMulti', function() {
  return it('should contain be OK', function(done) {

    context = {
      foo: 'FOO',
      bar: function() { return 'BAR' },
      baz: function() {
        return new Promise(function(resolve){
          setTimeout(function() { resolve("BAZ") }, 10)
        })
      }
    }

    tal.process(talDefineMulti, context, function (error, result){
      if (error) return done(error)
      if (!String(result).match('FOO')) return done("not foo")
      if (!String(result).match('BAR')) return done("not bar")
      if (!String(result).match('BAZ')) return done("not baz")
      return done()
    })
  })
})
