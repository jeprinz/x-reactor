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

  it('throws when xget is called outside of constructor or setter', () => {
    const a = xvar(() => 0);
    try {
      a.xget();
      assert(false);
    } catch (e){
    }
  })

  it('changes value of one xvar that depends on another', () => {
    const a = xvar(() => 5);
    const b = xvar(() => a.xget() + 1);
    assert(b.get() == 6);

    a.set(() => 0);
    assert(b.get() == 1);
  });

  it('changes value of depending xvar when set is used', () => {
    const a = xvar(() => 0);
    const b = xvar(() => 1);

    b.set(() => a.xget());
    assert(b.get() == 0);

    a.set(() => 2);
    assert(b.get() == 2);
  })

  it('called onUpdate registered functions when appropritate', () => {
    const a = xvar(() => 0);
    var called = 0;
    a.onUpdate(() => {called += 1});
    assert(called == 0);
    a.set(() => 1);
    assert(called = 1);
    a.set(() => 1);
    assert(called = 1);
  });

  it('deals with dependencies changing', () => {
    const a = xvar(() => 1);
    const b = xvar(() => 2);
    const c = xvar(() => true);

    const result: XVar<number> = xvar(() => {
      if (c.xget()) return a.xget(); else return b.xget();
    });

    assert(result.get() == 1);
    c.set(() => false);
    assert(result.get() == 2);

    //now add another xvar
    const d = xvar(() => 8);
    result.set(() => {
      if (c.xget()) return d.xget(); else return b.xget();
    });

    assert(result.get() == 2);
    c.set(() => true);
    assert(result.get() == 8);
    d.set(() => 7);
    assert(result.get() == 7);
  });
})
