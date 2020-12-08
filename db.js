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
    const q =
        "SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url " +
        "FROM users " +
        "LEFT JOIN user_profiles " +
        "ON users.id = user_profiles.user_id " +
        "INNER JOIN signatures " +
        "ON user_profiles.user_id = signatures.user_id";
    return db.query(q);
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

module.exports.insertProfile = (age, city, url, user_id) => {
    const q =
        "INSERT INTO user_profiles (age, city, url, user_id) values ($1, LOWER($2), $3, $4)";
    const params = [age || null, city || null, url || null, user_id];
    return db.query(q, params);
};

module.exports.getSignersByCity = (city) => {
    const q =
        "SELECT users.first, users.last, user_profiles.age, user_profiles.url " +
        "FROM users " +
        "LEFT JOIN user_profiles " +
        "ON users.id = user_profiles.user_id " +
        "INNER JOIN signatures " +
        "ON user_profiles.user_id = signatures.user_id " +
        "WHERE city = LOWER($1)";
    const params = [city];
    return db.query(q, params);
};
