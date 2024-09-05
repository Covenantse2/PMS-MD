

module.exports = {
    findOne: async (role, username, password) => {
        const [rows] = await promisePool.query(
            'SELECT * FROM users WHERE role = ? AND username = ? AND password = ?',
            [role, username, password]
        );
        return rows[0];
    },
};
