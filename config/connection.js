const mysql  = require('mysql2');
const chalk = require('chalk');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Cod3D@ddy32!',
    database: 'employee_db',
    multipleStatements: true
});

connection.connect((err) => {
    if (err) {
        console.log(chalk.white.bgRed);
        return;
    }

    console.log(chalk.green(`Connected to database. ThreadID: ${connection.threadID}`))
});

module.exports = connection;