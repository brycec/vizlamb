(function() {

  _.mixin({
    type: function(node) {
      return node.name == "@" ? 'app' : node.name == "#" ? 'abs' : 'var';
    },

    isReducible: function(node) {
      return _.type(node) == 'app' && _.type(node.children[0]) == 'abs';
    },

    // a pre-order walk, calling fn(node, depth) on each, depth is number of enclosing abs.
    // to break the walk, have fn return truthy
    walk: function(node, fn, depth) {
      depth = depth || 0;
      if (_.type(node) == 'abs') depth++;

      if (fn(node, depth)) return true;

      if (node.children) {
        for (var n, i = 0; n = node.children[i++];) {
          if (_.walk(n, fn, depth)) return true;
        }
      }
    },

    // finds free vars beneath node and applies a delta
    rescopeVars: function(node, delta) {
      _.walk(node, function(n, depth) {
        if (_.type(n) == 'var' && +n.name > depth) {
          n.name = "" + (+n.name + delta) ;
        }
      });
    },

    // returns the abs node that matches the current var node
    matchingAbs: function(vari) {
      var depth = +vari.name, cur = vari;
      while (depth > 0 && cur.parent) {
        cur = cur.parent;
        if (_.type(cur) == 'abs') depth--;
      }
      return cur;
    },

    // finds var nodes that the abs node and calls fn(var_node) on each
    forMatchingVars: function(abs, fn) {

      _.walk(abs, function(n, depth) {
        if (_.type(n) == 'var' && depth == +n.name) {
          fn(n, n.parent.children.indexOf(n), depth);
        }
      });
    },

    // replaces vars that match the given abs with copies of arg
    substitute: function(abs, arg) {
      var depth = 0;

      _.forMatchingVars(abs, function(n, i, depth) {
        var argcopy = copy(arg);

        _.rescopeVars(argcopy, depth);

        // copying the replaced id makes d3 transition root node instead of replace
        // if (config.copyId) argcopy.id = n.id;

        n.parent.children[i] = argcopy;
      });
    },

    // removes an app/abs/arg trio and re-links the abs' children
    // node should be a reducible app, and its abs shouldnt have vars (already subbed)
    popOff: function(node) {
      var abs = node.children[0],
          next = abs.children[0];
      _.rescopeVars(abs, -1);
      next.parent = node.parent;
      if (next.parent) {
        var sibs = node.parent.children;
        sibs[sibs.indexOf(node)] = next;
      }
      return next;
    },

    // reduce node, which must be an app with an abs for a left child
    doReduction: function(node) {
      // not an application onto an abs
      if (!isReducible(node)) return false;

      var abs = node.children[0],
          arg = node.children[1];
      
      _.substitute(abs, arg);
      _.popOff(node);

      return true;
    },

    findReducible: function(node) {
      var ret = null;
      _.walk(node, function(n) {
        if (_.isReducible(n)) {
          ret = n;
          return true; // break walk
        }
      });
      return ret;
    },

    // recursively reduces a tree rooted on node until it cant be reduced anymore
    evaluate: function(node) {
      var n = _.getReducible(node);
      if (n) {
        _.doReduction(n);
        return _.evaluate(node);
      }
      return false;
    },

    // returns tree in de'brujin index format
    brujin: function (node) {
      var tn = _.type(node);
      if (tn == 'app') {
        return '(' + _.brujin(node.children[0]) + ' ' + _.brujin(node.children[1]) + ')';
      } else if (tn == 'abs') {
        return "#" + _.brujin(node.children[0]);
      } else {
        return node.name;
      }
    },

    parseBrujin: function (str) {
      return parser.parse(str);
    },

    cloneTree: function (node) {
      return copy(node);
    }

  });

  // deep copy that ignores some keys *
  function copy(object) {
    return Array.isArray(object) ? copy_array(object)
         : typeof object == 'object' ? copy_obj(object)
         : /* by value */   object
  }
   
  function copy_obj(object) {
    // * the keys to ignore
    var ignore = {'parent':1, 'id':1}

    var result = _.clone(object);
    _.keys(object).forEach(function(key) {
      result[key] = key in ignore ? null : copy(object[key])
    });
 
    return result
  }

  function copy_array(object) {
    return _(object).map(function(value) {
      return copy(value) });
  }

})();
