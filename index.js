const inquirer = require("inquirer");
const fs = require('fs');
const mysql = require('mysql2');
const cTable = require('console.table');

// connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'rootroot',
        database: 'employee_tracker'
    }
)

const promptMenu = () => {
    inquirer
        .prompt([
            {
                type: "list",
                message: "What would you like to do?",
                choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role", "Exit"],
                name: "menu"
            }
        ])
        .then(answers => {
            switch (answers.menu) {
                case "View all departments":
                    viewDepartments();
                    break;
                case "View all roles":
                    viewRoles();
                    break;
                case "View all employees":
                    viewEmployees();
                    break;
                case "Add a department":
                    addDepartment();
                    break;
                case "Add a role":
                    addRole();
                    break;
                case "Add an employee":
                    addEmployee();
                    break;
                case "Update an employee role":
                    updateRole();
                    break;
                default:
                    process.exit();
            }
        })
}

const viewDepartments = () => {
    db.query("SELECT * FROM department;", function (err, results) {
        console.table(results);
        promptMenu();
    })
}

const viewRoles = () => {
    db.query("SELECT * FROM role;", function (err, results) {
        console.table(results);
        promptMenu();
    })
}

const viewEmployees = () => {
    db.query("SELECT * FROM employee;", function (err, results) {
        console.table(results);
        promptMenu();
    })
}

const addDepartment = () => {
    
}

promptMenu();