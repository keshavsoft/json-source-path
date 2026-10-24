import { findByRole } from "json-transformer-funcs";

const resolveParent = (registry, path) => {
    const root = path.dataRole
        ? findByRole(registry[path.fileName], path.dataRole)
        : registry[path.fileName];

    // console.log("root : ", root);

    const keys = [...(path.filePath ?? [])];
    const key = keys.pop();
    const parent = keys.reduce((current, nextKey) => current[nextKey], root);
    return { parent, key };
};

export default resolveParent;
