var lang = fis.compile.lang;
var rScript = /(<!--(?!\[)[\s\S]*?(?:-->|$))|(<script[^>]*>)([\s\S]*?)(<\/script>)/ig;
var rImport = /"(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|(\/\/[^\r\n\f]+|\/\*[\s\S]+?(?:\*\/|$))|\b(Rosetta\.import)\s*\(\s*("(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|\[[\s\S]*?\])\s*/g;

function extHtml(content, file, conf) {
  return content.replace(rScript, function(all, comment, start, body, end) {
    if (!comment) {
      return start + extJs(body, file, conf) + end;
    }

    return all;
  });
}

function extJs(content, file, conf) {
  return content.replace(rImport, function(m, comment, type, params) {
    if (type) {
      var info = parseParams(params);

      m = 'Rosetta.import([' + info.params.map(function(v) {
        var type = lang.jsAsync;
        return type.ld + v + type.rd;
      }).join(',') + ']';
    }

    return m;
  });
}


function parseParams(value) {
  var hasBrackets = false;
  var params = [];

  value = value.trim().replace(/(^\[|\]$)/g, function(m, v) {
    if (v) {
      hasBrackets = true;
    }
    return '';
  });
  params = value.split(/\s*,\s*/);

  return {
    params: params,
    hasBrackets: hasBrackets
  };
}

module.exports = function(content, file, conf) {
  if (file.isJsLike) {
    content = extJs(content, file, conf);
  } else {
    content = extHtml(content, file, conf);
  }

  return content;
};
