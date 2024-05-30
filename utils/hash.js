const bcrypt = require("bcryptjs");
const saltRounds = Number(process.env.SALT_ROUNDS);

async function hash(plainText) {
    try {
        const hash = await bcrypt.hash(plainText, saltRounds);
        return hash;
    }
    catch (error) {
        throw error;
    }
}

async function compareHash(plainText, hash) {
    try {
        const compareResult = await bcrypt.compare(plainText, hash);
        return compareResult;
    }
    catch (error) {
        throw error;
    }
}

module.exports = { hash, compareHash };