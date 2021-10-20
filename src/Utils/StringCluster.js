/* eslint-disable no-use-before-define */
export class StringCluster {
    constructor(strList) {
        this.map = new Map();
        this.map.set('root', strList);

        this.clustered = this.createSubMap(this.map);

        // console.log(nameMap);
        this.arranged = arrange(this.clustered);
    }

    createSubMap(map) {
        for (const [key, value] of map) {
        // console.log(key + " = " + value);
            const subMap = new Map();

            if (Array.isArray(value)) {
                value.forEach((name) => {
                    const firstChar = name[0];
                    const oldList = subMap.get(firstChar) || []; // split the string as the first character and the rest
                    const rest = name.substr(1);
                    // console.log(firstChar, rest);

                    if (rest !== undefined) {
                        if (rest.length > 1) oldList.push(rest);
                    }

                    subMap.set(firstChar, oldList);
                });
            }

            // console.log("aaa", subMap);

            // if child is an array consisting one child, destruct the array
            for (const [key2, value2] of subMap) {
                // console.log(key + " = " + value + "  " + Array.isArray(value));
                if (value2.length === 1) subMap.set(key2, value2[0]);
            }

            // console.log(getFirstValueofMap(subMap));

            // if there is a single child, then terminate creating sub children
            if (subMap.size > 1 || getFirstValueofMap(subMap).value.length > 1) {
                map.set(key, subMap);
                this.createSubMap(subMap);
            }
        // else map.set(key, value);
        }

        return map;
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

function arrange(map) {
    const newMap = new Map(map);

    for (const [key, value] of map) {
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
