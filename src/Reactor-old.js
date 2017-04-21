// @flow

import type {TwoWayMap} from './TwoWayMap';
import {makeTwoWayMap} from './TwoWayMap';
import {is} from 'immutable';
import type {MultiMap} from './MultiMap';
import {makeMultiMap} from './MultiMap';

export type XVar<T>  = {
  get: () => T,
  onUpdate: (callback: () => void) => void,
}

export type Reactor = {
  xvar: <T> (func: () => T) => XVar<T>
}

function makeReactor(): Reactor{
  const variables: Map<Symbol, XVar<any>> = new Map();
  const keyDependsOnValue: TwoWayMap<Symbol, Symbol> = makeTwoWayMap();
  var referenced: Set<Symbol> = new Set();
  var runningMagic = false;
  const callBacks: MultiMap<Symbol, () => void> = makeMultiMap();

  return {
    xvar: function<T> (func: () => T): XVar<T>{
      return {
        get: function(){
          return func();
        },
        onUpdate: function(callback){

        }
      }
    }
  }
}

type Variable = {
  value: any,
  func: () => any
}

const startValueMagic = Symbol();

function makeHandler(): any{
  const variables: Map<string, Variable> = new Map();
  const keyDependsOnValue: TwoWayMap<string, string> = makeTwoWayMap();
  var referenced: Set<string> = new Set();
  var runningMagic = false;
  const callBacks: MultiMap<string, () => void> = makeMultiMap();

  function setup(prop: string, func: () => any): void{
    keyDependsOnValue.deleteKey(prop);

    runningMagic = true;
    referenced = new Set();
    variables.set(prop, {func, value: func()});
    for (const dependency of referenced){//TODO: make a setAll method in TwoWayMap
      keyDependsOnValue.set(prop, dependency);
    }
    runningMagic = false;

    redo(prop, true);
  }

  function redo(prop: string, alwaysDo: bool): void{
    const variable = variables.get(prop);
    if (variable){
      const old = variable.value;
      variable.value = variable.func();

      if (!is(old, variable.value) || alwaysDo){
        for (const callback of callBacks.get(prop)){
          callback();
        }

        const dependsOnMe = keyDependsOnValue.getFromValue(prop);
        for (const dependency of dependsOnMe){//update everybody that depended on me
          redo(dependency, false);
        }
      }

    } else {
      throw Error("Something went wrong, variable was undefined");
    }
  }

  const handler = {
    get: function(target, name){
      if (name === "onUpdate"){
        return function(name, callback){
          callBacks.set(name, callback);
        }
      }
      if (runningMagic){
        referenced.add(name);
      }
      const variable = variables.get(name);
      if (variable){
        return variable.value;
      } else {
        throw Error("invalid variable name " + name);
      }
    },
    set: function(obj, prop, val){
      if (typeof prop !== "string"){
        throw Error("Reactor variables should be referenced with a string or Symbol");
      }
      if (typeof val !== "function"){
        throw Error("Reactor variables should be set to functions");
      }
      setup(prop, val);
      return true;
    }
  }
  return handler;
}

export function makeReactor(){
  return new Proxy({}, makeHandler());
}
