import configs from '../configs/Configs.js';
import crypto from 'crypto';
import pool from '../database/DB.js';
import argon2 from 'argon2';
import { encryptData } from '../utilities/Encrypt.js';
import hashdata from '../utilities/Hash.js';
import { coloredlog } from '@gerync/utils';

function generateUserToken() {
    return crypto.randomBytes(64).toString('hex');
}

export default async function setupDB() {
    // Ellenőrizzük, hogy létezik-e már superadmin felhasználó
    const deleteQuery = 'DELETE FROM users;';
        await pool.query(deleteQuery);

    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM users WHERE type = ?', ['superadmin']);

    if (rows[0].count === 0) {
        // #region Ha nincs superadmin, létrehozzuk az alapértelmezett konfiguráció alapján
        const usertoken = generateUserToken();
        const { usertag, email, password, fullname, gender, birthdate, mobile } = configs.baseadmin;
        const passwordhash = await argon2.hash(password);
        const encryptedEmail = encryptData(email);
        const encryptedFullname = encryptData(fullname);
        const encryptedMobile = encryptData(mobile);
        const encryptedToken = encryptData(usertoken);
        const emailHash = hashdata(email);
        const mobileHash = hashdata(mobile);
        
        if (configs.server.defaultLanguage === 'HU') {
            coloredlog(`Nincs superadmin felhasználó, létrehozzuk az alapértelmezett adatokkal...`, configs.colors.warning);
        } else {
            coloredlog(`No superadmin user found, creating with default data...`, configs.colors.warning);
        }
        const insertQuery = `
            INSERT INTO users (usertoken, usertag, passwordhash, email, email_hash,
            fullname, gender, birthdate, mobile, mobile_hash, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [encryptedToken, usertag, passwordhash, encryptedEmail, emailHash,
            encryptedFullname, gender === 'male' ? 1 : 0, birthdate, encryptedMobile, mobileHash, 'superadmin'];
        await pool.query(insertQuery, params);
        // #endregion
        // #region Konzolra kiírás
        const colors = configs.colors;
        if (configs.server.defaultLanguage === 'HU') {
            coloredlog([`Alapértelmezett superadmin felhasználó létrehozva!`,
                `Felhasználónév: ${usertag}`,
                `Jelszó: ${password}`,
                `Kérlek, jelentkezz be és változtasd meg a jelszavad!\n`], 
                [colors.success, colors.highlight, colors.warning, colors.error]);
        } else {
            coloredlog([`Default superadmin user created!`,
                `Username: ${usertag}`,
                `Password: ${password}`,
                `Please log in and change your password!\n`], 
                [colors.success, colors.highlight, colors.warning, colors.error]);
        }
        // #endregion
        const defaultCars = [
            {
                manufacturer: 'Toyota',
                model: 'Corolla',
                modelyear: 2020,
                ododmeterKM: 15000,
                efficiency: 5.5,
                efficiencyUnit: 'HP',
                enginecapacityunit: 550,
                fueltype: 'gasoline',
                emissionsGKM: 120,
                transmission: 'automatic',
                bodytype: 'sedan',
                color: 'white',
                doors: 5,
                seats: 5,
                vin: 'JTDBL40E799123456',
                maxspeedKMH: 180,
                weightKG: 1300,
                factoryExtras: 'air conditioning, power windows, Bluetooth, backup camera',
                features: 'cruise control, lane departure warning, automatic emergency braking',
                ownertoken: encryptedToken,
                images: JSON.stringify(["https://i.gaw.to/vehicles/photos/40/29/402975-2023-toyota-corolla.jpg"])
            },
            {
                manufacturer: 'Honda',
                model: 'Civic',
                modelyear: 2019,
                ododmeterKM: 20000,
                efficiency: 6.0,
                efficiencyUnit: 'HP',
                enginecapacityunit: 600,
                fueltype: 'gasoline',
                emissionsGKM: 130,
                transmission: 'manual',
                bodytype: 'hatchback',
                color: 'black',
                doors: 5,
                seats: 5,
                vin: '2HGFC2F69KH123456',
                maxspeedKMH: 190,
                weightKG: 1250,
                factoryExtras: 'sunroof, leather seats, navigation system, premium audio',
                features: 'adaptive cruise control, blind spot monitoring, rear cross traffic alert',
                ownertoken: encryptedToken,
                images: JSON.stringify(["https://image-cdn.hypb.st/https%3A%2F%2Fhypebeast.com%2Fimage%2F2023%2F01%2Fhonda-civic-type-r-fl5-review-1.jpg?w=1440&cbr=1&q=90&fit=max"])
            }
        ];
        const carids = [];
        for (const car of defaultCars) {
            const insertCarQuery = `
                INSERT INTO cars (manufacturer, model, modelyear, ododmeterKM, efficiency, efficiencyUnit,
                enginecapacityunit, fueltype, emissionsGKM, transmission, bodytype, color, doors, seats,
                vin, maxspeedKMH, weightKG, factoryExtras, features, ownertoken, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const carParams = [
                car.manufacturer, car.model, car.modelyear, car.ododmeterKM, car.efficiency, car.efficiencyUnit,
                car.enginecapacityunit, car.fueltype, car.emissionsGKM, car.transmission, car.bodytype, car.color, car.doors, car.seats,
                car.vin, car.maxspeedKMH, car.weightKG, car.factoryExtras, car.features, car.ownertoken, car.images
            ];
            const [res] = await pool.query(insertCarQuery, carParams);
            carids.push(res.insertId);
        }
        const defaultauctions = [
            {
                carid: carids[0],
                startpriceUSD: 10000,
                currentpriceUSD: 10000,
                starttime: new Date(),
                endtime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 nap múlva
                status: 'active',
                highestbidder: null
            },
            {
                carid: carids[1],
                startpriceUSD: 12000,
                currentpriceUSD: 12000,
                starttime: new Date(),
                endtime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 nap múlva
                status: 'active',
                highestbidder: null
            }
        ];
        for (const auction of defaultauctions) {
            const insertAuctionQuery = `
                INSERT INTO auctions (carid, startpriceUSD, currentpriceUSD, starttime, endtime, status, highestbidder) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`;
            const auctionParams = [
                auction.carid, auction.startpriceUSD, auction.currentpriceUSD, auction.starttime, auction.endtime, auction.status, auction.highestbidder
            ];
            await pool.query(insertAuctionQuery, auctionParams);
        }
    } else {
        if (configs.server.defaultLanguage === 'HU') {
            coloredlog(`Superadmin felhasználó már létezik, nem hozunk létre újat.`, configs.colors.success);
        }
        else {
            coloredlog(`Superadmin user already exists, not creating a new one.`, configs.colors.success);
        }
    }
}