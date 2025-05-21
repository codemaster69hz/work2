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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Products_1 = require("../entities/Products");
const ProductInput_1 = require("../inputs/ProductInput");
const Category_1 = require("../entities/Category");
const Company_1 = require("../entities/Company");
const ProductVar_1 = require("../entities/ProductVar");
const slugify_1 = __importDefault(require("slugify"));
const Reviews_1 = require("../entities/Reviews");
let ProductResolver = class ProductResolver {
    async myProducts({ em, req }) {
        if (!req.session.companyId) {
            throw new Error("Not authenticated");
        }
        return await em.find(Products_1.Product, { company: req.session.companyId }, {
            populate: ['reviews', 'variations']
        });
    }
    async getSimilarProducts(category, productId, { em }) {
        const categoryEntity = await em.findOne(Category_1.Category, { name: category });
        if (!categoryEntity) {
            throw new Error(`Category "${category}" not found.`);
        }
        return await em.find(Products_1.Product, {
            category: categoryEntity.id,
            id: { $ne: productId },
        });
    }
    async allProducts({ em }, categoryId, minPrice, maxPrice, material) {
        const filters = {};
        if (categoryId)
            filters.category = categoryId;
        if (minPrice || maxPrice) {
            filters.price = {};
            if (minPrice)
                filters.price["$gte"] = minPrice;
            if (maxPrice)
                filters.price["$lte"] = maxPrice;
        }
        if (material)
            filters.material = material;
        return await em.find(Products_1.Product, filters, { populate: ["variations", "category"] });
    }
    async getMaterials({ em }, material) {
        const findm = {};
        if (material)
            findm.material = material;
        return em.find(Products_1.Product, findm, { populate: ["variations"] });
    }
    async updateProducts(id, input, { em, req }) {
        if (!req.session.userId) {
            throw new Error("Not authenticated");
        }
        const updateProduct = await em.findOne(Products_1.Product, { id });
        if (!updateProduct) {
            throw new Error("Product not found");
        }
        em.assign(updateProduct, input);
        await em.flush();
        return updateProduct;
    }
    async filteredProducts(search, categoryId, material, minPrice, maxPrice, { em }) {
        const filters = {};
        if (search)
            filters.name = { $ilike: `%${search}%` };
        if (categoryId)
            filters.category = categoryId;
        if (material)
            filters.material = material;
        if (minPrice !== undefined || maxPrice !== undefined) {
            filters.price = {};
            if (minPrice !== undefined)
                filters.price["$gte"] = minPrice;
            if (maxPrice !== undefined)
                filters.price["$lte"] = maxPrice;
        }
        return await em.find(Products_1.Product, filters, { populate: ["category"] });
    }
    async topRatedProducts(limit, { em }) {
        return em.find(Products_1.Product, {}, {
            orderBy: { averageRating: "DESC" },
            limit,
            populate: ["reviews"]
        });
    }
    async createProduct(input, { em, req }) {
        if (!req.session.companyId) {
            throw new Error("Not authenticated");
        }
        const company = await em.findOne(Company_1.Company, { id: req.session.companyId });
        if (!company) {
            throw new Error("Company not found");
        }
        const category = await em.findOne(Category_1.Category, { id: input.category });
        if (!category)
            throw new Error("Category not found");
        const slug = (0, slugify_1.default)(input.name, { lower: true, strict: true });
        const product = em.create(Products_1.Product, Object.assign(Object.assign({}, input), { category,
            company,
            slug, averageRating: 0, reviewCount: 0, variations: [], createdAt: new Date(), updatedAt: new Date() }));
        await em.persistAndFlush(product);
        if (input.variations) {
            for (const variationInput of input.variations) {
                const variationSlug = (0, slugify_1.default)(`${product.slug}-${variationInput.size}-${variationInput.color}`, { lower: true, strict: true });
                const variation = em.create(ProductVar_1.ProductVariation, Object.assign(Object.assign({}, variationInput), { product, createdAt: new Date(), updatedAt: new Date(), productId: product.id, slug: variationSlug, name: product.name, description: product.description, material: product.material }));
                await em.persistAndFlush(variation);
            }
        }
        return product;
    }
    async reviews(product, { em }) {
        await em.populate(product, ["reviews"]);
        return product.reviews;
    }
    async productBySlug(slug, { em }) {
        return await em.findOne(Products_1.Product, { slug }, { populate: ["variations", "category", 'reviews.user', 'company.cname'] });
    }
    async productsByCategory(name, { em }) {
        const category = await em.findOne(Category_1.Category, { name });
        if (!category)
            throw new Error("Category not found");
        return em.find(Products_1.Product, { category: category.id }, { populate: ["variations", "category"] });
    }
};
exports.ProductResolver = ProductResolver;
__decorate([
    (0, type_graphql_1.Query)(() => [Products_1.Product]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "myProducts", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Products_1.Product]),
    __param(0, (0, type_graphql_1.Arg)("category")),
    __param(1, (0, type_graphql_1.Arg)("productId")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "getSimilarProducts", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Products_1.Product]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("category", { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)("minPrice", { nullable: true })),
    __param(3, (0, type_graphql_1.Arg)("maxPrice", { nullable: true })),
    __param(4, (0, type_graphql_1.Arg)("material", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number, String]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "allProducts", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Products_1.Product]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("material", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "getMaterials", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Products_1.Product),
    __param(0, (0, type_graphql_1.Arg)("productid")),
    __param(1, (0, type_graphql_1.Arg)("input", () => ProductInput_1.UpdateProductFields)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ProductInput_1.UpdateProductFields, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "updateProducts", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Products_1.Product]),
    __param(0, (0, type_graphql_1.Arg)("search", { nullable: true })),
    __param(1, (0, type_graphql_1.Arg)("category", { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)("material", { nullable: true })),
    __param(3, (0, type_graphql_1.Arg)("minPrice", { nullable: true })),
    __param(4, (0, type_graphql_1.Arg)("maxPrice", { nullable: true })),
    __param(5, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "filteredProducts", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Products_1.Product]),
    __param(0, (0, type_graphql_1.Arg)("limit", () => type_graphql_1.Int, { defaultValue: 5 })),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "topRatedProducts", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Products_1.Product),
    __param(0, (0, type_graphql_1.Arg)("input", () => ProductInput_1.ProductInput)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ProductInput_1.ProductInput, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "createProduct", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => [Reviews_1.Review]),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Products_1.Product, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "reviews", null);
__decorate([
    (0, type_graphql_1.Query)(() => Products_1.Product, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("slug")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "productBySlug", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Products_1.Product]),
    __param(0, (0, type_graphql_1.Arg)("name")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "productsByCategory", null);
exports.ProductResolver = ProductResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => Products_1.Product)
], ProductResolver);
//# sourceMappingURL=products.js.map