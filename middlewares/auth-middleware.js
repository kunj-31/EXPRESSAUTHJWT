import jwt from "jsonwebtoken";
import UserModel from "../models/user.js";

const checkUserAuth =async (req, res, next) => {
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith("Bearer")) {
    try {
      //get token from header
      token = authorization.split(" ")[1]

      //verify token
      const { id } = jwt.verify(token, process.env.JWT_SECRET_KEY)

      //get user from token
      req.user = await UserModel.findById(id).select("-password");
      next();
    }
    catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Unauthorized User" });
    }
}
console.log(token);

if (!token) {
  res.send({ status: "failed", message: "Unauthorized User, No Token" });
}
}

export default checkUserAuth;