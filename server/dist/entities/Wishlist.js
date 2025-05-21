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
exports.SavedProduct = void 0;
const core_1 = require("@mikro-orm/core");
const type_graphql_1 = require("type-graphql");
const User_1 = require("./User");
const Products_1 = require("./Products");
let SavedProduct = class SavedProduct {
    constructor() {
        this.createdAt = new Date();
    }
};
exports.SavedProduct = SavedProduct;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", Number)
], SavedProduct.prototype, "id", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => User_1.User),
    __metadata("design:type", User_1.User)
], SavedProduct.prototype, "user", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => Products_1.Product),
    __metadata("design:type", Products_1.Product)
], SavedProduct.prototype, "product", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date),
    (0, core_1.Property)(),
    __metadata("design:type", Date)
], SavedProduct.prototype, "createdAt", void 0);
exports.SavedProduct = SavedProduct = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, core_1.Entity)(),
    (0, core_1.Unique)({ properties: ["user", "product"] })
], SavedProduct);
//# sourceMappingURL=Wishlist.js.map