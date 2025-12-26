CREATE DATABASE IF NOT EXISTS licitgo
CHARACTER SET utf8
DEFAULT COLLATE utf8_hungarian_ci;
USE licitgo;

CREATE TABLE IF NOT EXISTS users (
    usertoken VARCHAR(512) PRIMARY KEY NOT NULL UNIQUE,
    usertag VARCHAR(32) NOT NULL UNIQUE,
    passwordhash VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    fullname VARCHAR(255) NOT NULL,
    mobile VARCHAR(255) NOT NULL UNIQUE,
    gender VARCHAR(10) NOT NULL,
    birthdate DATE NOT NULL,
    type ENUM('unverified', 'verified', 'admin', 'superadmin', 'suspended', 'banned', 'deleted') DEFAULT 'unverified' NOT NULL,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    lastlogin DATETIME,
    publicContacts BOOLEAN DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS tfa (
    usertoken VARCHAR(512) PRIMARY KEY NOT NULL UNIQUE,
    secret VARCHAR(255) NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    backupcodes TEXT,
    FOREIGN KEY (usertoken) REFERENCES users(usertoken) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS profpics (
    usertoken VARCHAR(512) NOT NULL UNIQUE PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    FOREIGN KEY (usertoken) REFERENCES users(usertoken) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    manufacturer VARCHAR(100) NOT NULL,
    model VARCHAR(150) NOT NULL,
    odometerKM INT NOT NULL,
    modelyear INT NOT NULL,
    efficiency DECIMAL(4,2) NOT NULL,
    efficiencyunit ENUM('HP', 'kW') NOT NULL,
    enginecapacityCC INT NOT NULL,
    fueltype ENUM('gasoline', 'diesel', 'electric', 'hybrid', 'other') DEFAULT 'gasoline' NOT NULL,
    emissionsGKM INT,
    transmission ENUM('manual', 'automatic', 'semi-automatic', 'CVT', 'dual-clutch', 'other') DEFAULT 'manual' NOT NULL,
    bodytype ENUM('sedan', 'hatchback', 'SUV', 'coupe', 'convertible', 'wagon', 'van', 'truck', 'other') DEFAULT 'sedan' NOT NULL,
    color VARCHAR(50) NOT NULL,
    doors INT NOT NULL,
    seats INT NOT NULL,
    vin VARCHAR(17) NOT NULL UNIQUE,
    maxspeedKMH INT,
    zeroToHundredSec FLOAT,
    weightKG INT,
    factoryExtras TEXT,
    features TEXT,
    ownertoken VARCHAR(512) NOT NULL,
    FOREIGN KEY (ownertoken) REFERENCES users(usertoken) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auctions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carid INT NOT NULL UNIQUE,
    startingpriceUSD DECIMAL(10, 2) NOT NULL,
    reservepriceUSD DECIMAL(10, 2),
    starttime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    endtime DATETIME NOT NULL,
    status ENUM('upcoming', 'active', 'completed', 'cancelled') DEFAULT 'active' NOT NULL,
    winner VARCHAR(512),
    FOREIGN KEY (carid) REFERENCES cars(id) ON DELETE CASCADE,
    FOREIGN KEY (winner) REFERENCES users(usertoken) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS bids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    auctionid INT NOT NULL,
    bidder VARCHAR(512) NOT NULL,
    bidamountUSD DECIMAL(10, 2) NOT NULL,
    bidtime DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auctionid) REFERENCES auctions(id) ON DELETE CASCADE,
    FOREIGN KEY (bidder) REFERENCES users(usertoken) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS carimages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carid INT NOT NULL,
    filepath VARCHAR(255) NOT NULL,
    uploadedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    orderindex INT DEFAULT 0 CHECK (orderindex >= 0 AND orderindex < 50),
    FOREIGN KEY (carid) REFERENCES cars(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emailcodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usertoken VARCHAR(512) NOT NULL,
    code VARCHAR(10) NOT NULL,
    expiresat DATETIME NOT NULL,
    type ENUM('verification', 'password-reset', 'email-change') NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usertoken) REFERENCES users(usertoken) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usertoken VARCHAR(512) NOT NULL UNIQUE,
    darkmode BOOLEAN DEFAULT FALSE,
    language ENUM('EN', 'HU') DEFAULT 'EN' NOT NULL,
    currency ENUM('EUR', 'HUF', 'USD') DEFAULT 'EUR' NOT NULL,
    FOREIGN KEY (usertoken) REFERENCES users(usertoken) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS errorlogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT NOT NULL,
    stacktrace TEXT,
    route VARCHAR(255),
    occurredat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);