const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Users } = require("../models");
const generateAuthToken = require("../utils/generateAuthToken");

const register = async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
        data: null,
      });
    }

    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with that email already exists.",
        data: null,
      });
    }

    const user = await Users.create({
      name,
      email,
      phoneNumber,
      password,
      userType: "customer",
    });

    const token = generateAuthToken(user);

    return res.status(201).json({
      success: true,
      message: "Operation completed successfully.",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          userType: user.userType,
        },
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Operation failed.",
      data: null,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
        data: null,
      });
    }

    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        data: null,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password.",
        data: null,
      });
    }

    const token = generateAuthToken(user);

    return res.status(200).json({
      success: true,
      message: "Operation completed successfully.",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          userType: user.userType,
        },
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Operation failed.",
      data: null,
    });
  }
};

const loadUser = async (req, res) => {
  try {
    const user = await Users.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Operation completed successfully.",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Operation failed.",
      data: null,
    });
  }
};

const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Operation completed successfully.",
    data: null,
  });
};

module.exports = {
  register,
  login,
  loadUser,
  logout,
};
