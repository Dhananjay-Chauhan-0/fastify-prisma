import Fastify from "fastify";
import fjwt from "@fastify/jwt";
import fastifyCors from "@fastify/cors";
import fCookie from "@fastify/cookie";

import getUsers from "../controllers/user.js";
import products from "../controllers/products.js";
import authenticateProvider from "../utils/jwt.js";

const app = Fastify({
  logger: true,
});

// cookies
app.register(fCookie, { secret: process.env.JWT_SECRET });
app.register(fastifyCors, {
  origin: "*",
  credentials: true, // allow cookies
});
app.register(fjwt, { secret: process.env.JWT_SECRET });
// Register the authenticate function
authenticateProvider(app);

app.register(getUsers, { prefix: "/user" });
app.register(products, { prefix: "/product" });

app.get("/", (req, reply) => {
  reply.send({ message: "Hello world" });
});

async function main() {
  try {
    await app.listen({ port: 8000 });
    console.log(`Server connected at http://localhost:8000 \n`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

main();

export default app;
