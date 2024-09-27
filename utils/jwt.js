const authenticateProvider = (app) => {
  app.decorate("authenticate", async (req, res) => {
    try {
      await req.jwtVerify();
    } catch (error) {
      res.send(error);
    }
  });
};

export default authenticateProvider;
