const jwt = require('express-jwt');
const { secret } = require('config.json');
const db =require('_helpers/db');

module.exports = authorize;

function authorize(role = []) {
    //roles param can be a single role string (e.g. Role.User or 'User')
    //or an array of roles (e.g [Role.Admin, Role.User] or ['Admin', 'User'])
    if (typeof roles === 'string') {
        roles = [roles];
    }
    return [
        //authenticate JWt token and attach user to request object {req.user}
        jwt ({ secret, algorithms:['HS256']}),

        //authorize based on user role
        async (req, res, next) => {
            const account = await db.Account.findByPK(req.user.id);

            if (!account || (role.length && !role.includes(account.role))) {

            }        }
    ]
}