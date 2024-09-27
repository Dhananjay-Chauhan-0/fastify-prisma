import prisma from "../utils/prisma.js";
import bcrypt from "bcrypt";

// the register request schema
const postRegisterUserSchema = {
  body: {
    type: "object",
    required: ["email", "name", "password"],
    properties: {
      email: { type: "string", format: "email" },
      name: { type: "string" },
      password: { type: "string" },
    },
  },
  response: {
    201: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
};

// the register request schema
const postLoginUserSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string" },
        accessToken: { type: "string" },
      },
      required: ["message", "accessToken"],
    },
  },
};
const getUsers = (app, options, done) => {
  // Get all users
  app.get("/", async (req, res) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    res.status(200).send({ data: users });
  });

  //   register user
  app.post(
    "/register",
    { schema: postRegisterUserSchema },
    async (req, res) => {
      const { email, name, password } = req.body;
      const checkUserExist = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (checkUserExist) {
        res.status(409).send({
          error: "Resource already exists",
          message: "email already taken",
        });
      } else {
        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          const newUser = await prisma.user.create({
            data: {
              email,
              name,
              password: hashedPassword,
              salt: "10",
            },
          });
          res.status(201).send({ message: "user created successfully" });
        } catch (error) {
          res.status(500).send({ error: error.message });
        }
      }
    },
  );

  // login user
  app.post("/login", { schema: postLoginUserSchema }, async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
        },
      });

      if (!user) {
        return res.status(404).send({
          statusCode: 404,
          error: "Not Found",
          message: "User not found",
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).send({
          error: "Unauthorized",
          message: "Invalid email or password",
        });
      }

      const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
      };

      const token = app.jwt.sign(payload);
      // console.log(token);
      res.setCookie("access_token", token, {
        path: "/",
        domain: "localhost",
        httpOnly: true,
        secure: false,
        maxAge: 86400,
        sameSite: "Lax",
      });

      return res.status(200).send({
        message: "Login successful",
        accessToken: token,
      });
      // return { accessToken: token }
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        error: "Internal Server Error",
        message: "Failed to login",
      });
    }
  });

  app.get("/protected", { onRequest: app.authenticate }, async (req, res) => {
    try {
      return res.status(200).send({ data: req.user });
    } catch (error) {
      return res.status(500).send({ err: error });
    }
  });
  done();
};

export default getUsers;
