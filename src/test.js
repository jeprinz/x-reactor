
import {makeReactor} from './Reactor';

const VAR = makeReactor();

VAR.a = () => 1;

VAR.b = () => 2;
  
VAR.c = () => VAR.a + VAR.b;

console.log(VAR.c)

VAR.a = () => 5;

console.log(VAR.c)
