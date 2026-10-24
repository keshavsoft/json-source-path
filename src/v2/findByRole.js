import findByRole from "./findByRole.js";

const statFunc = (node, role) => {
    if (node?.attributes?.["data-role"] === role) return node;

    for (const child of node?.children ?? []) {
        const result = findByRole(child, role);
        if (result) return result;
    }

    return null;
};

export default statFunc;
