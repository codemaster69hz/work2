"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = void 0;
const core_1 = require("@mikro-orm/core");
const type_graphql_1 = require("type-graphql");
let Admin = class Admin {
    constructor() {
        this.id = crypto.randomUUID();
    }
};
exports.Admin = Admin;
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.PrimaryKey)({ type: "uuid" }),
    __metadata("design:type", String)
], Admin.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ type: "text", unique: true }),
    __metadata("design:type", String)
], Admin.prototype, "username", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ type: "text", unique: true }),
    __metadata("design:type", String)
], Admin.prototype, "email", void 0);
__decorate([
    (0, core_1.Property)({ type: "text" }),
    __metadata("design:type", String)
], Admin.prototype, "password", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ default: false }),
    __metadata("design:type", Boolean)
], Admin.prototype, "isEmailVerified", void 0);
exports.Admin = Admin = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, core_1.Entity)()
], Admin);
//# sourceMappingURL=Admin.js.map