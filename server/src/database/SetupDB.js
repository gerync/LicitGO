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
    }
    const [carRows] = await pool.query('SELECT COUNT(*) AS count FROM auctions WHERE endtime > NOW()');
    if (carRows[0].count === 0) {
        const [userRows] = await pool.query('SELECT usertoken FROM users WHERE type = ?', ['superadmin']);
        const encryptedToken = userRows.length > 0 ? userRows[0].usertoken : null;
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
                images: JSON.stringify([
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.Bft4vJHz9arpyg55QIzrGgHaDt%3Fpid%3DApi&f=1&ipt=f1e2cf6fa42de3d938d09c8c64c6d62a73ffb8b8d8b083af9d5b40e45da6138b&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.tLy7FttyAEMaCbIZQzKcFAHaD4%3Fpid%3DApi&f=1&ipt=8339b698ba09d1ac4bd97a50f8380a7c731b677afaaa7e5e6f1b557b9a8692b0&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.64Me_2l4fVbX3B1zPe5twgHaEK%3Fpid%3DApi&f=1&ipt=f2a2ca7193a3631b8cd2f1fd22eb4324297f958c33bd4912baf34ee710b4a755&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.YCOCNmfi5RIGiOE_Qgv8PAHaDV%3Fpid%3DApi&f=1&ipt=c5e8362f8a62648832ce48776414ad6f233c4d1bcaadc72b1657af28be9e9e77&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.NtqIXct5pTf4-0LZPUJxpwHaEK%3Fpid%3DApi&f=1&ipt=af562d820fe4df526e32ca03767b673a08f55667836d026d26970275a49567fb&ipo=images"
                ])
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
                images: JSON.stringify([
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%2Fid%2FOIP.Wc31OEY-7hZ8hwOJXSur7wHaD9%3Fpid%3DApi&f=1&ipt=c1cf21ec3831d9911380c37d192adebfc340dca3d49e693ae4d0db6803a22867&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%2Fid%2FOIP.d-kMExxM2qk94f6OelZngAHaE8%3Fpid%3DApi&f=1&ipt=8dc52965455f2a3ede5ceda6ca8f63be78be7ecd3d118307ec0c48c6f377badc&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%2Fid%2FOIP.dEIeV_j-DLl15X95wup4WgHaEK%3Fpid%3DApi&f=1&ipt=80609d2b6d2866269f8ab34bbc28be4e272a3792320b0702987180c173e91ed8&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%2Fid%2FOIP.kOnwKoZYvavuLZg-jYm-0QHaE8%3Fpid%3DApi&f=1&ipt=0ef2267f5ba7df9b7cec5968528dbc5083926ede5b2eeaecb4bf0c51a7de38bd&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.6shLD_wnSsHtG9S20sbQLAHaE8%3Fpid%3DApi&f=1&ipt=3f39ed745864ac57a7155b9fd72a1b4f59abb644fdb865932f38481559727651&ipo=images"
                ])
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
                images: JSON.stringify([
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.boaSnhUmeJWdBjmpa7dSsgHaEa%3Fpid%3DApi&f=1&ipt=6addf9a02a9a28227963edab2db7bf46a62e3e69271ea9e2c60c43e5468ed8d1&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.2gk35eahEVz5qDqc7I9q0wHaE8%3Fpid%3DApi&f=1&ipt=08db2c7c3f55cd7153ec17c3d165d07b8c87dc776633cfa0b4922821c265bf33&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.NxmNM1W147OUYUla4wwISwHaEe%3Fpid%3DApi&f=1&ipt=e19b8d2b11eda9c1c7fa5462653183561daf60de28984cbe38b8ae5f9d2904ba&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%2Fid%2FOIP.pI_Wt-gvyUGtpce_xn3MYwHaEK%3Fpid%3DApi&f=1&ipt=460428d8966b642f8f83477691f4efb5b9d73d01551dbee0ae9ce8c534717082&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%2Fid%2FOIP.sx_7Ds44QS7brIccMQdRxQHaEo%3Fpid%3DApi&f=1&ipt=26c1ab1c83e192517b2ed8c43a93ce61fb7009036c5d6b837f65e29ce003b0d2&ipo=images"
                ])
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
                images: JSON.stringify([
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%2Fid%2FOIP.fzgZhCyInYXdXGwvUXWUkQHaEK%3Fpid%3DApi&f=1&ipt=22fb75f23b58386543a534db0787b74abeccae7556758e9cec515217f0e275c0&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%2Fid%2FOIP.c3mg7kkZJfs5zkCx-quC2QHaEK%3Fpid%3DApi&f=1&ipt=4668deb0d519053aef8742953ff55b606d694e4ec7eddc823f22bd8d4beed94d&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.MCslsP-VGa-JWuBnXA43qQHaFK%3Fpid%3DApi&f=1&ipt=d99a2bed3d7b36f647c287c2034acb1afc64a44b9ba3dc9b446b01537b09fc77&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%2Fid%2FOIP._yCx8WQ13_USHKgqSm_UoQAAAA%3Fpid%3DApi&f=1&ipt=b51044f9acaa5bfb1202b397e0eb69059092192242690de78866eb3708f8e060&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.zCWu8ry77qHYAlAMBLNzUwHaEK%3Fpid%3DApi&f=1&ipt=48b02e98684e525c7123f3f5babb7666a9386a4379d27d0cd25ab93588f02490&ipo=images"
                ])
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
                images: JSON.stringify([
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%2Fid%2FOIP.T0lPnqXce6rwIYeslW46PgHaE8%3Fpid%3DApi&f=1&ipt=c30b8652f4b52eab1373344e592d73d068367fe317d6618195caf9667f9aa78e&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.XhRonE6zYNmmkT2vndD7cAHaE8%3Fpid%3DApi&f=1&ipt=ab08894f30673702d44139a28b0bd7416824b4f2832c8bb5df1f1d04eb72e6d5&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.Z_glDrk46RzlPzNXwRcJGAHaE8%3Fpid%3DApi&f=1&ipt=e377f13161f92ce3b708f27ae33623b8336f3113b72ba95cda6d1b219259cc91&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.6f_JCCjHibt0Wf5-mBw0fgHaE8%3Fpid%3DApi&f=1&ipt=2b393ae060a6e8b32327007a23bd0bf7bfe0a0c78a2ed7d72e5ddc4d02bbfc0b&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.kgCGnV3JwhlCS40OaTo9gwHaF-%3Fpid%3DApi&f=1&ipt=fc7f122355c141413479d434533cb23cb0c7348315c597c422ebc50f0a598cd4&ipo=images"
                ])
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
                images: JSON.stringify([
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%2Fid%2FOIP.n4LPGwUhJ-axgiMGYfOgkgHaEK%3Fpid%3DApi&f=1&ipt=67bad696d59258c7bec5ed6c96e2a9eab9f6ca92ca3c0037ac698b0c317d5a53&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%2Fid%2FOIP.AqXLHfs50Z2uQZ7OqZoMeAHaE8%3Fpid%3DApi&f=1&ipt=78a0699143fd7e0f284aae1ebf75c1dbf61d61abdb42e5433efdb4dcf6672136&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%2Fid%2FOIP.-pi7L-SJR1FWEOEjK1o6GwHaDt%3Fpid%3DApi&f=1&ipt=1f770d873233b195b23d2b97aff58bea072be89c9acfd970408976f6590c4602&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%2Fid%2FOIP.lpQyvfgUHVRlyjeEExaqRAHaEK%3Fpid%3DApi&f=1&ipt=bf0ce07330b5b5443238aa7ea682b5e75db276568c92a7ca7d62cea6d92df64f&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%2Fid%2FOIP.O9VtGCopjXlWdqe-sByvmQHaFJ%3Fpid%3DApi&f=1&ipt=94a66653aaab85528b5ae7cdee417c4358473724be62ff7fc53a1c7b22d077ca&ipo=images"
                ])
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
                images: JSON.stringify([
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%2Fid%2FOIP.QXhMBqkrRw77Z8drP3mLdAHaE8%3Fpid%3DApi&f=1&ipt=aa18a6c4e2a74ea3673f42ba211f1277c48a05606092b6f4b5d9352674da867d&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%2Fid%2FOIP.VHTaYCVMQIAfaL2RaXem-wHaE6%3Fpid%3DApi&f=1&ipt=0ecc617cf87b0df9795c1955bd13293c58bd0b69917771991edd74712826022a&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.W2VS-B5FZPS769cvh2XQIAHaE6%3Fpid%3DApi&f=1&ipt=578ae5172a49d75a70e6737a2878af75f36abeb5e70b0b4ab0f182a89a0c76e3&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%2Fid%2FOIP.6yRqebGOXXe9O09GWBh7SQHaE7%3Fpid%3DApi&f=1&ipt=90a9b5e0b22c101148c39d703319538910ab368f4e1b8fe2e510761b620bfe84&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.fYoh_aDkjEnjPe1tC2SO6gHaD4%3Fpid%3DApi&f=1&ipt=23ed6efa73aed406b0a08aedf194b6e1a315d30b654722e19b11610d0a39aac5&ipo=images"
                ])
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
                images: JSON.stringify([
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%2Fid%2FOIP.VmJ2ZoGW6UhBvjkt3h3BTwHaE8%3Fpid%3DApi&f=1&ipt=4d23ef0ff63a347e4c246cbac63b5dc42297f61fca7b8b70147c1b567408ef15&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%2Fid%2FOIP.vMJFqtikQl88Q__eI-aNmwHaEK%3Fpid%3DApi&f=1&ipt=23d0f9aa7877015a4530893f34336d2342ace130c65208db1bb05b24b0b66819&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%2Fid%2FOIP.43JgbAJjLvFwxc4uYEN7hwHaE8%3Fpid%3DApi&f=1&ipt=9cd717a315c68c0400f63bc024debd61662f4031f2808fe9c26ff9bd19f91fda&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.XGimLGqg5X4NOw4SBOrIMQHaEK%3Fpid%3DApi&f=1&ipt=9e76a8103a1ac2e383984c90137f6a6f878107daecb72de63b82ceb1a6cec5d6&ipo=images",
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%2Fid%2FOIP.U8Y8ZISgDFEbQXKl3GQBNQHaEK%3Fpid%3DApi&f=1&ipt=8407281083607a98df34603119724f85ca2a01dbb6464ad2a3261986e9ec9d97&ipo=images"
                ])
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
