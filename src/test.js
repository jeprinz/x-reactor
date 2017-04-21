//@flow

import {xvar} from './Reactor';

const a = xvar(() => 5);
const b = xvar(() => 6);

const c = xvar(() => a.get() + b.get());
c.onUpdate(() => console.log('c updated'));

console.log(c.get());

a.set(() => 1);
a.set(() => 1);

console.log(c.get());
