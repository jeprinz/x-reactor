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

var iters = 0;

function makeReactor(): Reactor{

  //value depends on key (when key is updated, value needs to be updated)
  const dependencies: TwoWayMap<XImplVar<any>, XImplVar<any>> = makeTwoWayMap();

  var allowXGet = false; //only allow when defining or resetting
  var referenced: Set<XImplVar<any>> = new Set();

  return {
    xvar: function<T>(func: () => T): XVar<T>{
      //Initial setup
      allowXGet = true;
      var value: T;
      allowXGet = false;
      const callbacks: Set<()=>void> = new Set();
      function reset(){
        const oldVal = value;
        allowXGet = true;//Black magic
        value = func();//'referenced' is modified here
        allowXGet = false;//Black magic

        //TODO: make this more efficient than deleting all these things each time
        //TODO: do this by creating 'quick comparison Set' for referenced using hashes
        //redo dependencies whether or not value changed
        dependencies.deleteValue(ret);//get rid of old dependencies
        for (const value of referenced){
          dependencies.set(value, ret);//add each new dependency
        }
        referenced = new Set();//Clean up the entrails

        if (!is(value, oldVal)){
          callbacks.forEach((callback) => callback());
          const things = [];//This is the ugliest shit but I need to copy it or
                            //else the iterator will get skrewed up and cause crash
          dependencies.getFromKey(ret).forEach((elt) => things.push(elt));
          for (const xvar of things){
            allowXGet = true;
            xvar.reset();
            allowXGet = false;
          }
        }

      }
      //Define the xvar object to be returned
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
          reset()
        },
        reset
      }
      //Actually initialize a value
      //this has to run after everything else
      reset();//make sure it collects dependencies at the start
      return ret;
    }
  }
}

export const xvar = makeReactor().xvar
