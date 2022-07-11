const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgresql://postgres:3zLVpOEKiRWroDmG74nZ@containers-us-west-46.railway.app:6309/railway"
);

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
        "RIGHT JOIN signatures " +
        "ON users.id = signatures.user_id";
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

module.exports.getHashedPwAndUserIdAndFirst = (email) => {
    const q = "SELECT password, id, first FROM users WHERE email = ($1)";
    const params = [email];
    return db.query(q, params);
};

module.exports.didUserSign = (userId) => {
    const q = "SELECT id FROM signatures WHERE user_id = ($1)";
    const params = [userId];
    return db.query(q, params);
};

module.exports.insertProfile = (age, city, url, userId) => {
    const q =
        "INSERT INTO user_profiles (age, city, url, user_id) values ($1, LOWER($2), $3, $4)";
    const params = [age || null, city || null, url || null, userId];
    return db.query(q, params);
};

module.exports.getSignersByCity = (city) => {
    const q =
        "SELECT users.first, users.last, user_profiles.age, user_profiles.url " +
        "FROM users " +
        "LEFT JOIN user_profiles " +
        "ON users.id = user_profiles.user_id " +
        "RIGHT JOIN signatures " +
        "ON users.id = signatures.user_id " +
        "WHERE user_profiles.city = LOWER($1)";
    const params = [city];
    return db.query(q, params);
};

module.exports.getProfileInfo = (userId) => {
    const q =
        "SELECT users.first, users.last, users.email, user_profiles.age, user_profiles.city, user_profiles.url " +
        "FROM users " +
        "JOIN user_profiles " +
        "ON users.id = user_profiles.user_id " +
        "WHERE users.id = ($1)";
    const params = [userId];
    return db.query(q, params);
};

module.exports.updateUserInfoWithPw = (first, last, email, pw, userId) => {
    const q =
        "UPDATE users SET first = ($1), last = ($2), email = ($3), password = ($4) WHERE id = ($5)";
    const params = [first, last, email, pw, userId];
    return db.query(q, params);
};

module.exports.updateUserInfoWithoutPw = (first, last, email, userId) => {
    const q =
        "UPDATE users SET first = ($1), last = ($2), email = ($3) WHERE id = ($4)";
    const params = [first, last, email, userId];
    return db.query(q, params);
};

module.exports.updateUserProfile = (age, city, url, userId) => {
    const q =
        "INSERT INTO user_profiles (age, city, url, user_id) " +
        "VALUES ($1, $2, $3, $4) " +
        "ON CONFLICT (user_id) " +
        "DO UPDATE SET age = ($1), city = ($2), url = ($3), user_id = ($4)";
    const params = [age || null, city || null, url || null, userId];
    return db.query(q, params);
};

module.exports.deleteSig = (userId) => {
    const q = "DELETE FROM signatures WHERE user_id = ($1)";
    const params = [userId];
    return db.query(q, params);
};

deleteUserFromUsers = (userId) => {
    const q = "DELETE FROM users WHERE id = ($1)";
    const params = [userId];
    return db.query(q, params);
};

deleteUserFromSignatures = (userId) => {
    const q = "DELETE FROM signatures WHERE user_id = ($1)";
    const params = [userId];
    return db.query(q, params);
};

deleteUserFromUserProfiles = (userId) => {
    const q = "DELETE FROM user_profiles WHERE user_id = ($1)";
    const params = [userId];
    return db.query(q, params);
};

module.exports.deleteAcc = (userId) => {
    deleteUserFromUsers(userId)
        .then(() => {
            deleteUserFromSignatures(userId)
                .then(() => {
                    deleteUserFromUserProfiles(userId)
                        .then(() => {
                            console.log(
                                `user with id ${userId} deleted his account`
                            );
                        })
                        .catch((err) => {
                            console.error(
                                "error in db.deleteUserFromUserProfiles",
                                err
                            );
                        });
                })
                .catch((err) => {
                    console.error("error in db.deleteUserFromSignatures", err);
                });
        })
        .catch((err) => {
            console.error("error in db.deleteUserFromUsers", err);
        });
};

module.exports.doesEmailExists = (email) => {
    const q = "SELECT * FROM users WHERE email = ($1)";
    const params = [email];
    return db.query(q, params);
};

module.exports.didUserVisitProfilePage = (userId) => {
    const q = "SELECT id FROM user_profiles WHERE user_id = ($1)";
    const params = [userId];
    return db.query(q, params);
};
