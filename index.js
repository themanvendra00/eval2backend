const express = require("express");
const fs = require("fs");
const { connection } = require("./config/db");
const { UserModel } = require("./model/user.model");
const { authenticate } = require("./middleware/authenticate");
const { authorise } = require("./middleware/authorize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Base API endpoint");
});

app.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    bcrypt.hash(password, 5, async (err, hash) => {
      if (err) {
        console.log(err);
      } else {
        const user = new UserModel({ name, email, password: hash, role });
        await user.save();
        res.send({message:"Signup Successfull"});
      }
    });
  } catch (error) {
    console.log("error occurred while signup");
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.find({ email });
    const hashed_pass = user[0]?.password;
    if (user) {
      bcrypt.compare(password, hashed_pass, (err, result) => {
        if (result) {
          const token = jwt.sign(
            { userID: user[0]._id, role: user[0].role },
            "hitherefromnormaltoken"
          );
          const refresh_token = jwt.sign(
            { userID: user[0]._id },
            "hitherefromrefreshtoken",
            { expiresIn: 300 }
          );
          res.send({ message: "Login Successfully", token, refresh_token });
        } else {
          res.send({error:"Invalid email and password"});
        }
      });
    } else {
      res.send({error:"404 User not found"});
    }
  } catch (error) {
    console.log("error occurred while login");
    console.log(error);
  }
});

app.get("/logout", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const blackList = JSON.parse(fs.readFileSync("./blacklist.json", "utf-8"));
  blackList.push(token);
  fs.writeFileSync("./blacklist.json", JSON.stringify(blackList));
  res.send({message:"logged out Succussfully"});
});

app.get("/goldrate", authenticate, (req, res) => {
  res.send("here are the glod rate");
});

app.get("/userstats", authorise(["manager"]), (req, res) => {
  res.send("here are the user stats");
});

app.get("/getnewtoken", (req, res) => {
  const refresh_token = req.headers.authorization?.split(" ")[1];
  if (!refresh_token) {
    res.send("login again :(");
  }
  jwt.verify(refresh_token, "hitherefromrefreshtoken", function (err, decoded) {
    if (err) {
      res.send({ message: "Please lofin first", error: err.message });
    } else {
      const token = jwt.sign(
        { userID: user[0]._id, role: user[0].role },
        "hitherefromnormaltoken",
        { expiresIn: 60 }
      );
      res.send({ message: "Login successfully", token });
    }
  });
});

app.listen(8080, async () => {
  try {
    await connection;
    console.log("Connected to db");
  } catch (error) {
    console.log("error occurred while connecting to db");
    console.log(err);
  }
  console.log("listening to port 8080");
});
