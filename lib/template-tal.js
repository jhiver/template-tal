// REX/Javascript 1.0
// Robert D. Cameron "REX: XML Shallow Parsing with Regular Expressions",
// Technical Report TR 1998-17, School of Computing Science, Simon Fraser
// University, November, 1998.
// Copyright (c) 1998, Robert D. Cameron.
// The following code may be freely used and distributed provided that
// this copyright and citation notice remains intact and that modifications
// or additions are clearly identified.
var TextSE = "[^<]+";
var UntilHyphen = "[^-]*-";
var Until2Hyphens = UntilHyphen + "([^-]" + UntilHyphen + ")*-";
var CommentCE = Until2Hyphens + ">?";
var UntilRSBs = "[^]]*]([^]]+])*]+";
var CDATA_CE = UntilRSBs + "([^]>]" + UntilRSBs + ")*>";
var S = "[ \\n\\t\\r]+";
var NameStrt = "[A-Za-z_:]|[^\\x00-\\x7F]";
var NameChar = "[A-Za-z0-9_:.-]|[^\\x00-\\x7F]";
var Name = "(" + NameStrt + ")(" + NameChar + ")*";
var QuoteSE = '"[^"]' + "*" + '"' + "|'[^']*'";
var DT_IdentSE = S + Name + "(" + S + "(" + Name + "|" + QuoteSE + "))*";
var MarkupDeclCE = "([^]\"'><]+|" + QuoteSE + ")*>";
var S1 = "[\\n\\r\\t ]";
var UntilQMs = "[^?]*\\?+";
var PI_Tail = "\\?>|" + S1 + UntilQMs + "([^>?]" + UntilQMs + ")*>";
var DT_ItemSE = "<(!(--" + Until2Hyphens + ">|[^-]" + MarkupDeclCE + ")|\\?" + Name + "(" + PI_Tail + "))|%" + Name + ";|" + S;
var DocTypeCE = DT_IdentSE + "(" + S + ")?(\\[(" + DT_ItemSE + ")*](" + S + ")?)?>?";
var DeclCE = "--(" + CommentCE + ")?|\\[CDATA\\[(" + CDATA_CE + ")?|DOCTYPE(" + DocTypeCE + ")?";
var PI_CE = Name + "(" + PI_Tail + ")?";
var EndTagCE = Name + "(" + S + ")?>?";
var AttValSE = '"[^<"]' + "*" + '"' + "|'[^<']*'";
var ElemTagCE = Name + "(" + S + Name + "(" + S + ")?=(" + S + ")?(" + AttValSE + "))*(" + S + ")?/?>?";
var MarkupSPE = "<(!(" + DeclCE + ")?|\\?(" + PI_CE + ")?|/(" + EndTagCE + ")?|(" + ElemTagCE + ")?)";
var XML_SPE = TextSE + "|" + MarkupSPE;

function ShallowParse(XMLdoc) {
  return XMLdoc.match(new RegExp(XML_SPE, "g"));
}
// REX END - thank you Robert! Awesome... I just added "var" keyword everywhere.

var ElemTagCE_Mod = S + Name + "(" + S + ")?=(" + S + ")?(" + AttValSE + ')';

var RE_1 = ElemTagCE;
var RE_2 = ElemTagCE_Mod;

var VARIABLE_RE_SIMPLE   = "\$[A-Za-z_][A-Za-z0-9_\.:\/]+";
var VARIABLE_RE_BRACKETS = "(?<!\$)\\{.*?(?<!\\\\)\\}";
var STRING_TOKEN_RE      = "(" + VARIABLE_RE_SIMPLE + '|' + VARIABLE_RE_BRACKETS + ")"

var TAL = 'tal';

var STOP_RECURSE = 0;


String.prototype.tal_supplant = function (self) {
  return this.replace(/\${([^{}]*)}/g, function (a, b) {
    var r;
    try {
      r = eval(b);
    }
    catch (err) {
      r = a;
    }
    return r;
  });
}


var MODIFIERS = {
  true: function (expr, context, callback) {
    resolve(expr, context, function(error, arg) {
      if(error) { return callback(error) }
      if (arg === null) { return callback(null, false) }
      if ((typeof(arg) == 'object') && arg.length)  { return callback(null, true)  }
      if ((typeof(arg) == 'object') && !arg.length) { return callback(null, false) }
      if ((typeof(arg) == 'array')  && arg.length)  { return callback(null, true)  }
      if ((typeof(arg) == 'array')  && !arg.length) { return callback(null, false) }
      if (arg) { return callback(null, true) }
      return callback(null, false)
    })
  },
  false: function (expr, context, callback) {
    resolve(expr, context, function(error, arg) {
      if(error) { return callback(error) }
      if (arg === null) { return callback(null, true) }
      if ((typeof(arg) == 'object') && arg.length)  { return callback(null, false)  }
      if ((typeof(arg) == 'object') && !arg.length) { return callback(null, true) }
      if ((typeof(arg) == 'array')  && arg.length)  { return callback(null, false)  }
      if ((typeof(arg) == 'array')  && !arg.length) { return callback(null, true) }
      if (arg) { return callback(null, false) }
      return callback(null, true)
    })
  },
  string: function (string, context, callback) {
    return callback(null, string.tal_supplant(context))
  }
}


function Process (xml, context, callback) {
  var head = [];
  var body = [];
  var tail = [];
  if (typeof(xml) == "string") { xml = ShallowParse(xml); }
  if (xml.length == 0) { return callback(null, '') };

  while(xml.length) {
    var elem = xml.shift();

    if (tag_self_close (elem)) {
        body.push(elem);
        tail = xml;
        break;
    }

    var opentag = tag_open (elem);
    if (opentag) {
        body.push(elem);
        var elemOrig = elem;
        var balance = 1;
        while (balance) {
            if (xml.length == 0) { return callback ("cannot find closing tag for " + elemOrig) }
            var elem = xml.shift();
            if (tag_open(elem))  { balance++ };
            if (tag_close(elem)) { balance-- };
            body.push(elem);
        }
        tail = xml;
        break;
    }

    if(tag_close(elem)) { return callback ("cannot find opening tag for " + elem) }
    head.push(elem);
  }
  var res = [];
  if (head) { res = res.concat(head); }
  Process_block(body, context, function (error, block_result) {
    if(error) return callback(error)
    block_result = block_result || ''
    res = res.concat(block_result);
    Process(tail, context, function (error, tail_result){
      if (error) return callback(error)
      tail_result = tail_result || ''
      res = res.concat(tail_result);
      return callback(null, res.join(''))
    })
  })
}


function shallowCopy (item) {
  if (typeof(item) === 'object') {
    if (Object.prototype.toString.call(item) === '[object Array]') {
      var copy = [];
      for (i=0; i<item.length; i++) {
        copy[i] = item[i];
      }
      return copy;

    }
    else if (Object.prototype.toString.call(item) === '[object Object]') {
      var copy = {};
      for (var key in item) {
        copy[key] = item[key];
      }
      return copy;
    }
    else {
      return item;
    }
  }
  else {
    return item;
  }
}


function namespace (node) {
  for (var k in node) {
    if (k.match(/^xmlns\:/)) {
      var v = node[k];
      if (v == 'http://xml.zope.org/namespaces/tal') {
        delete node[k];
        k = k.replace(/^xmlns\:/, '');
        return k;
      }
    }
  }
}


function Process_block (xml, context, callback) {
  if (xml == null) { return callback(null, null) }
  if (typeof(xml) == "string") { xml = ShallowParse(xml); }
  var tag  = xml.shift();
  var gat  = xml.pop();
  var node = tag_open(tag) || tag_self_close(tag);
  var ns   = namespace(node);
  var TAL  = ns || TAL;
  if (has_instructions (node)) {
    context = shallowCopy(context);
    return tal_on_error (node, xml, gat, context, callback);
  }
  else {
    if (ns) { tag = node2tag(node); }
    if (gat) {
      Process(xml, context, function (error, result){
        if (error) return callback(error)
        return callback(null, tag+result+gat)
      })
    }
    else {
      return callback(null, tag) // self-closing tag
    }
  }
}


function tal_on_error (node, xml, end, context, callback) {

  var stuff = node[TAL + ':on-error']; delete node[TAL + ':on-error'];
  if (!stuff) {
    return tal_define(node, xml, end, context, callback);
  }
  var nodeCopy = shallowCopy(node);
  tal_define (node, xml, end, context, function(err, result){
    var result = [];
    for (var k in nodeCopy) {
        if (k.match(new RegExp('^' + TAL + ':'))) { delete nodeCopy[k] }
    }
    if (nodeCopy._close) {
        delete nodeCopy['_close'];
        end = '</' + nodeCopy._tag + '>'; // deal with self closing tags
    }
    result.push (node2tag(nodeCopy));
    resolve_expression(stuff, context, function(error, resolveResult){
      if (error) return callback(error)
      resolveResult = resolveResult || ''
      result.push(resolveResult)
      result.push (end);
      return callback(null, result.join(''))
    })
  });
}


function tal_define_each (array, node, xml, end, context, callback) {
  if(array.length == 0) { return callback() }
  var def = trim(array.shift())
  var def_split = def.split(/\s+/)
  var symbol = def_split.shift()
  var expression = def_split.join(' ')
  resolve_expression(expression, context, function(error, result) {
    if (error) {
      console.error("error", error)
    }
    else {
      context[symbol] = result;
    }
    return tal_define_each(array, node, xml, end, context, callback);
  });
}


function tal_define (node, xml, end, context, callback) {
  var stuff = node[TAL + ':define']; delete node[TAL + ':define'];
  if (!stuff) { return tal_condition (node, xml, end, context, callback); }
  stuff = trim(stuff);

  var newContext = shallowCopy(context);
  var array = stuff.split(/;(?!;)/);
  tal_define_each(array, node, xml, end, newContext, function() {
    return tal_condition (node, xml, end, newContext, callback);
  });
}


function tal_condition_each (array, node, xml, end, context, callback) {
  if(array.length == 0) { return callback(true) }
  cond = trim(array.shift())
  resolve_expression(cond, context, function (error, result) {
    if (error) { console.error(error) }
    if (result) {
      return tal_condition_each (array, node, xml, end, context, callback);
    }
    else {
      return callback(false);
    }
  })
}


function tal_condition (node, xml, end, context, callback) {
  var stuff = node[TAL + ':condition']; delete node[TAL + ':condition'];
  if (!stuff) { return tal_repeat (node, xml, end, context, callback) }
  stuff = trim(stuff);
  var array = stuff.split(/;(?!;)/);
  tal_condition_each (array, node, xml, end, context, function (is_true) {
    if(is_true) {
      return tal_repeat (node, xml, end, context, callback)
    }
    else {
      return callback(null, '')
    }
  })
}


function tal_repeat_each (symbol, array, node, xml, end, context, callback, count, temp) {

  temp = temp || []
  if(array.length == 0) { return callback(null, temp) }

  item = array.shift()
  var newContext = shallowCopy(context)
  var newNode = shallowCopy(node)

  if(count) {
    count++
  }
  else {
    count = 1
  }

  newContext.repeat = {}
  newContext.repeat.index  = count
  newContext.repeat.number = count
  newContext.repeat.even   = !(count%2)
  newContext.repeat.odd    = count%2
  newContext.repeat.start  = (count == 1)
  newContext.repeat.end    = array.length == 0
  newContext.repeat.inner  = (!newContext.repeat.start && !newContext.repeat.end)
  newContext[symbol] = item

  tal_content(newNode, shallowCopy(xml), end, newContext, function (error, result) {
    if (error) return callback(error)
    result = result || ''
    temp.push(result)
    return tal_repeat_each(symbol, array, node, xml, end, context, callback, count, temp)
  })
}


function tal_repeat (node, xml, end, context, callback) {
  var stuff = node[TAL + ':repeat']; delete node[TAL + ':repeat'];
  if (!stuff) { return tal_content (node, xml, end, context, callback); }
  stuff = trim(stuff);

  var array = stuff.split(/\s+/);
  var symbol = array.shift();
  var expression = array.join (' ');

  resolve_expression(expression, context, function(error, array) {
    if (error) return callback(error)
    array = array || [];

    new_array = [];
    for (i in array) {
      new_array.push(array[i])
    }

    tal_repeat_each (symbol, new_array, node, xml, end, context, function (error, result){
      if (error) return callback(error)
      result = result || []
      return callback(null, result.join(''))
    })
  })
}


function tal_content (node, xml, end, context, callback) {
  var stuff = node[TAL + ':content']; delete node[TAL + ':content'];
  if (!stuff) { return tal_replace (node, xml, end, context, callback); }
  stuff = trim(stuff);

  resolve_expression(stuff, context, function(error, res) {
    if (error) return callback(error)
    res = res || '';
    var xml = [];
    if (res) { xml.push (res); }
    if (node['_close']) {
      delete node["_close"];
      end = "</" + node._tag + '>';
    }
    return tal_replace (node, xml, end, context, callback);
  });
}


function tal_replace (node, xml, end, context, callback) {
  var stuff = node[TAL + ':replace']; delete node[TAL + ':replace'];
  if (!stuff) { return tal_attributes (node, xml, end, context, callback) }
  stuff = trim(stuff)
  resolve_expression(stuff, context, function(error, res) {
    if (error) return callback(error)
    if (res != null) { return callback(null, res) }
    else { return callback(null, '') }
  })
}


function tal_attributes_each (array, node, xml, end, context, callback) {
  if(array.length == 0) { return callback() }
  var att = trim(array.shift())
  var args = att.split(/\s+/)
  var symbol = args.shift()
  var expression = args.join (' ')

  resolve_expression(expression, context, function (error, result){
    if (error) { console.error(error) }
    if (result === undefined || result === null || result === false) {
      delete node[symbol]
    }
    else {
      node[symbol] = result
    }
    return tal_attributes_each(array, node, xml, end, context, callback)
  })
}


function tal_attributes (node, xml, end, context, callback) {
  var stuff = node[TAL + ':attributes']; delete node[TAL + ':attributes'];
  if (!stuff) { return tal_omit_tag (node, xml, end, context, callback) }
  stuff = trim(stuff);

  var array = stuff.split(/;(?!;)/)
  tal_attributes_each(array, node, xml, end, context, function(){
    return tal_omit_tag (node, xml, end, context, callback)
  })
}


function tal_omit_tag (node, xml, end, context, callback) {
  var stuff = node[TAL + ':omit-tag']; delete node[TAL + ':omit-tag'];

  var omit;
  if (stuff === undefined) {
    omitProcessor = function (callback) { return callback(null, false) }
  }
  else if (stuff === null) {
    omitProcessor = function (callback) { return callback(null, false) }
  }
  else if (stuff === false) {
    omitProcessor = function (callback) { return callback(null, false) }
  }
  else if (stuff === 0) {
    omitProcessor = function (callback) { return callback(null, false) }
  }
  else if (stuff === "") {
    omitProcessor = function (callback) { return callback(null, true) }
  }
  else {
    node[TAL + ':omit-tag'];
    omitProcessor = function(callback) {
      resolve_expression (stuff, context, callback)
    }
  }

  omitProcessor(function(error, omit) {
    if (omit && !end) { return callback (null,'') } // omit-tag on a self-closing tag means *poof*, nothing left
    Process(xml, context, function (error, content){

      if (error) return callback(error)
      content = content || '';
      var result = [];

      if (!omit) { result.push(node2tag(node)); }
      if (end) {
        result.push(content)
        if (!omit) {
          result.push(end)
        }
      }
      return callback(null, result.join (''))
    })
  })
}


function resolve_expression (expr, context, callback) {
  expr = unescape(expr);
  if (expr == 'nothing') { return null; }
  var structure = false;
  if (expr.match(/^structure\s+/)) {
    expr = expr.replace (/^structure\s+/, '')
    structure = true;
  }
  resolve(expr, context, function (error, result) {
    if(error) return callback(error, null)

    if (structure) {
      // this is a hack so that template-tal doesn't think
      // the result is an XML open tag, &structure; string
      // will be stripped out off the result at the end of
      // processing.
      return callback(null, '&structure;' + result)
    }
    else {
      return callback(null, xmlencode(result))
    }
  })
}


function resolve (expr, $ctx, callback) {

  expr = trim(expr);
  for (var mod in MODIFIERS) {
    var regex = new RegExp('^' + mod + ':');
    if (expr.match (regex)) {
      expr = expr.replace(regex, '');
      return MODIFIERS[mod] (expr, $ctx, callback)
    }
  }

  if (expr.match (/^--/)) {
    return callback(null, expr.replace (/^--/, ''))
  }

  try {

    string_to_eval = []
    string_to_eval.push("(function(){")
    for(var property in $ctx){
      string_to_eval.push(`  var ${property} = $ctx['${property}']`)
    }
    string_to_eval.push(`  return ${expr}`)
    string_to_eval.push("})()")
    string_to_eval = string_to_eval.join("\n")

    result = eval(string_to_eval)
    if(result instanceof Promise) {
      result.then(
        function(value) { callback(null, value) },
        function(error) { callback(error, null)}
      );
    }
    else {
      return callback(null, result)
    }
  }
  catch (err) {
    $ctx.ERROR = err
    return callback(err, null)
  }
}


function node2tag (node) {
  var tag   = node._tag; delete node['_tag'];
  var open  = node._open; delete node['_open'];
  var close = node._close; delete node['_close'];

  var array = [];
  for (var k in node) {
    if (k.match(new RegExp('^' + TAL + ':'))) { delete node[k]; continue; }
    array.push (k + '="' + node[k] + '"');
  }
  var att;
  if (array.length == 0) { att = ''; }
  else                   { att = array.join (' '); }

  if (open && close) {
    if (att) {
      return '<' + tag + ' ' + att + ' />';
    }
    else {
      return '<' + tag + ' />';
    }
  }

  if (close) {
    return '</' + tag + '>';
  }

  if (att) {
    return '<' + tag + ' ' + att + '>';
  }
  else  {
    return '<' + tag + '>';
  }
}


function trim (string) {
  if(!string) { return string }
  if (typeof(string) == 'string') {
    return string.replace(/\r/g, '')
                 .replace(/\n/g, ' ')
                 .replace(/^\s+/, '')
                 .replace(/\s+$/, '');
  }
  else {
    return string;
  }
}


function has_instructions (node) {
  for (var k in node) {
    if (k.match(new RegExp('^' + TAL + ':'))) { return true; }
  }
  return false;
}


function tag (elem) {
  return tag_open(elem) || tag_close(elem) || tag_self_close(elem);
}


function tag_open (elem, node) {
  if (!elem) { return null }
  if (typeof(elem) != 'string') { return null }
  if (!elem.match(/^</))  { return null; }
  if (elem.match(/^<\!/)) { return null; }
  if (elem.match(/^<\//)) { return null; }
  if (elem.match(/\/>$/)) { return null; }
  if (elem.match(/^<\?/)) { return null; }
  if (elem.match(/^</)) {
    var node    = extract_attributes(elem);
    var capt    = elem.match(/.*?([A-Za-z0-9][A-Za-z0-9_:-]*)/);
    node._tag   = capt[1];
    node._open  = true;
    node._close = false;
    return node;
  }
  return null;
}


function tag_close (elem, node) {
  if (!elem) { return null }
  if (typeof(elem) != 'string') { return null }
  if (!elem.match(/^</))  { return null; }
  if (elem.match(/^<\!/)) { return null; }
  if (elem.match(/\/>$/)) { return null; }
  if (elem.match(/^<\//)) {
    node = node || {};
    var capt    = elem.match(/.*?([A-Za-z0-9][A-Za-z0-9_:-]*)/);
    node._tag   = capt[1];
    node._open  = false;
    node._close = true;
    return node;
  }
  return null;
}


function tag_self_close (elem, node) {
  if (!elem) { return null }
  if (typeof(elem) != 'string') { return null }
  if (!elem.match(/^</))  { return null; }
  if (elem.match(/^<\!/)) { return null; }
  if (elem.match(/^<\//)) { return null; }
  if (elem.match(/\/>$/) && elem.match(/^</)) {
    var node    = extract_attributes (elem);
    var capt    = elem.match(/.*?([A-Za-z0-9][A-Za-z0-9_:-]*)/);
    node._tag   = capt[1];
    node._open  = true;
    node._close = true;
    return node;
  }
  return null;
}

function text (elem) {
  if (elem.match(/^</)) { return null; }
  else { return elem; }
}


function extract_attributes (tag) {
  var regex = new RegExp(RE_2, "g");
  var match = tag.match(regex);
  var attr  = {};
  for (index in match) {
    var token = trim(match[index]);
    var array = token.split('=');
    var key = array.shift();
    var val = array.join ('=');
    val = val.replace(/^('|")/, '').replace (/('|")$/, '');
    attr[key] = val;
  }
  return attr;
}


function xmlencode (string) {
  if (!string) { return string; }
  if (typeof(string) == 'string') {
    return string.replace(/&/g, '&amp;')
                 .replace(/</g, '&lt;')
                 .replace(/>/g, '&gt;')
                 .replace(/"/g, '&quot;')
                 .replace(/'/g, '&apos;');
  }
  else {
    return string;
  }
}


function unescape (string) {
  if (!string) { return string; }
  if (typeof(string) == 'string') {
    return trim (string).replace(/\;\;/g, ';').replace(/\$\$/g, '$');
  }
  else {
    return string;
  }
}


exports.process = function(xml, data, callback) {
  if(callback) {
    Process(xml,data,function(error, result){
      if(error) return callback(error)
      return callback(null, result.replace(/\&structure;/g, ''))
    })
  }
  else {
    return new Promise(function(resolve, reject) {
      Process(xml, data, function(error, result){
        if(error) {
          return reject(error)
        }
        else {
          return resolve(result.replace(/\&structure;/g, ''))
        }
      })
    })
  }
}

exports.MODIFIERS = MODIFIERS