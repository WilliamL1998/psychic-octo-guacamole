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
                choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee's role", "Exit"],
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
                case "Update an employee's role":
                    updateRole();
                    break;
                default:
                    process.exit();
            }
        })
}

const viewDepartments = () => {
    db.query(`SELECT * FROM department;`, function (err, results) {
        console.table(results);
        promptMenu();
    })
}

const viewRoles = () => {
    db.query(`SELECT role.id, role.title, department.name  AS department, role.salary
    FROM role
    JOIN department ON role.department_id = department.id;`, function (err, results) {
        console.table(results);
        promptMenu();
    })
}

const viewEmployees = () => {
    db.query(`SELECT A.id, A.first_name, A.last_name, role.title, department.name AS department, role.salary, CONCAT(B.first_name, " ", B.last_name) AS manager
    FROM employee A
    JOIN role ON A.role_id = role.id
    JOIN department ON role.department_id = department.id
    LEFT JOIN employee B ON A.manager_id = B.id;`, function (err, results) {
        console.table(results);
        promptMenu();
    })
}

const addDepartment = () => {
    inquirer
        .prompt([
            {
                type: "input",
                message: "What is the name of the department?",
                name: "department",
                validate: (department) => {
                    if (department) {
                        return true;
                    } else {
                        console.log("Please enter the name of the department you would like to add.");
                        return false;
                    }
                }
            }
        ])
        .then(answers => {
            const addThis = JSON.stringify(answers.department)
            db.query(`INSERT INTO department (name) VALUES (${addThis})`)
            console.log(`Added ${addThis} to the database.`)
            promptMenu();
        })
}

const addRole = () => {
    db.query(`SELECT name, id FROM department`, function(err, results) {
        let departmentChoices = results.map(({name, id}) => ({name: name, value: id}))

        inquirer
            .prompt([
                {
                    type: "input",
                    message: "What is the name of the role?",
                    name: "title",
                    validate: (title) => {
                        if (title) {
                            return true;
                        } else {
                            console.log("Please enter the name of the role you would like to add.");
                            return false;
                        }
                    }
                },
                {
                    type: "input",
                    message: "What is the salary of the role?",
                    name: "salary",
                    validate: (salary) => {
                        if (salary) {
                            return true;
                        } else {
                            console.log("Please enter the salary of the role.");
                            return false;
                        }
                    }
                },
                {
                    type: "list",
                    message: "What department does the role belong to?",
                    choices: departmentChoices,
                    name: "department_id",
                    validate: (department_id) => {
                        if (department_id) {
                            return true;
                        } else {
                            console.log("Please select the name of the department the role belongs to.");
                            return false;
                        }
                    }
                }
            ])
            .then(({title, salary, department_id}) => {
                db.query(`INSERT INTO role (title, salary, department_id) VALUES ("${title}", ${salary}, ${department_id})`)
                console.log(`Added ${title} to the database.`)
                promptMenu();
            })
    })
}

const addEmployee = () => {
    db.query(`SELECT title, id FROM role`, function(err, results) {
        let roleChoices = results.map(({title, id}) => ({name: title, value: id}))

        db.query(`SELECT CONCAT(first_name, " ", last_name) AS manager, id FROM employee`, function(err, results) {
            let managerChoices = results.map(({manager, id}) => ({name: manager, value: id}))

            inquirer
                .prompt([
                    {
                        type: "input",
                        message: "What is the employee's first name?",
                        name: "first_name",
                        validate: (first_name) => {
                            if (first_name) {
                                return true;
                            } else {
                                console.log("Please enter the first name of the employee you wish to add.");
                                return false;
                            }
                        }
                    },
                    {
                        type: "input",
                        message: "What is the employee's last name?",
                        name: "last_name",
                        validate: (last_name) => {
                            if (last_name) {
                                return true;
                            } else {
                                console.log("Please enter the last name of the employee you wish to add.");
                                return false;
                            }
                        }
                    },
                    {
                        type: "list",
                        message: "What is the employee's role?",
                        choices: roleChoices,
                        name: "role_id",
                        validate: (role_id) => {
                            if (role_id) {
                                return true;
                            } else {
                                console.log("Please select the role of the employee you wish to add.");
                                return false;
                            }
                        }
                    },
                    {
                        type: "list",
                        message: "Who is the employee's manager?",
                        choices: managerChoices,
                        name: "manager_id",
                        validate: (manager_id) => {
                            if (manager_id) {
                                return true;
                            } else {
                                console.log("Please select the manager of the employee you wish to add.");
                                return false;
                            }
                        }
                    }
                ])
                .then(({first_name, last_name, role_id, manager_id}) => {
                    db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${first_name}", "${last_name}", ${role_id}, ${manager_id})`)
                    console.log(`Added ${first_name} ${last_name} to the database.`)
                    promptMenu();
                })
        })
    })
}

const updateRole = () => {
    db.query(`SELECT CONCAT(first_name, " ", last_name) AS employee, id FROM employee`, function(err, results) {
        let employeeChoices = results.map(({employee, id}) => ({name: employee, value: id}))

        db.query(`SELECT title, id FROM role`, function(err, results) {
            let roleChoices = results.map(({title, id}) => ({name: title, value: id}))

            inquirer
                .prompt([
                    {
                        type: "list",
                        message: "Which employee's role do you want to update?",
                        choices: employeeChoices,
                        name: "id",
                        validate: (id) => {
                            if (id) {
                                return true;
                            } else {
                                console.log("Please select the employee whose role you want to update.");
                                return false;
                            }
                        }
                    },
                    {
                        type: "list",
                        message: "Which role do you want to assign the selected employee?",
                        choices: roleChoices,
                        name: "role_id",
                        validate: (role_id) => {
                            if (role_id) {
                                return true;
                            } else {
                                console.log("Please select the role you want to assign the selecte employee.");
                                return false;
                            }
                        }
                    }
                ])
                .then(({id, role_id}) => {
                    db.query(`UPDATE employee SET role_id = ${role_id} WHERE id = ${id}`)
                    console.log(`Updated employee's role`)
                    promptMenu();
                })
        })
    })
}

promptMenu();