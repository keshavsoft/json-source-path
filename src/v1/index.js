import actions from "./actions/index.js";
import resolveParent from "./resolveParent/index.js";
import { set } from "./actions/basic.js";

const writePath = (registry, path, value) => {
    const { parent, key } = resolveParent(registry, path);
    const localAction = path.action;

    const action = actions[localAction] || set;

    action(parent, key, value);
};

export default writePath;