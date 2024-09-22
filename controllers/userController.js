import UserModel from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//user Registration
class UserController {
  static userRegistration = async (req, res) => {
    const { name, email, password, password_confirmation, tc } = req.body;
    const user = await UserModel.findOne({ email: email });
    if (user) {
      res.send({ status: "failed", message: "user already exist" });
    } else {
      if (name && email && password && password_confirmation && tc) {
        if (password === password_confirmation) {
          try {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            const doc = new UserModel({
              name: name,
              email: email,
              password: hashPassword,
              tc: tc,
            });
            await doc.save();
            const saved_user = await UserModel.findOne({ email: email });

            //genrate JWT TOKEN
            const token = jwt.sign(
              { id: saved_user._id },
              process.env.JWT_SECRET_KEY,
              {
                expiresIn: "5d",
              }
            );
            res.send({
              status: "success",
              message: "Registration successful",
              token: token,
            });
          } catch (error) {
            console.log(error);
            res.send({ status: "failed", message: "Unable to register" });
          }
        } else {
          res.send({
            status: "failed",
            message: "Password and Confirm Password doesn't match",
          });
        }
      } else {
        res.send({ status: "failed", message: "All fields are required" });
      }
    }
  };

  //user Login
  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (email && password) {
        const user = await UserModel.findOne({ email: email });
        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (user.email === email && isMatch) {
            //genrate JWT TOKEN
            const token = jwt.sign(
              { id: user._id },
              process.env.JWT_SECRET_KEY,
              {
                expiresIn: "5d",
              }
            );
            res.send({
              status: "success",
              message: "Login successful",
              token: token,
            });
          } else {
            res.send({
              status: "failed",
              message: "Email or Password is incorrect",
            });
          }
        } else {
          res.send({
            status: "failed",
            message: "You are not a registered user",
          });
        }
      } else {
        res.send({ status: "failed", message: "All fields are required" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Unable to login" });
    }
  };

  //user change his password
  static changeUserPassword = async (req, res) => {
    const { password, password_confirmation } = req.body;
    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        res.send({
          status: "failed",
          message: "Password and Confirm Password doesn't match",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);
        await UserModel.findByIdAndUpdate(req.user._id, {
          $set: {
            password: newHashPassword,
          },
        });
        console.log(req.user._id);
        res.send({
          status: "success",
          message: "Password changed successfully",
        });
      }
    } else {
      res.send({ status: "failed", message: "All fields are required" });
    }
  };

  //userProfile
  static loggedUser = async (req, res) => {
    res.send({ user: req.user });
  };

  //user get his reset password through email
  static sendUserPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
    if (email) {
      const user = await UserModel.findOne({ email: email });
      if (user) {
        const secret = user._id + process.env.JWT_SECRET_KEY;
        const token = jwt.sign({ id: user._id }, secret, { expiresIn: "60m" });
        const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;
        console.log(link);
        //send email
        let info = await transporter.sendMail({
          from: process.env.EMAIL_FORM,
          to: user.email,
          subject: "MY AUTH -Password Reset Link",
          html: `<a href=${link}>Click here</a> to reset  your password`,
        });
        res.send({
          status: "success",
          message: "Password reset link send to your email",
          info: info,
        });
      } else {
        res.send({ status: "failed", message: "email doesn't exist" });
      }
    } else {
      res.send({ status: "failed", message: "email fields is required" });
    }
  };

  //user reset password
  static sendUserPasswordReset = async (req, res) => {
    const { password, password_confirmation } = req.body;
    const { id, token } = req.params;
    const user = await UserModel.findById(id);
    const new_secret = user._id + process.env.JWT_SECRET_KEY;
    try {
      jwt.verify(token, new_secret);
      if (password && password_confirmation) {
        if (password !== password_confirmation) {
          res.send({
            status: "failed",
            message: "New Password and Confirm Password doesn't match",
          });
        } else {
          const salt = await bcrypt.genSalt(10);
          const newHashPassword = await bcrypt.hash(password, salt);
          await UserModel.findByIdAndUpdate(user._id, {
            $set: {
              password: newHashPassword,
            },
          });
          res.send({
            status: "success",
            message: "Password reset successfully",
          });
        }
      } else {
        res.send({ status: "failed", message: "All fields are required" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "invaild token" });
    }
  };
}

export default UserController;
