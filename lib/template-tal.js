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
    return this.replace(/\${([^{}]*)}/g,
        function (a, b) {
            var r;
            try {
                r = eval(b);
            }
            catch (err) {
                r = a;
            }
            return r;
        }
    );
}


var MODIFIERS = {
    true: function (expr, context) {
        var arg = resolve (expr, context);
        if ((typeof(arg) == 'object') && arg.length)  { return true;  }
        if ((typeof(arg) == 'object') && !arg.length) { return false; }
        if ((typeof(arg) == 'array')  && arg.length)  { return true;  }
        if ((typeof(arg) == 'array')  && !arg.length) { return false; }
        if (arg) { return true; }
        return false;
    },
    false: function (expr, context) {
        var res = MODIFIERS['true'] (expr, context);
        if (res) { return false; } else { return true; }
    },
    string: function (string, context) {
        return string.tal_supplant(context);
    },
}


function process (xml, context) {
    var head = [];
    var body = [];
    var tail = [];
    if (typeof(xml) == "string") { xml = ShallowParse(xml); }
    if (xml.length == 0) { return '' };

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
                if (xml.length == 0) { throw ("cannot find closing tag for " + elemOrig); }
                var elem = xml.shift();
                if (tag_open(elem))  { balance++ };
                if (tag_close(elem)) { balance-- };
                body.push(elem);
            }
            tail = xml;
            break;
        }

        if(tag_close(elem)) { throw ("cannot find opening tag for " + elem); }
//        elem = elem.tal_supplant(context);
        head.push(elem);
    }
    var res = [];
    if (head) { res = res.concat(head); }
    if (body) { res = res.concat(process_block(body,context)); }
    if (tail) { res = res.concat(process(tail, context)); }
    return res.join ('');
}


function shallowCopy (item) {
    return JSON.parse(JSON.stringify(item));
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


function process_block (xml, context) {
    if (typeof(xml) == "string") { xml = ShallowParse(xml); }
    var tag  = xml.shift();
    var gat  = xml.pop();
    var node = tag_open(tag) || tag_self_close(tag);
    var ns   = namespace(node);
    var TAL  = ns || TAL;
    if (has_instructions (node)) {
        context = shallowCopy(context);
        return tal_on_error (node, xml, gat, context);
    }
    else {
        if (ns) { tag = node2tag(node); }
        if (gat) { return tag + process (xml, context) + gat }
        else     { return tag                                } // self-closing tag
    }
}


function tal_on_error (node, xml, end, context) {
    var stuff = node[TAL + ':on-error']; delete node[TAL + ':on-error'];
    if (!stuff) {
        return tal_define (node, xml, end, context);
    }
    var nodeCopy = shallowCopy(node);
    try {
        return tal_define (node, xml, end, context);
    }
    catch(err) {
        var result = [];
        for (var k in nodeCopy) {
            if (k.match(new RegExp('^' + TAL + ':'))) { delete nodeCopy[k] }
        }
        if (nodeCopy._close) {
            delete nodeCopy['_close'];
            end = '</' + nodeCopy._tag + '>'; // deal with self closing tags
        }
        result.push (node2tag(nodeCopy));
        result.push (resolve_expression(stuff, context));
        result.push (end);
        return result.join('');
    }
}


function tal_define (node, xml, end, context) {
    var stuff = node[TAL + ':define']; delete node[TAL + ':define'];
    if (!stuff) { return tal_condition (node, xml, end, context); }
    stuff = trim(stuff);

    var newContext = shallowCopy(context);
    var array = stuff.split(/;(?!;)/);
    for (var i=0; i<array.length; i++) {
        var def = trim (array[i]);
        var def_split = def.split(/\s+/);
        var symbol = def_split.shift();
        var expression = def_split.join(' ');
        newContext[symbol] = resolve_expression (expression, newContext);
    }
    return tal_condition (node, xml, end, newContext);
}


function tal_condition (node, xml, end, context) {
    var stuff = node[TAL + ':condition']; delete node[TAL + ':condition'];
    if (!stuff) { return tal_repeat (node, xml, end, context); }
    stuff = trim(stuff);

    var array = stuff.split(/;(?!;)/);
    for (var i=0; i<array.length; i++) {
        var cond = trim (array[i]);
        if (!resolve_expression(cond, context)) { return ''; }
    }
    return tal_repeat (node, xml, end, context);
}


function tal_repeat (node, xml, end, context) {
    var stuff = node[TAL + ':repeat']; delete node[TAL + ':repeat'];
    if (!stuff) { return tal_content (node, xml, end, context); }
    stuff = trim(stuff);

    var array = stuff.split(/\s+/);
    var symbol = array.shift();
    var expression = array.join (' ');
    
    array = resolve_expression (expression, context);
    var count = 0;
    var result = [];
    for (var i=0; i<array.length; i++) {
        count++;
        var item = array[i];
        var newContext = shallowCopy(context);
        var newNode = shallowCopy(node);
        newContext.repeat = {};
        newContext.repeat.index  = count;
        newContext.repeat.number = count;
        newContext.repeat.even   = !(count%2);
        newContext.repeat.odd    = count%2;
        newContext.repeat.start  = (count == 1);
        newContext.repeat.end    = (count == array.length);
        newContext.repeat.inner  = (!newContext.repeat.start && !newContext.repeat.end);
        newContext[symbol] = item;
        result.push(tal_content(newNode, shallowCopy(xml), end, newContext));
    }
    return result.join('');
}


function tal_content (node, xml, end, context) {
    var stuff = node[TAL + ':content']; delete node[TAL + ':content'];
    if (!stuff) { return tal_replace (node, xml, end, context); }
    stuff = trim(stuff);

    var res = resolve_expression (stuff, context);
    var xml = [];
    if (res) { xml.push (res); }

    if (node['_close']) {
        delete node["_close"];
        end = "</" + node._tag + '>';
    }
    return tal_replace (node, xml, end, context);
}


function tal_replace (node, xml, end, context) {
    var stuff = node[TAL + ':replace']; delete node[TAL + ':replace'];
    if (!stuff) { return tal_attributes (node, xml, end, context); }
    stuff = trim(stuff);
    var res = resolve_expression (stuff, context);
    if (res != null) { return res; }
    else { return '' }
}


function tal_attributes (node, xml, end, context) {
    var stuff = node[TAL + ':attributes']; delete node[TAL + ':attributes'];
    if (!stuff) { return tal_omit_tag (node, xml, end, context); }
    stuff = trim(stuff);

    var array = stuff.split(/;(?!;)/);
    for (var i=0; i<array.length; i++) {
        var att = trim (array[i]);
        var args = att.split(/\s+/);
        var symbol = args.shift();
        var expression = args.join (' ');
        node[symbol] = resolve_expression (expression, context);
        if (node[symbol] == null) { delete node[symbol]; }
    }
    return tal_omit_tag (node, xml, end, context);
}


function tal_omit_tag (node, xml, end, context) {
    var stuff = node[TAL + ':omit-tag']; delete node[TAL + ':omit-tag'];
    var omit;
    if (stuff == null) {
        omit = false;
    }
    else {
        if (stuff == "") {
            omit = true;
        }
        else {
            node[TAL + ':omit-tag'];
            omit = resolve_expression (stuff, context);
        }
    }

    if (omit && !end) { return ''; } // omit-tag on a self-closing tag means *poof*, nothing left
    var result = [];

    if (!omit) { result.push(node2tag(node)); }
    if (end) {
        result.push (process (xml, context));
        if (!omit) {
            result.push(end);
        }
    }
    return result.join ('');
}


function resolve_expression (expr, context) {
    expr = unescape(expr);
    if (expr == 'nothing') { return null; }
    var structure = false;
    if (expr.match(/^structure\s+/)) {
        expr = expr.replace (/^structure\s+/, '')
        structure = true;
    }
    if (structure) {
        return resolve (expr, context);
    }
    else {
        return xmlencode (resolve (expr, context));
    }
}


function resolve (expr, self) {
    expr = trim(expr);
    for (var mod in MODIFIERS) {
        var regex = new RegExp('^' + mod + ':');
        if (expr.match (regex)) {
            expr = expr.replace(regex, '');
            return MODIFIERS[mod] (expr, self);
        }
    }

    if (expr.match (/^--/)) {
        return expr.replace (/^--/, '');
    }

    try {
        return eval(expr);
    }
    catch (err) {
        console.log("[WARN] cannot resolve expression", expr);
        if ((typeof(err) == "string") && err.match(/is not defined/)) { return null };
        self.ERROR = err;
        throw err;
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


exports.process = process;


// express 3 compatibility
var fs = require('fs');
exports.__express = function (filename, options, callback) {
    fs.readFile(filename, 'utf8', function(err, str){
        if (err) { return callback(err); }
        try {
            return callback (null, process (str, options));
        }
        catch(err) {
            return callback(err);
        }
    });
};
