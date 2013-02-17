vizlamb
=======
################1

This is a web based tool for visualizing lambda calculus expressions. Currently, it can parse an expression and render a tree that can then be reduced. The reduction is animated and uses eager evaluation.

It uses d3.js for the animation and peg.js for the parser.

## Wish list
- A build process. Currently, just commiting the compiled parser
- Better organization. Could separate out ui, reduction engine, d3 code.
- Tests.
- Naming abstractions.
- Tree manipulation.
