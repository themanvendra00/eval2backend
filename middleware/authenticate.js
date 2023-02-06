const jwt = require("jsonwebtoken");
const fs = require("fs");

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.send("login again :(");
  }

  const blackList = JSON.parse(fs.readFileSync("./blacklist.json", "utf-8"));
  if (blackList.includes(token)) {
    return res.send("login again");
  }

  jwt.verify(token, "hitherefromnormaltoken", function (err, decoded) {
    if (err) {
      res.send({ message: "Please login first", error: err.message });
    } else {
      const userrole = decoded?.role;
      req.body.userrole = userrole;
      next();
    }
  });
};

module.exports = {
  authenticate,
};
