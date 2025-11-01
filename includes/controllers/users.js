module.exports = function ({ models, api }) {
    const Users = models.use('Users');

    async function getInfo(id) {
        try {
            const result = await api.getUserInfo(id);
            return result[id] || null;
        } catch (error) {
            console.error("[Users:getInfo] ERROR:", error.stack || error.message);
            return null;
        }
    }

    async function getNameUser(id) {
        try {
            if (global.data.userName.has(id)) return global.data.userName.get(id);
            const data = await getData(id);
            if (data && data.name) return data.name;
            return "Facebook users";
        } catch {
            return "Facebook users";
        }
    }

    async function getAll(...data) {
        let where = {};
        let attributes;
        for (const i of data) {
            if (typeof i !== 'object') throw new Error("getAll: argument must be object or array");
            if (Array.isArray(i)) attributes = i;
            else where = i;
        }
        try {
            const result = await Users.findAll({ where, attributes });
            return result.map(e => e.get({ plain: true }));
        } catch (error) {
            console.error("[Users:getAll] ERROR:", error.stack || error.message);
            return [];
        }
    }

    async function getData(userID) {
        try {
            const data = await Users.findOne({ where: { userID } });
            return data ? data.get({ plain: true }) : null;
        } catch (error) {
            console.error("[Users:getData] ERROR:", error.stack || error.message);
            return null;
        }
    }

    async function createData(userID, defaults = {}) {
        if (typeof defaults !== 'object' || Array.isArray(defaults)) throw new Error("createData: defaults must be object");
        try {
            await Users.findOrCreate({ where: { userID }, defaults });
            return true;
        } catch (error) {
            console.error("[Users:createData] ERROR:", error.stack || error.message);
            return false;
        }
    }

    async function setData(userID, options = {}) {
        if (typeof options !== 'object' || Array.isArray(options)) throw new Error("setData: options must be object");
        try {
            const record = await Users.findOne({ where: { userID } });
            if (record) await record.update(options);
            else await createData(userID, options);
            return true;
        } catch (error) {
            console.error("[Users:setData] ERROR:", error.stack || error.message);
            return false;
        }
    }

    async function delData(userID) {
        try {
            const record = await Users.findOne({ where: { userID } });
            if (record) await record.destroy();
            return true;
        } catch (error) {
            console.error("[Users:delData] ERROR:", error.stack || error.message);
            return false;
        }
    }

    return {
        getInfo,
        getNameUser,
        getAll,
        getData,
        setData,
        delData,
        createData
    };
};
