//@flow
import {suite, test, describe, it} from 'mocha';
import {xvar} from '../src/Reactor';
import type {XVar} from '../src/Reactor';

var assert = require('assert')

describe('get function', function(){
  it('stores values that can be retrieved by get', function(){
    const a = xvar(() => 1);
    assert(a.get() == 1);

    const value = {a: 1};
    const b = xvar(() => value);
    assert(value == b.get());
  });

  it('allows values to be set', function(){
    const a = xvar(() => 1);
    assert(a.get() == 1);
    a.set(() => 2);
    assert(a.get() == 2);
    a.set(() => 3);
    assert(a.get() == 3);
  });
})
