const userSql = require('../../DAL/UserSql')


exports.check = (id, res) => {
    userSql.idDuplicateCheck(id)
    .then((result) => {
        res.status(200).json(result);
    }).catch((result) => {
        res.status(400).json(result);
    })
}