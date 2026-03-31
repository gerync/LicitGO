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
    /* Ellenőrizzük, hogy létezik-e már superadmin felhasználó
    const deleteQuery = 'DELETE FROM users;';
    await pool.query(deleteQuery);
    */
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
            fullname, mobile, mobile_hash, gender, birthdate, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [encryptedToken, usertag, passwordhash, encryptedEmail, emailHash,
            encryptedFullname, encryptedMobile, mobileHash, gender, birthdate, 'superadmin'];
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
                odometerKM: 15000,
                efficiency: 5.5,
                efficiencyunit: 'HP',
                enginecapacityCC: 1800,
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
                images: JSON.stringify(["2023-toyota-corolla.jpg"])
            },
            {
                manufacturer: 'Honda',
                model: 'Civic',
                modelyear: 2019,
                odometerKM: 20000,
                efficiency: 6.0,
                efficiencyunit: 'HP',
                enginecapacityCC: 1600,
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
                images: JSON.stringify(["honda-civic.jpg"])
            },
            {
                manufacturer: 'Ford',
                model: 'Focus',
                modelyear: 2018,
                odometerKM: 35000,
                efficiency: 6.8,
                efficiencyunit: 'HP',
                enginecapacityCC: 1600,
                fueltype: 'diesel',
                emissionsGKM: 135,
                transmission: 'manual',
                bodytype: 'hatchback',
                color: 'blue',
                doors: 5,
                seats: 5,
                vin: 'WF0AXXGBGXG123456',
                maxspeedKMH: 195,
                weightKG: 1320,
                factoryExtras: 'rear parking sensors, AUX input',
                features: 'lane keep assist, rear camera',
                ownertoken: encryptedToken,
                images: JSON.stringify(["ford-focus.jpg"])
            },
            {
                manufacturer: 'BMW',
                model: '320i',
                modelyear: 2021,
                odometerKM: 12000,
                efficiency: 5.2,
                efficiencyunit: 'HP',
                enginecapacityCC: 2000,
                fueltype: 'gasoline',
                emissionsGKM: 110,
                transmission: 'automatic',
                bodytype: 'sedan',
                color: 'silver',
                doors: 4,
                seats: 5,
                vin: 'WBA3A9G50FN123456',
                maxspeedKMH: 240,
                weightKG: 1450,
                factoryExtras: 'M sport package, leather seats, navigation',
                features: 'parking assist, adaptive cruise control, heated seats',
                ownertoken: encryptedToken,
                images: JSON.stringify(["bmw-320i.jpg"])
            },
            {
                manufacturer: 'Mercedes-Benz',
                model: 'C200',
                modelyear: 2020,
                odometerKM: 18000,
                efficiency: 5.9,
                efficiencyunit: 'HP',
                enginecapacityCC: 1600,
                fueltype: 'gasoline',
                emissionsGKM: 115,
                transmission: 'automatic',
                bodytype: 'sedan',
                color: 'black',
                doors: 4,
                seats: 5,
                vin: 'WDDGF8AB4AR123456',
                maxspeedKMH: 230,
                weightKG: 1500,
                factoryExtras: 'panoramic roof, AMG styling, ambient lighting',
                features: 'automatic emergency braking, blind spot assist',
                ownertoken: encryptedToken,
                images: JSON.stringify(["mercedes-c200.jpg"])
            },
            {
                manufacturer: 'Volkswagen',
                model: 'Golf',
                modelyear: 2017,
                odometerKM: 47000,
                efficiency: 6.5,
                efficiencyunit: 'HP',
                enginecapacityCC: 1400,
                fueltype: 'gasoline',
                emissionsGKM: 140,
                transmission: 'manual',
                bodytype: 'hatchback',
                color: 'red',
                doors: 5,
                seats: 5,
                vin: 'WVWZZZ1KZ3W123456',
                maxspeedKMH: 200,
                weightKG: 1280,
                factoryExtras: 'cruise control, alloy wheels',
                features: 'parking sensors, hill start assist',
                ownertoken: encryptedToken,
                images: JSON.stringify(["vw-golf.jpg"])
            },
            {
                manufacturer: 'Nissan',
                model: 'Qashqai',
                modelyear: 2019,
                odometerKM: 30000,
                efficiency: 7.2,
                efficiencyunit: 'HP',
                enginecapacityCC: 1600,
                fueltype: 'diesel',
                emissionsGKM: 150,
                transmission: 'automatic',
                bodytype: 'SUV',
                color: 'grey',
                doors: 5,
                seats: 5,
                vin: 'SJNFBAJ11U1234567',
                maxspeedKMH: 200,
                weightKG: 1400,
                factoryExtras: 'roof rails, rear spoiler',
                features: 'all-wheel drive option, adaptive lighting',
                ownertoken: encryptedToken,
                images: JSON.stringify(["nissan-qashqai.jpg"])
            },
            {
                manufacturer: 'Subaru',
                model: 'Impreza',
                modelyear: 2016,
                odometerKM: 60000,
                efficiency: 7.8,
                efficiencyunit: 'HP',
                enginecapacityCC: 2000,
                fueltype: 'gasoline',
                emissionsGKM: 160,
                transmission: 'manual',
                bodytype: 'wagon',
                color: 'green',
                doors: 5,
                seats: 5,
                vin: 'JF1GPAA69F8234567',
                maxspeedKMH: 210,
                weightKG: 1450,
                factoryExtras: 'roof rails, heated mirrors',
                features: 'symmetrical AWD, traction control',
                ownertoken: encryptedToken,
                images: JSON.stringify(["subaru-impreza.jpg"])
            }
        ];
        const carids = [];
        for (const car of defaultCars) {
            const insertCarQuery = `
                INSERT INTO cars (manufacturer, model, modelyear, odometerKM, efficiency, efficiencyunit,
                enginecapacityCC, fueltype, emissionsGKM, transmission, bodytype, color, doors, seats,
                vin, maxspeedKMH, weightKG, factoryExtras, features, ownertoken, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const carParams = [
                car.manufacturer, car.model, car.modelyear, car.odometerKM, car.efficiency, car.efficiencyunit,
                car.enginecapacityCC, car.fueltype, car.emissionsGKM, car.transmission, car.bodytype, car.color, car.doors, car.seats,
                car.vin, car.maxspeedKMH, car.weightKG, car.factoryExtras, car.features, car.ownertoken, car.images
            ];
            const [res] = await pool.query(insertCarQuery, carParams);
            carids.push(res.insertId);
        }
        // Create a default auction for each inserted car
        const defaultauctions = carids.map((id, idx) => ({
            carid: id,
            startingpriceUSD: 8000 + idx * 2000,
            reservepriceUSD: null,
            starttime: new Date(),
            endtime: new Date(Date.now() + idx * 1.5 * 24 * 60 * 60 * 1000), // 1.5, 3, 4.5... nap múlva jár le
            status: 'active',
            winner: null
        }));

        for (const auction of defaultauctions) {
            const insertAuctionQuery = `
                INSERT INTO auctions (carid, startingpriceUSD, reservepriceUSD, starttime, endtime, status, winner) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`;
            const auctionParams = [
                auction.carid, auction.startingpriceUSD, auction.reservepriceUSD, auction.starttime, auction.endtime, auction.status, auction.winner
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
