import { Resolver, Query, Ctx, Arg, Mutation, Int, FieldResolver, Root } from "type-graphql";
import { MyContext } from "../types";
import { Product } from "../entities/Products";
import { ProductInput, UpdateProductFields } from "../inputs/ProductInput";
import { Category } from "../entities/Category";
import { Company } from "../entities/Company";
import { ProductVariation } from "../entities/ProductVar";
import slugify from "slugify";
import { Review } from "../entities/Reviews";

@Resolver(()=> Product)
export class ProductResolver {
  @Query(() => [Product])
  async myProducts(@Ctx() { em, req }: MyContext): Promise<Product[]> {
    if (!req.session.companyId) {
      throw new Error("Not authenticated");
    }
    return await em.find(Product, { company: req.session.companyId }, {
      populate: ['reviews', 'variations']
    });
  }

  @Query(() => [Product])
  async getSimilarProducts(
    @Arg("category") category: string,
    @Arg("productId") productId: string,
    @Ctx() { em }: MyContext
  ): Promise<Product[]> {
    const categoryEntity = await em.findOne(Category, { name: category });
    if (!categoryEntity) {
      throw new Error(`Category "${category}" not found.`);
    }
    return await em.find(Product, {
      category: categoryEntity.id,
      id: { $ne: productId },
    });
  }

  @Query(() => [Product])
  async allProducts(
    @Ctx() { em }: MyContext,
    @Arg("category", { nullable: true }) categoryId?: string,
    @Arg("minPrice", { nullable: true }) minPrice?: number,
    @Arg("maxPrice", { nullable: true }) maxPrice?: number,
    @Arg("material", { nullable: true }) material?: string
  ): Promise<Product[]> {
    const filters: any = {};
    if (categoryId) filters.category = categoryId;
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price["$gte"] = minPrice;
      if (maxPrice) filters.price["$lte"] = maxPrice;
    }
    if (material) filters.material = material;

    return await em.find(Product, filters, { populate: ["variations", "category"] });
  }

  @Query(() => [Product])
  async getMaterials(
    @Ctx() { em }: MyContext,
    @Arg("material", { nullable: true }) material?: string
  ): Promise<Product[]> {
    const findm: any = {};
    if (material) findm.material = material;
    return em.find(Product, findm, { populate: ["variations"] });
  }

  @Mutation(()=> Product)
  async updateProducts(
    @Arg("productid") id :string,
    @Arg("input", () => UpdateProductFields) input: UpdateProductFields,
    @Ctx() { em,req }: MyContext 
  ): Promise<Product> {
    if (!req.session.userId) {
      throw new Error("Not authenticated");
    }

    const updateProduct = await em.findOne(Product, { id });
    if (!updateProduct) {
      throw new Error("Product not found");
    } 

    em.assign(updateProduct, input);
    await em.flush();
    return updateProduct;
  }

  @Query(() => [Product])
  async filteredProducts(
    @Arg("search", { nullable: true }) search: string,
    @Arg("category", { nullable: true }) categoryId: string,
    @Arg("material", { nullable: true }) material: string,
    @Arg("minPrice", { nullable: true }) minPrice: number,
    @Arg("maxPrice", { nullable: true }) maxPrice: number,
    @Ctx() { em }: MyContext
  ): Promise<Product[]> {
    const filters: any = {};

    if (search) filters.name = { $ilike: `%${search}%` }; // PostgreSQL case-insensitive search
    if (categoryId) filters.category = categoryId;
    if (material) filters.material = material;
    if (minPrice !== undefined || maxPrice !== undefined) {
      filters.price = {};
      if (minPrice !== undefined) filters.price["$gte"] = minPrice;
      if (maxPrice !== undefined) filters.price["$lte"] = maxPrice;
    }

    return await em.find(Product, filters, { populate: ["category"] });
  }

  @Query(() => [Product])
  async topRatedProducts(
    @Arg("limit", () => Int, { defaultValue: 5 }) limit: number,
    @Ctx() { em }: MyContext
  ): Promise<Product[]> {
    return em.find(
      Product,
      {},
      {
        orderBy: { averageRating: "DESC" },
        limit,
        populate: ["reviews"]
      }
    );
  }

  @Mutation(() => Product)
  async createProduct(
    @Arg("input", () => ProductInput) input: ProductInput,
    @Ctx() { em, req }: MyContext
  ): Promise<Product> {
    if (!req.session.companyId) {
      throw new Error("Not authenticated");
    }

    const company = await em.findOne(Company, { id: req.session.companyId });
    if (!company) {
      throw new Error("Company not found");
    }

    const category = await em.findOne(Category, { id: input.category });
    if (!category) throw new Error("Category not found");

    const slug = slugify(input.name, { lower: true, strict: true });

    const product = em.create(Product, {
      ...input,
      category,
      company,
      slug,
      averageRating: 0,
      reviewCount: 0,
      variations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await em.persistAndFlush(product);

    // Now create variations with slugs based on product slug
    if (input.variations) {
      for (const variationInput of input.variations) {
        // Slug for variation: base product slug + size + color
        const variationSlug = slugify(
          `${product.slug}-${variationInput.size}-${variationInput.color}`,
          { lower: true, strict: true }
        );

        const variation = em.create(ProductVariation, {
          ...variationInput,
          product,
          createdAt: new Date(),
          updatedAt: new Date(),
          productId: product.id,
          slug: variationSlug,  // Use variation-specific slug
          name: product.name,   // Inherit product name
          description: product.description,  // Inherit product description
          material: product.material,  // Inherit product material
        });
        await em.persistAndFlush(variation);
      }
    }

    return product;
  }

  @FieldResolver(() => [Review])
  async reviews(@Root() product: Product, @Ctx() { em }: MyContext) {
    await em.populate(product, ["reviews"]);
    return product.reviews;
  }

  @Query(() => Product, { nullable: true })
  async productBySlug(
    @Arg("slug") slug: string,
    @Ctx() { em }: MyContext
  ): Promise<Product | null> {
    return await em.findOne(Product, { slug }, { populate: ["variations", "category", 'reviews.user','company.cname'] });
  }

  @Query(() => [Product])
  async productsByCategory(
    @Arg("name") name: string,
    @Ctx() { em }: MyContext
  ): Promise<Product[]> {
    const category = await em.findOne(Category, { name });

    if (!category) throw new Error("Category not found");

    return em.find(Product, { category: category.id }, { populate: ["variations", "category"] });
  }
}
