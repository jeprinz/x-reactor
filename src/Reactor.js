// @flow

import type {TwoWayMap} from './TwoWayMap';
import {makeTwoWayMap} from './TwoWayMap';
import {is} from 'immutable';
import type {MultiMap} from './MultiMap';
import {makeMultiMap} from './MultiMap';

type XVar<T>  = {
  get: () => T,
  onUpdate: (callback: () => void) => void,
  set: (() => T) => void,
}

type XImplVar<T>  = XVar<T> & {
  reset: () => void
}

export type Reactor = {
  xvar: <T> (func: () => T) => XVar<T>
}

function makeReactor(): Reactor{

  //value depends on key (when key is updated, value needs to be updated)
  const dependencies: TwoWayMap<XImplVar<any>, XImplVar<any>> = makeTwoWayMap();

  var blackMagic: bool = false;
  var referenced: Set<XImplVar<any>> = new Set();

  return {
    xvar: function<T>(func: () => T): XVar<T>{
      var value: T = func();
      const callbacks: Set<()=>void> = new Set();
      function reset(alwaysDoReset){
        const oldVal = value;
        blackMagic = true;//Black magic
        value = func();
        blackMagic = false;//End black magic

        if (!is(value, oldVal) || alwaysDoReset){
          dependencies.deleteValue(ret);//get rid of old dependencies
          for (const value of referenced){
            dependencies.set(value, ret);//add each new dependency
          }

          callbacks.forEach((callback) => callback());
          for (const xvar of dependencies.getFromKey(ret)){
            xvar.reset();
          }
        }

        referenced = new Set();//Clean up the entrails
      }
      const ret = {
        get: function(){
          if (blackMagic){
            referenced.add(ret);
          }
          return value;
        },
        onUpdate: function(callback){
          callbacks.add(callback);
        },
        set: function(newFunc){
          func = newFunc;
          reset()
        },
        reset
      }
      //this has to run after everything else
      reset(true);//make sure it collects dependencies at the start
      return ret;
    }
  }
}

export const xvar = makeReactor().xvar
