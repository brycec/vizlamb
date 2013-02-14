
lexp =  vari / abs / app

name = n:[0-9]+ { return n.join(''); }
vari = sym:name { return { "name": sym }; }

abs = "#." body:term { return { "name": "#", "children": [body] }; }

app = "(" func:prim " " arg:prim ")" { return { "name": "@", "children": [func, arg] }; }


parn = l:lexp