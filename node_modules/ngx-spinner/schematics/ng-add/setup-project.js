"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const schematics_1 = require("@angular-devkit/schematics");
const workspace_1 = require("@schematics/angular/utility/workspace");
const schematics_2 = require("@angular/cdk/schematics");
/** Name of the ngx-spinner module */
const spinnerModuleName = 'NgxSpinnerModule';
function default_1(options) {
    return (host, _context) => __awaiter(this, void 0, void 0, function* () {
        const workspace = yield (0, workspace_1.getWorkspace)(host);
        const project = (0, schematics_2.getProjectFromWorkspace)(workspace, options.project);
        if (project.extensions.projectType === 'application') {
            return (0, schematics_1.chain)([
                addSpinnerModule(options),
            ]);
        }
        return host;
    });
}
function addSpinnerModule(options) {
    return (host, _context) => __awaiter(this, void 0, void 0, function* () {
        const workspace = yield (0, workspace_1.getWorkspace)(host);
        const project = (0, schematics_2.getProjectFromWorkspace)(workspace, options.project);
        const appModulePath = (0, schematics_2.getAppModulePath)(host, (0, schematics_2.getProjectMainFile)(project));
        if (!(0, schematics_2.hasNgModuleImport)(host, appModulePath, spinnerModuleName)) {
            (0, schematics_2.addModuleImportToRootModule)(host, spinnerModuleName, 'ngx-spinner', project);
        }
        return host;
    });
}
//# sourceMappingURL=setup-project.js.map