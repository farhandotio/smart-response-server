import jwt from "jsonwebtoken";

const generateToken = (userId, role, username, email) => {
    return jwt.sign({ id: userId, role, username, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export default generateToken;