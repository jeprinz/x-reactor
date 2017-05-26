//@flow

import {xvar} from './Reactor';
import type {XVar} from './Reactor';
import {List} from 'immutable';

const input: XVar<List<string>> = xvar(() => new List());
var output2 = xvar(() => new List());

console.log('setup done');

output2.set(() => input.xget().map((line) => "Line: " + line));
console.log("output2: ", output2.get());
input.set(() => {
  return new List(['a','b']);
  // return input.get().push("hey there");
});
console.log("output2: ", output2.get());
