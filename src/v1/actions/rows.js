import toArray from "../utils/toArray.js";

export const pushToRows = (parent, key, value) => {
    parent[key].forEach(row => {
        row.children.push(...structuredClone(toArray(value)));
    });
};

export const unshiftToRows = (parent, key, value) => {
    parent[key].forEach(row => {
        row.children.unshift(...structuredClone(toArray(value)));
    });
};

export const unshiftSerialToRows = (parent, key, value) => {
    parent[key].forEach((row, rowIndex) => {
        const item = structuredClone(value);
        item.textContent = rowIndex + 1;
        row.children.unshift(item);
    });
};
