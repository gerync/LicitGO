ALTER USER 'root'@'localhost' IDENTIFIED BY 'rootpassword';
CREATE USER IF NOT EXISTS 'licitgo'@'%' IDENTIFIED BY 'licitgo';
GRANT ALL PRIVILEGES ON licitgo.* TO 'licitgo'@'%';
FLUSH PRIVILEGES;
