import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//Register User ...: /api/user/register

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if ((!name, !email, !password)) {
      return res.json({ success: false, message: "Missing Details" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true, //prevent javascript to access token
      secure: process.env.NODE_ENV === "production", // use secure cookies in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", //CSRF Protection
      maxAge: 7 * 24 * 60 * 60 * 1000, //  cookie expire time
      path: "/",
    });

    return res.json({
      success: true,
      user: { email: user.email, name: user.name },
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//Register User ...: /api/user/login

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email ans Password both are required ...",
      });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User doesn't exists",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.json({
      success: true,
      user: { email: user.email, name: user.name },
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//Check Auth : /api/user/is-auth

export const isAuth = async (req, res) => {
  try {
    // console.log("inside isAuth");
    const { userId } = req;
    const userDoc = await User.findById(userId).select("-password");
    return res.json({ success: true, userDoc });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Logout : /api/user/logout

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
    });
    res.json({ success: true, message: "Logged Out !!" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
