const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.addSignature = (sig, userId) => {
    const q =
        "INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING id";
    const params = [sig, userId];
    return db.query(q, params);
};

module.exports.howManyRegistered = () => {
    return db.query("SELECT COUNT(*) FROM signatures");
};

module.exports.allSigners = () => {
    return db.query("SELECT first, last FROM users");
};

module.exports.getSignature = (id) => {
    const q = "SELECT signature FROM signatures WHERE id = ($1)";
    const params = [id];
    return db.query(q, params);
};

module.exports.addNewUser = (first, last, email, pw) => {
    const q =
        "INSERT INTO users (first,last,email,password) VALUES ($1, $2, $3, $4) RETURNING id";
    const params = [first, last, email, pw];
    return db.query(q, params);
};

module.exports.getHashedPwandUserId = (email) => {
    const q = "SELECT password, id FROM users WHERE email = ($1)";
    const params = [email];
    return db.query(q, params);
};

module.exports.didUserSign = (userId) => {
    const q = "SELECT id FROM signatures WHERE user_id = ($1)";
    const params = [userId];
    return db.query(q, params);
};
