INSERT INTO departments(department_name)
VALUES
    ('Management'),
    ('Sales'),
    ('Warehouse'),
    ('Human Resources'),
    ('Quality Control'),
    ('Office Management'),
    ('Accounting');

INSERT INTO roles(title, salary, department_id)
VALUES 
    ('Regional Manager', 100000, 1),
    ('Sales Rep', 67000, 2),
    ('Warehouse Worker', 45000, 3),
    ('HR Rep', 72000, 4),
    ('Receptionist', 47000, 5),
    ('Accountant', 89000, 6);

INSERT INTO employees(first_name, last_name, role_id)
VALUES
    ('Michael', 'Schneider', 1),
    ('Matthew', 'Greene', 5),
    ('Allee','Maggio', 2),
    ('Hannah', 'Dark', 4),
    ('Burhan', 'Khan', 6),
    ('Seth', 'Tarvin', 3);


UPDATE `employee_db`.`employees`;