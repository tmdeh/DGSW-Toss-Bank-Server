const profileSql = require('../../DAL/ProfileSql');

exports.get = async(body, res) => {
    let result = await profileSql.searchUser(body.userId);
    res.status(200).json({
        msg : result
    })
}


exports.update = async(body, res, file) => {
    let result = await profileSql.updateUser(body, file);
    res.status(200).json({
        msg : result
    })
}