
prim = term
term = app / abs / vari / paren
name = name:[a-zA-Z0-9]+ { return name.join(''); }
vari = sym:name { return { "name": sym }; }
abs = "#" sym:name "." body:term { return { "name": "#" + sym, "children": [body] }; }
app = "(" func:term " " arg:term ")" { return { "name": "@", "children": [func, arg] }; }
paren = "(" ab:abs ")" { return ab; }
