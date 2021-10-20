/* eslint-disable no-use-before-define */
import { File } from '../File';
import { Panel } from '../Panel';

export class Cluster {
    constructor(name, children) {
        this.name = name;
        this.children = children;
    }
}

export class FileCluster {
    constructor(fileList) {
        this.fileList = fileList;

        this.map = new Map();
        this.map.set('root', File.getNameList(fileList));

        this.clustered = this.createSubMap(this.map);

        this.arranged = arrange(this.clustered);
        console.log(this.arranged);
        this.arranged = arrange2(this.arranged);
        this.assignFiles(this.arranged, '');

        this.listed = convertMapToList(this.arranged);
        [this.listed] = generateRootClusters(this.listed);
    }

    createSubMap(map) {
        function isNumeric(n) {
            return !Number.isNaN(parseFloat(n)) && Number.isFinite(n);
        }

        function getNumberSeries(str) {
            let index = 0;
            while (isNumeric(str[index++]));
            return str.slice(0, index - 1);
        }

        const iterateMapElements = (value, key) => {
        // console.log(key + " = " + value);
            const subMap = new Map();

            if (key === '.') {
                return;
            }

            if (Array.isArray(value)) {
                value.forEach((name) => {
                    let newKey = name[0];

                    if (isNumeric(key)) { newKey = getNumberSeries(name); }

                    const oldList = subMap.get(newKey) || []; // split the string as the first character and the rest
                    const rest = name.substr(newKey.length);
                    // console.log(key, rest);

                    if (rest !== undefined) {
                        // if (rest.length > 1)
                        oldList.push(rest);
                    }

                    subMap.set(newKey, oldList);
                });
            }

            // console.log("aaa", subMap);

            // if child is an array consisting one child, destruct the array
            // for (const [key2, value2] of subMap) {
            // console.log(key + " = " + value + "  " + Array.isArray(value));
            // if (value2.length === 1) subMap.set(key2, value2[0]);
            // }

            // console.log(getFirstValueofMap(subMap));

            // if there is a single child, then terminate creating sub children
            if (subMap.size > 1 || getFirstValueofMap(subMap).value.length > 1) {
                map.set(key, subMap);
                this.createSubMap(subMap);
            }
        // else map.set(key, value);
        };

        map.forEach(iterateMapElements);
        return map;
    }

    // assign filename with the exact File Object
    assignFiles(map, prefix) {
        for (const [key, value] of map) {
            if (value instanceof Map) {
                if (key === 'root') {
                    this.assignFiles(value, '');
                } else {
                    this.assignFiles(value, prefix + key);
                }

                // console.log(key);
            } else {
                const tempMap = new Map();
                value.forEach((arg) => {
                    const filename = prefix + key + arg;
                    const found = this.fileList.find(it => it.name === filename);
                    // console.log(filename, found);
                    tempMap.set(arg, found);
                });
                map.set(key, tempMap);
            }
        }
    }
}

function getFirstValueofMap(map) {
    let key; let
        value;

    if (map.size === 1) {
        map.forEach((val, ke) => {
            value = val;
            key = ke;
        });
    }

    if (typeof value === 'undefined') return { key: 0, value: [] };

    return { value, key };
}

function getKeyValue(map) {
    let key; let
        value;

    if (map.size === 1) {
        map.forEach((val, ke) => {
            value = val;
            key = ke;
        });
    }

    if (typeof value === 'undefined') return { key: 0, value: [] };

    return { value, key };
}

// combine the keys if it has only one child
function arrange(map) {
    const newMap = new Map(map);

    for (const [key, value] of map) {
        if (key === '.') console.log('bingo ', key, value);
        if (value instanceof Map) {
            const returned = arrange(value);

            if (returned.size === 1 && key !== 'root') {
                newMap.delete(key);
                newMap.set(
                    key + getKeyValue(returned).key,
                    getKeyValue(returned).value,
                );
            } else newMap.set(key, returned);
        }
    }

    return newMap;
}

// do not cluster if the common part less than 3 characters
// works only for clusters under root level
function arrange2(map) {
    const firstLevel = map.get('root');

    for (const [key, value] of firstLevel) {
        if (key.length < 3) {
            if (value instanceof Map) {
                for (const [key2, value2] of value) {
                    firstLevel.set(key + key2, value2);
                }
            } else if (value instanceof String || typeof value === 'string') {
                firstLevel.set(key + value, '');
            }

            firstLevel.delete(key);
        }
    }

    return map;
}

// convert map based clusters to list based one
function convertMapToList(map) {
    const list = [];

    for (const [key, value] of map) {
        if (value instanceof Map) {
            list.push(new Cluster(key, convertMapToList(value)));
        } else {
            list.push(value);
        }
    }

    return list;
}

function generateRootClusters(lst) {
    let pre = 0; let next = 0; let
        clusterNo = 1;
    const listNew = [];
    const list = lst[0].children;

    while (next < list.length) {
        while ((list[next] instanceof Cluster || list[next] instanceof Panel) && next < list.length) {
            listNew.push(list[next]);
            next++;
            pre = next;
        }

        while (!(list[next] instanceof Cluster || list[next] instanceof Panel) && next < list.length) { next++; }

        if (next > pre) {
            const temp = list.slice(pre, next);
            listNew.push(new Cluster(`cluster_${clusterNo++}`, temp));
        }
    }

    lst[0].children = listNew;
    return lst;
    // return new Cluster("root", listNew);
}
