const connection = require("../db/dbconnection");
const util = require("util"); // helper

const authorized = async (req, res, next) => {
  const query = util.promisify(connection.query).bind(connection);
  const token = req.headers.token;
  const user = await query("select * from users where token = ?", [token]);
  if (user[0]) {
    res.locals.user = user[0];
    next();
  } else {
    res.status(403).json({
      msg: "you are not authorized to access this route !",
    });
  }
};

module.exports = authorized;
