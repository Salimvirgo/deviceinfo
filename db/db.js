const mysql = require("mysql");

let connectionPool = {};
let options = {};
if (process.env.NODE_ENV === "development") {
  options = {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    connectionLimit: 10,
    port: 3306,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    clearExpired: true,
    createDatabaseTable: true,
    expiration: 86400000,
  };
  connectionPool = mysql.createPool(options);
} else {
  options = {
    host: process.env.DB_HOST_PROD,
    user: process.env.DB_USERNAME_PROD,
    password: process.env,
    database: process.env,
    clearExpired: true,
    createDatabaseTable: true,
    expiration: 86400000,
  };
  connectionPool = mysql.createPool(options);
}

const connection = connectionPool.getConnection((err, connection) => {
  if (err) {
    console.log(err);
  }
  return connection;
});

connectionPool.on("connection", (connection) => {
  console.log("MySql Database Connected Successfully");
  connection.on("error", (err) => {
    console.log(err);
  });
});

const dbObject = {};

/*
This method gets all users in our database
*/
dbObject.GetAllUsers = () => {
  const sql =
    "SELECT userId, firstname, lastname, username,email, userLevel, number FROM users Inner Join userLevels ON users.userLevel = userLevels.levelId";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};

dbObject.CreateNewUser = (user) => {
    const { firstname, lastname, username,email, userLevel, number, password } = user;
    const sql =
      "INSERT INTO users (firstname, lastname, username, email, userLevel, number, password) values (?,?,?,?,?,?,?)";
    return new Promise((resolve, reject) => {
      connectionPool.query(
        sql,
        [firstname, lastname, username, email, userLevel, number, password],
        (err, result) => {
          if (err) return reject(err);
  
          return resolve(result);
        }
      );
    });
  };
  // This method is used to get user by ID
  dbObject.GetUserById = (id) => {
    const sqlQuery = "SELECT * FROM users WHERE userId = ?";
    return new Promise((resolve, reject) => {
      connectionPool.query(sqlQuery, [id], (err, result) => {
        if (err) return reject(err);
  
        return resolve(result);
      });
    });
  };
  
  //This method is used to get user by email
  dbObject.GetUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users WHERE email = ?;`;
      connectionPool.query(sql, [email], (err, result) => {
        if (err) return reject(err);
  
        return resolve(result);
      });
    });
  };
  
  //This method is used to get user by username
  dbObject.GetUserByUsername = (username) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users WHERE username = ?;`;
      connectionPool.query(sql, [username], (err, result) => {
        if (err) return reject(err);
  
        return resolve(result);
      });
    });
  };
  

  //This method is used to update a user by ID
  dbObject.UpdateUserById = (id, user) => {
    const sql = `UPDATE users SET firstname = ?, lastname = ?, username = ?, email = ? ,number = ?, userLevel = ?, WHERE userId = ?`;
    return new Promise((resolve, reject) => {
      connectionPool.query(
        sql,
        [
          user.firstName,
          user.lastname,
          user.username,
          user.email,
          user.msisdn,
          user.userLevel,
          id,
        ],
        (err, result) => {
          if (err) return reject(err);
  
          return resolve(result);
        }
      );
    });
  };
  //This method is used to delete a user by ID
  dbObject.DeleteUserById = (id) => {
    const sqlQuery = "DELETE FROM users WHERE userId = ?";
  
    return new Promise((resolve, reject) => {
      connectionPool.query(sqlQuery, [id], (err, result) => {
        if (err) return reject(err);
  
        return resolve(result);
      });
    });
  };
  //END OF USERS

//System logs
dbObject.InsertIntoSysLog = (userId, logDetails) => {
    const sql = "INSERT INTO sys_log( userId, detail) VALUES (?, ?);";
    return new Promise((resolve, reject) => {
      connectionPool.query(sql, [userId, logDetails], (err, result) => {
        if (err) return reject(err);
  
        return resolve(result);
      });
    });
  };
  
  //User levels
  dbObject.GetAllLevels = () => {
    const sql = "SELECT * FROM userLevels";
    return new Promise((resolve, reject) => {
      connectionPool.query(sql, (err, result) => {
        if (err) return reject(err);
  
        return resolve(result);
      });
    });
  };

  //Device logs
  dbObject.GetDeviceInfoByMSISDN = (msisdn) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM datainfo WHERE MSISDN = ?;`;
      connectionPool.query(sql, [msisdn], (err, result) => {
        if (err) return reject(err);
  
        return resolve(result);
      });
    });
  };

  //Get all Device logs
  dbObject.GetAllDeviceInfo= (from,to) => {
    
    return new Promise((resolve, reject) => {
      // const { from, to } =req.body;
      const sql = `select * from datainfo WHERE id between ${from} and ${to};`;
      connectionPool.query(sql, [from,to], (err, result) => {
        if (err) return reject(err);
  
        return resolve(result);
      });
    });
  };


  
  module.exports = { dbObject, connection, options };