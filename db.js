const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

// module.exports.getActors = () => {
//     return db.query("SELECT * FROM actors");
// };

// module.exports.addActor = (actorName, age) => {
//     return db.query("INSERT INTO actors (name,age) VALUES ($1, $2)", [
//         actorName,
//         age,
//     ]);
// };

// module.exports.getSpcificActor = (actorName) => {
//     const q = "SELECT * FROM actors WHERE name = $1";
//     const params = [actorName];
//     return db.query(q, params);
// };

module.exports.addSignature = (first, last) => {
    const q = "INSERT INTO signatures (first,last) VALUES ($1, $2)";
    const params = [first, last];
    return db.query(q, params);
};

module.exports.howManyRegistered = () => {
    return db.query("SELECT COUNT(*) FROM signatures");
};

module.exports.allSigners = () => {
    return db.query("SELECT (first,last) FROM signatures");
};
