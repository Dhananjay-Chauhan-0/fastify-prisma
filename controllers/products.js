import prisma from "../utils/prisma.js";
import bcrypt from "bcrypt";

const products = (app, options, done) => {
  app.get("/", async (req, res) => {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        price: true,
        ownerId: true,
      },
    });
    res.status(200).send({ data: products });
  });

  app.post("/",{ onRequest: app.authenticate }, async (req, res) => {
    const { title, content, price } = req.body;
    
    const data = req.user;
    console.log(data);
    const ownerId = data.id;
    console.log(ownerId);
    try {
      const newProduct = await prisma.product.create({
        data: {
          title: title,
          content: content,
          price: price,
          ownerId: ownerId,
        },
      });
      
      res.status(201).send({ message: "Product added successfully" });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });

  //   edit something
  app.put("/update/:id",{ onRequest: app.authenticate }, async (req, res) => {
    const { id } = req.params;
    const { title, content, price } = req.body;
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (price) updateData.price = price;
    try {
      const existingProduct = await prisma.product.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingProduct) {
        return res.status(404).send({ message: "Product not found" });
      }

      // Update product title
      const updatedProduct = await prisma.product.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      res.status(200).send({ message: "Product detials updated successfully" });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });
  done();
};

export default products;
