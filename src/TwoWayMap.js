// @flow

//This file implements a two way multimap

import type {MultiMap} from './MultiMap';
import {makeMultiMap} from './MultiMap';

/// A two way multimap.
export type TwoWayMap<Key, Value> = {
  set: (key: Key, value: Value) => void,
  getFromKey: (key: Key) => Set<Value>,
  getFromValue: (value: Value) => Set<Key>,
  deleteKey: (key: Key) => void,
  deleteValue: (value: Value) => void
}

export function makeTwoWayMap<Key, Value>(): TwoWayMap<Key, Value>{
  const forwards: MultiMap<Key, Value> = makeMultiMap();
  const backwards: MultiMap<Value, Key> = makeMultiMap();
  function set(key, value){
    forwards.set(key, value);
    backwards.set(value, key);
  }
  function getFromKey(key){
    const res = forwards.get(key);
    if (!res){
      throw Error("Key does not exist");
    } else {
      return res;
    }
  }
  function getFromValue(value){
    const res = backwards.get(value);
    if (!res){
      throw Error("Values does not exist");
    } else {
      return res;
    }
  }
  function deleteKey(key){
    const values = forwards.get(key);
    forwards.delete(key);
    if (values){
      for (const value of values){
        const set = backwards.get(value);
        set.delete(key);
      }
    } else {
      throw Error("key does not exist");
    }
  }
  function deleteValue(value){
    const keys = backwards.get(value);
    backwards.delete(value);
    if (keys){
      for (const key of keys){
        const set = forwards.get(key);
        set.delete(value);
      }
    } else {
      throw Error("value does not exist");
    }
  }
  return {
    set, getFromKey, getFromValue, deleteKey, deleteValue
  }
}
