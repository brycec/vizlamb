
lexp =  vari / abs / app / paren

name = n:[0-9]+ { return n.join(''); }
vari = sym:name { return { "name": sym }; }

abs = "#" body:lexp { return { "name": "#", "children": [body] }; }

app = "(" func:lexp _ arg:lexp ")" { return { "name": "@", "children": [func, arg] }; }

paren = "(" l:abs ")" { return l; }

_ = [ \t\n\r]+