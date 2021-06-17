export class StringCluster {
    constructor(str_list) {
      this.map = new Map();
      this.map.set("root", str_list);
  
      this.clustered = this.createSubMap(this.map);
  
      // console.log(nameMap);
      this.arranged = arrange(this.clustered);
    }
  
    createSubMap(map) {
      for (let [key, value] of map) {
        // console.log(key + " = " + value);
        let subMap = new Map();
  
        if (Array.isArray(value)) {
          value.forEach((name) => {
            var firstChar = name[0];
            var oldList = subMap.get(firstChar) || []; // split the string as the first character and the rest
            var rest = name.substr(1);
            //console.log(firstChar, rest);
  
            if (rest !== undefined) {
              if (rest.length > 1) oldList.push(rest);
            }
  
            subMap.set(firstChar, oldList);
          });
        }
  
        //console.log("aaa", subMap);
  
        // if child is an array consisting one child, destruct the array
        for (let [key, value] of subMap) {
          // console.log(key + " = " + value + "  " + Array.isArray(value));
          if (value.length == 1) subMap.set(key, value[0]);
        }
  
        //console.log(getFirstValueofMap(subMap));
  
        // if there is a single child, then terminate creating sub children
        if (subMap.size > 1 || getFirstValueofMap(subMap).value.length > 1) {
          map.set(key, subMap);
          this.createSubMap(subMap);
        }
        //else map.set(key, value);
      }
  
      return map;
    }
  }
  
  function getFirstValueofMap(map) {
    var key, value;
  
    if (map.size == 1) {
      map.forEach((val, ke) => {
        value = val;
        key = ke;
      });
    }
  
    if (typeof value === "undefined") return { key: 0, value: [] };
  
    return { value: value, key: key };
  }
  
  function getKeyValue(map) {
    var key, value;
  
    if (map.size == 1) {
      map.forEach((val, ke) => {
        value = val;
        key = ke;
      });
    }
  
    if (typeof value === "undefined") return { key: 0, value: [] };
  
    return { value: value, key: key };
  }
  
  function arrange(map) {
    let newMap = new Map(map);
  
    for (let [key, value] of map) {
      if (value instanceof Map) {
        let returned = arrange(value);
  
        if (returned.size === 1 && key !== "root") {
          newMap.delete(key);
          newMap.set(
            key + getKeyValue(returned).key,
            getKeyValue(returned).value
          );
        } else newMap.set(key, returned);
      }
    }
  
    return newMap;
  }


  