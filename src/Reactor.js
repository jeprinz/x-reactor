// @flow

import type {TwoWayMap} from './TwoWayMap';
import {makeTwoWayMap} from './TwoWayMap';
import {is} from 'immutable';
import type {MultiMap} from './MultiMap';
import {makeMultiMap} from './MultiMap';

export type XVar<T>  = {
  get: () => T,
  xget: () => T,
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
  var allowXGet = false; //only allow when defining or resetting
  var referenced: Set<XImplVar<any>> = new Set();

  return {
    xvar: function<T>(func: () => T): XVar<T>{
      allowXGet = true;
      var value: T = func();
      allowXGet = false;
      const callbacks: Set<()=>void> = new Set();
      function reset(alwaysDoReset){
        const oldVal = value;
        blackMagic = true;//Black magic
        allowXGet = true;//Black magic
        value = func();
        blackMagic = false;//End black magic
        allowXGet = false;//Black magic

        if (!is(value, oldVal) || alwaysDoReset){
          dependencies.deleteValue(ret);//get rid of old dependencies
          for (const value of referenced){
            dependencies.set(value, ret);//add each new dependency
          }

          callbacks.forEach((callback) => callback());
          for (const xvar of dependencies.getFromKey(ret)){
            allowXGet = true;
            xvar.reset();
            allowXGet = false;
          }
        }

        referenced = new Set();//Clean up the entrails
      }
      const ret = {
        get: function(){
          return value;
        },
        xget: function(){
          if (allowXGet){
            referenced.add(ret);
            return value;
          } else {
            throw Error("xget can only be called from inside of xvar() or xvar.set");
          }
        },
        onUpdate: function(callback){
          callbacks.add(callback);
        },
        set: function(newFunc){
          func = newFunc;
          allowXGet = true;
          reset()
          allowXGet = false;
        },
        reset
      }
      //this has to run after everything else
      allowXGet = true;
      reset(true);//make sure it collects dependencies at the start
      allowXGet = false;
      return ret;
    }
  }
}

export const xvar = makeReactor().xvar
