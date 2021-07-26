import {File} from '../File'
import { Panel } from '../Panel';

export class Cluster{
  constructor(name, children){
    this.name = name;
    this.children = children;
  }
}

export class FileCluster {
    constructor(file_list) {
  
        this.file_list = file_list;

        this.map = new Map();
        this.map.set("root", File.getNameList(file_list));
  
        this.clustered = this.createSubMap(this.map);

        this.arranged = arrange(this.clustered);
        console.log(this.arranged)
        this.arranged = arrange2(this.arranged);
        this.assignFiles(this.arranged, '');
        
        this.listed = convertMapToList(this.arranged);
        this.listed = generateRootClusters(this.listed)[0];
    }
  
    createSubMap(map) {

      function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      }

      function getNumberSeries(str) {
        let index = 0;
        while (isNumeric(str[index++]));
        return str.slice(0, index - 1);
      }

      for (let [key, value] of map) {
        // console.log(key + " = " + value);
        let subMap = new Map();
  
        if (Array.isArray(value)) {
          value.forEach((name) => {
            var key = name[0];

            if(isNumeric(key))
              key = getNumberSeries(name);
            
            var oldList = subMap.get(key) || []; // split the string as the first character and the rest
            var rest = name.substr(key.length);
            //console.log(key, rest);
  
            if (rest !== undefined) {
              if (rest.length > 1) oldList.push(rest);
            }
  
            subMap.set(key, oldList);
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

    // assign filename with the exact File Object
    assignFiles(map, prefix){

        for (let [key, value] of map) {
            
            if(value instanceof Map)
            {
                if(key == "root")
                    this.assignFiles(value, '')
                else
                    this.assignFiles(value, prefix + key)
    
                // console.log(key);
            }
            else
            {
                let filename = prefix + key + value;
                let found = this.file_list.find(it => it.name == filename)
                // console.log(filename, found);

                map.set(key, found);
            }
        }
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
  
  // combine the keys if it has only one child
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

  // do not cluster if the common part less than 3 characters
  // works only for clusters under root level
  function arrange2(map) {

    let firstLevel = map.get("root");

    for (let [key, value] of firstLevel) 
    {
      if(key.length < 3){
        if(value instanceof Map)
        {
          for (let [key2, value2] of value){
            firstLevel.set(
              key + key2, value2
            );
          }
        }
        else if(value instanceof String || typeof value === 'string')
        {
          firstLevel.set(
            key + value, ""
            );
        }    
        
        firstLevel.delete(key);
      }
    }

    return map;
  }



  // convert map based clusters to list based one
  function convertMapToList(map){
    let list = [];

    for (let [key, value] of map) {
          
      if(value instanceof Map)
      {
        list.push(new Cluster(key, convertMapToList(value)));
      }
      else
      {
        list.push(value)
      }

    };

    return list;
  }

  function generateRootClusters(lst){
    let pre = 0, next = 0, cluster_no =1;
    let list_new = [];
    let list = lst[0].children;

    while(next < list.length){
      while((list[next] instanceof Cluster || list[next] instanceof Panel) && next < list.length)
      {
        list_new.push(list[next]);
        next++;
        pre = next;
      }

      while(!(list[next] instanceof Cluster || list[next] instanceof Panel) && next < list.length)
        next++;

      if(next > pre)
      {    
        let temp = list.slice(pre, next);
        list_new.push(new Cluster('cluster_' + cluster_no++, temp));
      }
    }

    lst[0].children = list_new;
    return lst;
    // return new Cluster("root", list_new);
  }


  