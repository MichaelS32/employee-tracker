const inquirer = require('inquirer');
const chalk = require('chalk');
const cTable  = require('console.table');
const connection = require('./config/connection.js');
const startingOptions = ['View all Employees', 'View all Employees by Department', 'Add Employee', 'Update Employee Role', 'View all Roles', 'Add Role', 'View all Departments', 'Add Department', 'Exit']
const queryAllEmployees = `SELECT e.id, e.first_name AS "First Name", e.last_name AS "Last Name", r.title, d.department_name AS "Department", IFNULL(r.salary, 'No Data') AS "Salary", CONCAT(m.first_name," ",m.last_name) AS "Manager"
FROM employees e
LEFT JOIN roles r 
ON r.id = e.role_id 
LEFT JOIN departments d 
ON d.id = r.department_id
LEFT JOIN employees m ON m.id = e.manager_id
ORDER BY e.id;`
const addEmpQuestions = ['Employees first name?', 'Employees last name?', 'What is their role', 'Who is their manager?'];
const roleQuery = 'SELECT * FROM roles; SELECT CONCAT (e.first_name," ",e.last_name) AS full_name FROM employees e'
const managerQuery = 'SELECT CONCAT (e.first_name," ",e.last_name) AS full_name, r.title, d.department_name FROM employees e INNER JOIN roles r ON r.id = e.role_id INNER JOIN departments d ON d.id = r.department_id WHERE department_name = "Management";';


// Function to initialize page, includes starting options
const initApp = () => {
    inquirer.prompt({
        name: 'startingMenu',
        type: 'list',
        message: 'Select an option from below',
        choices: startingOptions
    }).then ((answer) => {
        // To select proper function based off user choice
        switch (answer.startingMenu) {
            case 'View all Employees':
                showAll();
                break;
            case 'View all Employees by Department':
                showAllDept();
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'Update Employee Role':
                updateRole();
                break;
            case 'View all Roles':
                viewRoles();
                break;
            case 'Add Role':
                addRole();
                break;
            case 'View All Departments':
                viewDept();
                break;
            case 'Add a Department':
                addDept();
                break;
            case 'Leave Session':
                connection.end();
                break;
                
        }
    })
};

// function to show all employees in db
const showAll = () => {
    connection.query(queryAllEmployees, (err, results) => {
        if (err) throw err;
        console.log(' ');
        console.table(chalk.yellow('All Employees'), results)
        initApp();
    })
};

// Function to show employees in a specific department
const showAllDept = () => {
    const deptQuery = 'SELECT * FROM departments';
    connection.query(deptQuery, (err, results) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'deptChoices',
                type: 'list',
                choices: function () {
                    let choiceArray = results.map(choice => choice.department_name)
                    return choiceArray;
                },
                message: 'Select a Department to view:'
            }
        ]).then((answer) => {
            let chosenDept;
            for (let i = 0; i < results.length; i++) {
                if(results[i].department_name === answer.deptChoices) {
                    chosenDept = results[i];
                }
            }
            const query = 'SELECT e.id, e.first_name AS "First Name", e.last_name AS "Last Name", r.title AS "Title", d.department_name AS "Department", r.salary AS "Salary" FROM employees e INNER JOIN roles r ON r.id = e.role_id INNER JOIN departments d on d.id = r.department_id WHERE ?;';
            connection.query(query, { department_name: chosenDept.department_name }, (err, res) => {
                if (err) throw err;
                console.log(' ');
                console.table(chalk.yellow(`All Employees by Department: ${chosenDept.department_name}`), res);
                initApp();
            }) 
        })
    })
};

// Function to add employees to the database
const addEmployee = () => {
    connection.query(roleQuery, (err, results) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'firstName',
                type: 'input',
                message: 'What is the Employees first name?'
            },
            {
                name: 'lastName',
                type: 'input',
                message: 'What is the Employees last name?'
            },
            {
                name: 'role',
                type: 'list',
                choices: function () {
                    let choiceArray = results[0].map(choice => choice.title);
                    return choiceArray;
                },
                message: 'What is the Employees Role?'
            },
            {
                name: 'manager',
                type: 'list',
                choices: function () {
                    let choiceArray = results[1].map(choice => choice.full_name);
                    return choiceArray;
                },
                message: 'Who is the Employees manager?'
            }
        ]).then((answer) => {
            connection.query(
                `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, (SELECT id FROM roles WHERE title = ?), (SELECT id FROM (SELECT id FROM employees WHERE CONCAT(first_name," ", last_name) = ?)));`, [answer.firstName, answer.lastName, answer.role, answer.manager]
            ),
            initApp();
        })
    })
};

const updateRole = () => {
    const query = `SELECT CONCAT (first_name," ",last_name) AS full_name FROM employees; SELECT title FROM roles`
    connection.query(query, (err, results) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'employee',
                type: 'list',
                choices: function () {
                    let choiceArray = results[0].map(choice => choice.full_name);
                    return choiceArray;
                },
                message: 'Select an employee to update their role:'
            },
            {
                name: 'newRole',
                type: 'list',
                choices: function () {
                    let choiceArray = results[1].map(choice => choice.title);
                    return choiceArray;
                }
            }
        ]).then((answer) => {
            const sql = `UPDATE employees 
            SET role_id = (SELECT id FROM roles WHERE title = ? ) 
            WHERE id = (SELECT id FROM employees WHERE CONCAT(first_name," ",last_name) = ?)`
            connection.query(sql, [answer.newRole, answer.employee], (err, results) => {
                if (err) throw err;
                startApp();
            })
        })


    })

};

const viewRoles = () => {
    let query = `SELECT title AS "Title" FROM roles`;
    connection.query(query, (err, results) => {
        if (err) throw err;

        console.log(' ');
        console.table(chalk.yellow('All Roles'), results);
        initApp();
    })
};

const addRole = () => {
    const addRoleQuery = `SELECT * FROM roles; SELECT * FROM departments`
    connection.query(addRoleQuery, (err, results) => {
        if (err) throw err;

        console.log(' ');
        console.table(chalk.yellow("List of the Company's current Roles:"), results[0]);

        inquirer.prompt([
            {
                name: 'newTitle',
                type: 'input',
                message: 'Enter the Title of the new Role:'
            },
            {
                name: 'newSalary',
                type: 'input',
                message: 'Enter the salary for the new Role:'
            },
            {
                name: 'department',
                type: 'list',
                choices: function () {
                    let choiceArray = results[0].map(choice => choice.deparment_name);
                    return choiceArray;
                },
                message: 'Please select the Department for the new Role'
            }
        ]).then((answer) => {
            connection.query(
                `INSERT INTO roles (title, salary, department_id)
                VALUES
                ( ?, ?, (SELECT id FROM deparments WHERE deparment_name = ?));`
            )
            initApp();
        })
    })
};

const viewDept = () => {
    query = `SELECT department_name AS "Departments" FROM departments`;
    connection.query(query, (err, results) => {
        if (err) throw err;

        console.log(' ');
        console.table(chalk.yellow("List of Company's current Departments:"), results);

        inquirer.prompt([
            {
                name: 'newDept',
                type: 'input',
                message: 'Enter the name of the new Department:'
            }
        ]).then((answer) => {
            connection.query(`INSERT INTO departments(deparment_name) VALUES( ? )`, answer.newDept)
            initApp();
        })
    })
};

initApp();