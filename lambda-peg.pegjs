
{

var table = {};
function Abs(sym, body) {this.sym = sym, this.body = body}
function App(func, arg) {this.func = func, this.arg = arg}

  String.prototype.doSub = App.prototype.doSub = Abs.prototype.doSub = function (sub, name) {
    if (this instanceof String) {
      return this == name ? sub : name;
    } else {
      return this.substitute(sub, name);
    }
  };

  App.prototype.reduction = function (){
    if (Abs.prototype.isPrototypeOf(this.func)) {
      return this.func.substitute(this.arg);
    }
    if (App.prototype.isPrototypeOf(this.func)) {
      return this.func.reduction();
    }
    return "SOMETHING BAD";
  };

  App.prototype.substitute = function (sub, name) {
    var app = new App();
    app.func = this.func.doSub(sub, name);
    app.arg = this.arg.doSub(sub, name);
    return app;
  };

  Abs.prototype.substitute = function (sub, name) {
    name = name || this.sym;
    return this.body.doSub(sub, name);
  };
} 

prim = term
term = app / abs / vari / paren
name = name:[a-zA-Z0-9]+ { return name.join(''); }
vari = sym:name { return sym; }
abs = "\\" sym:vari "." body:term { return new Abs(sym, body); }
app = "(" func:term " " arg:term ")" { return new App(func, arg); }
paren = "(" ab:abs ")" { return ab; }
