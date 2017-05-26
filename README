#X-Reactor - simple reactive programming

X-Reactor exports a single function, 'xvar'

'x-var' creates reactive variables which behave like cells in a spreadsheet:
They can depend on other x-vars, and will automatically update their values
when their dependencies change.

```javascript
var a = xvar(() => 1);
var b = xvar(() => 2);
var c = xvar(() => a.xget() + b.xget());// c = a+b

console.log(c.get());//3

//but now, lets change a
a.set(() => 5);

//and c is automatically updated
console.log(c.get());//7
```

x-reactor accomplishes the same thing as other reactive
programming/stream programming frameworks, but with a simpler interface.
This is enabled because x-reactor can automatically figure out the
dependencies of a given x-var without the programmer needing to list them
explicitly.
