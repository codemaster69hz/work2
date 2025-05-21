"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require('dotenv').config();
const constants_1 = require("./constants");
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const body_parser_1 = __importDefault(require("body-parser"));
require("reflect-metadata");
const postgresql_1 = require("@mikro-orm/postgresql");
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
const type_graphql_1 = require("type-graphql");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
const company_1 = require("./resolvers/company");
const express_session_1 = __importDefault(require("express-session"));
const ioredis_1 = __importDefault(require("ioredis"));
const products_1 = require("./resolvers/products");
const productvar_1 = require("./resolvers/productvar");
const category_1 = require("./resolvers/category");
const admin_1 = require("./resolvers/admin");
const cartitem_1 = require("./resolvers/cartitem");
const reviews_1 = require("./resolvers/reviews");
const useraddress_1 = require("./resolvers/useraddress");
const cors = require("cors");
const connectRedis = require('connect-redis');
async function main() {
    const orm = await postgresql_1.MikroORM.init(mikro_orm_config_1.default);
    await orm.getMigrator().up();
    const app = (0, express_1.default)();
    const redis = new ioredis_1.default();
    const RedisStore = new connectRedis(express_session_1.default);
    app.use(cors({ origin: "http://localhost:3000", credentials: true }));
    app.use((0, express_session_1.default)({
        store: new RedisStore({
            client: redis,
            prefix: 'sess:',
            ttl: 86400,
            disableTouch: true,
        }),
        name: process.env.COOKIE_NAME,
        secret: constants_1.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
        },
    }));
    const server = new server_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [user_1.UserResolver, reviews_1.ReviewResolver, useraddress_1.UserAddressResolver, post_1.PostResolver, cartitem_1.CartResolver, category_1.CategoryResolver, company_1.CompanyResolver, products_1.ProductResolver, productvar_1.ProductVariationResolver, admin_1.AdminResolver],
            validate: false,
        }),
    });
    await server.start();
    app.use('/graphql', body_parser_1.default.json(), (0, express4_1.expressMiddleware)(server, {
        context: async ({ req, res }) => ({ em: orm.em, req, res }),
    }));
    app.listen(process.env.PORT, () => {
        console.log('Server is running');
    });
}
main().catch((err) => {
    console.error(err);
});
//# sourceMappingURL=index.js.map