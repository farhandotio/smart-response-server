import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

const generateToken = (userId, role, username, email) => {
    return jwt.sign({ id: userId, role, username, email }, config.JWT_SECRET, { expiresIn: '7d' });
};

export default generateToken;