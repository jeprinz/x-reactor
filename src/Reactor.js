// @flow

import type {TwoWayMap} from './TwoWayMap';
import {makeTwoWayMap} from './TwoWayMap';


function makeHandler(): any{
  const variables: Map<string, any> = new Map();
  const keyDependsOnValue: TwoWayMap<string, string> = makeTwoWayMap();
  var referenced: Set<string> = new Set();
  var runningMagic = false;

  //check who this variable depends on, and add it to those varible's dependsonme lists
  function initialSetup(prop: string, func: () => any): void{
    if (variables.has(prop)){
      keyDependsOnValue.deleteValue(prop);
    }

    runningMagic = true;
    referenced = new Set();
    variables.set(prop, func());
    for (const dependency of referenced){
      keyDependsOnValue.set() // the problem is that it needs to be a multimap
    }
    runningMagic = false;
  }

  function subsequentSet(prop: string, func: () => any): void{

  }

  const handler = {
    get: function(target, name){
      if (runningMagic){
        referenced.add(name);
        return variables.get(name);
      } else { //should I throw?
        return variables.get(name);
      }
    },
    set: function(obj, prop, val){
      if (typeof prop !== "string"){
        throw Error("Reactor variables should be referenced with a string or Symbol");
      }
      if (typeof prop !== "function"){
        throw Error("Reactor variables should be set to functions");
      }
      if (variables.has(prop)){

      } else {
        initialSetup(prop, val);
      }
    }
  }
  return handler;
}

export function makeReactor(){
  return new Proxy({}, makeHandler());
}
