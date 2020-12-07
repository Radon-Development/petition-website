const bcrypt = require("bcryptjs");
const { promisify } = require("util");

const genSalt = promisify(bcrypt.genSalt);
const hash = promisify(bcrypt.hash);
const compare = promisify(bcrypt.compare);

exports.hash = (plainTxtPw) => {
    return genSalt().then((salt) => {
        return hash(plainTxtPw, salt);
    });
};

exports.compare = compare;
