"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const tasks_1 = require("@angular-devkit/schematics/tasks");
// Just return the tree
function default_1(_options) {
    return (tree, context) => {
        const installTaskId = context.addTask(new tasks_1.NodePackageInstallTask());
        context.addTask(new tasks_1.RunSchematicTask('ng-add-setup-project', _options), [installTaskId]);
        return tree;
    };
}
//# sourceMappingURL=index.js.map