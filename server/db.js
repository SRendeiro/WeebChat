const sqlite = require("sqlite3").verbose();
const dbDirname = "./server/Database/user.db";

module.exports = {
  openDB: function () {
    let db = new sqlite.Database(
      dbDirname,
      sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE,
      (err) => {
        if (err) {
          return console.error(err.message);
        }
        db.run(
          "create table if not exists users (username text, pwd text, authKey int)"
        );
        console.log("Connected to the user database.");
      }
    );
  },
  addUser: function (username, password, authKey) {
    // insert one row into the langs table
    let db = new sqlite.Database(dbDirname);
    db.run(
      `INSERT INTO users(username, pwd, authKey) VALUES(?,?,?)`,
      [username, password, authKey],
      function (err) {
        if (err) {
          return console.log(err.message);
        }
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
      }
    );

    // close the database connection
    db.close();
  },
  searchUser: function (authKey) {
    let db = new sqlite.Database(dbDirname);
    let sql = `SELECT username FROM users WHERE authKey  = ?;`

    db.get(sql, [authKey], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      db.close();
      return row
        ? console.log(row.username)
        : console.log(`No playlist found with the id ${playlistId}`);
    
    });

    
  },
};
