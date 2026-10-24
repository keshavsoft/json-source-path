import toArray from "../utils/toArray.js";

export const set = (parent, key, value) => {
    parent[key] = value;
};

export const push = (parent, key, value) => {
    parent[key].push(...toArray(value));
};

export const unshift = (parent, key, value) => {
    parent[key].unshift(...toArray(value));
};
