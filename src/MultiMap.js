// @flow

export type MultiMap<K, V> = {
  set: (K, V) => void,
  get: (K) => Set<V>,
  delete: (K) => void
}

export function makeMultiMap<K, V>(): MultiMap<K, V>{
  const map: Map<K, Set<V>> = new Map();

  return {
    set: function(k, v){
      if(!map.has(k)){
        map.set(k, new Set());
      }
      const set = map.get(k);
      if (set){
        set.add(v);
      } else {
        throw Error("This should never happen");
      }
    },
    get: function(k){
      const res = map.get(k);
      if (res){
        return res;
      } else {
        return new Set();
      }
    },
    delete: function(k){
      map.delete(k);
    }
  }
}
