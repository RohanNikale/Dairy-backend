function genToken(user) {
    const token = user.getJWTToken();

    return { token};
}

module.exports = { genToken };