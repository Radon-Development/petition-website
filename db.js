const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.addSignature = (first, last, sig) => {
    const q =
        "INSERT INTO signatures (first,last,signature) VALUES ($1, $2, $3) RETURNING id";
    const params = [first, last, sig];
    return db.query(q, params);
};

module.exports.howManyRegistered = () => {
    return db.query("SELECT COUNT(*) FROM signatures");
};

module.exports.allSigners = () => {
    return db.query("SELECT first, last FROM signatures");
};

module.exports.getSignature = (id) => {
    const q = "SELECT signature FROM signatures WHERE id = ($1)";
    const params = [id];
    return db.query(q, params);
};
