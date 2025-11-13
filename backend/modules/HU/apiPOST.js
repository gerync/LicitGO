import { CheckAPIKey, CheckSessionToken, CheckFileType } from "../Checkings";
import { hash } from "argon2";
import { sendVerificationEmail } from "../emailcode.js";
async function PostCarHU(req, res) {
  const conn = await app.db.getConnection();
  if (!(await CheckAPIKey(req.headers["x-api-key"]))) {
    if (!(await CheckSessionToken(req.headers["x-session-token"]))) {
      conn.release();
      return res.status(401).json({ error: "Érvénytelen API kulcs vagy munkamenet token" });
    } else {
      main();
    }
  } else { main(); }
  async function main() {
    const files = req.files ? req.files["car_images"] : null;
    if (!files || files.length < 5) {
      conn.release();
      return res.status(400).json({ error: "Legalább 5 kép szükséges" });
    }
    else if (files.length > 50) {
      conn.release();
      return res.status(400).json({ error: "Maximum 50 kép tölthető fel" });
    }
    for (const file of files) {
      if (!CheckFileType(file)) {
        conn.release();
        return res.status(400).json({ error: "Érvénytelen fájltípus a feltöltött képek között" });
      }
    }
    const {
      manufacturer,
      model,
      odometerKM,
      model_year,
      efficiencyHP,
      efficiencyKW,
      engine_capacityCC,
      fuel_type,
      emissionsGKM,
      transmission,
      body_type,
      color,
      doors,
      seats,
      vin,
      max_speedKMH,
      zeroToHundredSec,
      weightKG,
      utility_features,
      safety_features,
      factoryExtras,
      owner_id,
      car_images,
      order_indexes,
    } = req.body;
    if (
      typeof req.body !== "object" ||
      req.body === null ||
      Object.keys(req.body).length != 22
    ) {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen kérés törzse" });
    } 
    else if (
      !manufacturer ||
      !model ||
      !odometerKM ||
      !model_year ||
      !efficiencyHP ||
      !efficiencyKW ||
      !engine_capacityCC ||
      !fuel_type ||
      !emissionsGKM ||
      !transmission ||
      !body_type ||
      !color ||
      !doors ||
      !seats ||
      !vin ||
      !max_speedKMH ||
      !zeroToHundredSec ||
      !weightKG ||
      !utility_features ||
      !safety_features ||
      !factoryExtras ||
      !owner_id ||
      !car_images ||
      !order_indexes
    ) {
      conn.release();
      return res.status(400).json({ error: "Hiányzó kötelező mezők" });
    } else if (
      !manufacturer ||
      manufacturer.length === 0 ||
      typeof manufacturer !== "string"
    ) {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen gyártó" });
    } else if (!model || model.length === 0 || typeof model !== "string") {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen modell" });
    } else if (
      isNaN(odometerKM) ||
      odometerKM < 0 ||
      typeof odometerKM !== "number" ||
      odometerKM % 1 !== 0
    ) {
      conn.release();
      return res
        .status(400)
        .json({ error: "Érvénytelen óraállás (odometerKM)" });
    } else if (
      isNaN(model_year) ||
      model_year < 1900 ||
      typeof model_year !== "number" ||
      model_year % 1 !== 0 ||
      model_year > new Date().getFullYear() + 1
    ) {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen gyártási év" });
    } else if (
      isNaN(engine_capacityCC) ||
      engine_capacityCC <= 0 ||
      typeof engine_capacityCC !== "number" ||
      engine_capacityCC % 1 !== 0
    ) {
      conn.release();
      return res
        .status(400)
        .json({ error: "Érvénytelen motor térfogata (CC)" });
    } else if (!color || color.length === 0 || typeof color !== "string") {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen szín" });
    } else if (
      isNaN(doors) ||
      doors <= 0 ||
      typeof doors !== "number" ||
      doors % 1 !== 0 ||
      doors > 7
    ) {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen ajtók száma" });
    } else if (
      isNaN(seats) ||
      seats <= 0 ||
      typeof seats !== "number" ||
      seats % 1 !== 0 ||
      seats > 9
    ) {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen ülések száma" });
    } else if (!vin || vin.length !== 17 || typeof vin !== "string") {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen VIN" });
    } else if (
      isNaN(owner_id) ||
      owner_id <= 0 ||
      typeof owner_id !== "number" ||
      owner_id % 1 !== 0
    ) {
      conn.release();
      return res
        .status(400)
        .json({ error: "Érvénytelen tulajdonos azonosító" });
    } else if (
      !req.files ||
      !req.files["car_images"] ||
      req.files["car_images"].length === 0
    ) {
      conn.release();
      return res.status(400).json({ error: "Legalább egy autókép szükséges" });
    } else if (
      Array.isArray(order_indexes) &&
      order_indexes.length !== req.files["car_images"].length
    ) {
      conn.release();
      return res.status(400).json({
        error: "A sorrendindexek számának meg kell egyeznie a képek számával",
      });
    } else {
      const currentTime = new Date();
      try {
        const [carU] = await app.db.query(
          `INSERT INTO cars
        (manufacturer, model, odometerKM, model_year, efficiencyHP, efficiencyKW, 
        engine_capacityCC, fuel_type, emissionsGKM, transmission, body_type, color, doors, seats, vin, max_speedKMH, zeroToHundredSec, 
        weightKG, utility_features, safety_features, factoryExtras, owner_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            manufacturer,
            model,
            odometerKM,
            model_year,
            efficiencyHP,
            efficiencyKW,
            engine_capacityCC,
            fuel_type,
            emissionsGKM,
            transmission,
            body_type,
            color,
            doors,
            seats,
            vin,
            max_speedKMH,
            zeroToHundredSec,
            weightKG,
            utility_features,
            safety_features,
            factoryExtras,
            owner_id,
          ]
        );
        await app.db.query(`INSERT INTO logs (user_id, action_type, action_details, action_time) VALUES (?, ?, ?, ?)`, [ owner_id, 'car_added', `Car ID: ${carU.insertId}`, currentTime ]);
        for (let i = 0; i < req.files["car_images"].length; i++) {
          const file = req.files["car_images"][i];
          const order_index = Array.isArray(order_indexes)
            ? parseInt(order_indexes[i], 10)
            : parseInt(order_indexes, 10);
          await app.db.query(
            `INSERT INTO car_images (car_id, file_path, order_index, uploaded_at) VALUES (?, ?, ?, ?)`,
            [carU.insertId, file.path, order_index, currentTime]
          );
        }
        conn.release();
        return res
          .status(201)
          .json({ message: "Autó sikeresen hozzáadva", carId: carU.insertId });
      } catch (error) {
        console.error("Hiba tortent az auto hozzaadasa kozben:", error);
        conn.release();
        return res.status(500).json({ error: "Belső szerverhiba" });
      }
    }
  }
}
async function PostAuctionHU(req, res) {
  const conn = await app.db.getConnection();
  if (!(await CheckAPIKey(req.headers["x-api-key"]))) {
    if (!(await CheckSessionToken(req.headers["x-session-token"]))) {
      conn.release();
      return res.status(401).json({ error: "Érvénytelen API kulcs vagy munkamenet token" });
    } else {
      main();
    }
  } else { main(); }
  async function main() {
    const { car_id, starting_price, reserve_price, start_time, end_time, status } = req.body;
    if ( typeof req.body !== "object" || req.body === null || Object.keys(req.body).length !== 6 ) {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen kérés törzse" });
    } 
    else if ( !car_id || !starting_price || !start_time || !end_time || !status) {
      conn.release();
      return res.status(400).json({ error: "Hiányzó kötelező mezők" });
    }
    else if ( isNaN(car_id) || car_id <= 0 || typeof car_id !== "number" || car_id % 1 !== 0 ) {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen car_id" });
    } 
    else if ( isNaN(starting_price) || starting_price < 0 || typeof starting_price !== "number" ) {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen kezdőár" });
    } else if ( reserve_price && (isNaN(reserve_price) || reserve_price < 0 || typeof reserve_price !== "number") ) {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen tartalékár" });
    }
    else if (!start_time || isNaN(new Date(start_time).getTime())) {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen kezdési idő" });
    }
    else if (!end_time || isNaN(new Date(end_time).getTime())) {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen befejezési idő" });
    }
    else if ( !["upcoming", "active"].includes(status) ) {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen státusz" });
    } else {
      try {
        const [result] = await app.db.query(
          `INSERT INTO auctions
          (car_id, starting_price, reserve_price, start_time, end_time, status)
          VALUES (?, ?, ?, ?, ?, ?)`,
          [car_id, starting_price, reserve_price, start_time, end_time, status]
        );
        conn.release();
        return res.status(201).json({
          message: "Aukció sikeresen létrehozva",
          auctionId: result.insertId,
        });
      } catch (error) {
        console.error("Hiba tortent az aukcio letrehozasa kozben:", error);
        conn.release();
        return res.status(500).json({ error: "Belső szerverhiba" });
      }
    }
  }
}
async function PostBidHU(req, res) {
  const conn = await app.db.getConnection();
  if (!(await CheckAPIKey(req.headers["x-api-key"]))) {
    if (!(await CheckSessionToken(req.headers["x-session-token"]))) {
      conn.release();
      return res
        .status(401)
        .json({ error: "Érvénytelen API kulcs vagy munkamenet token" });
    } else {
      main();
    }
  } 
  else { main(); }


  async function main() {
    const { auction_id, bidder_id, bid_amount } = req.body;
    if (
      typeof req.body !== "object" ||
      req.body === null ||
      Object.keys(req.body).length !== 3
    ) {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen kérés törzse" });
    } else if (!auction_id || !bidder_id || !bid_amount) {
      conn.release();
      return res.status(400).json({ error: "Hiányzó kötelező mezők" });
    } else if (
      isNaN(auction_id) ||
      auction_id <= 0 ||
      typeof auction_id !== "number" ||
      auction_id % 1 !== 0
    ) {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen aukció azonosító" });
    } else if (
      isNaN(bidder_id) ||
      bidder_id <= 0 ||
      typeof bidder_id !== "number" ||
      bidder_id % 1 !== 0
    ) {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen licitáló azonosító" });
    } else if (
      isNaN(bid_amount) ||
      bid_amount <= 0 ||
      typeof bid_amount !== "number"
    ) {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen licit összeg" });
    } else {
      if (
        !(await app.db
          .query("SELECT id FROM auctions WHERE id = ?", [auction_id])
          .then(([rows]) => rows.length > 0))
      ) {
        conn.release();
        return res.status(404).json({ error: "Aukció nem található" });
      } else if (
        !(await app.db
          .query("SELECT id FROM users WHERE id = ?", [bidder_id])
          .then(([rows]) => rows.length > 0))
      ) {
        conn.release();
        return res
          .status(404)
          .json({ error: "Licitáló felhasználó nem található" });
      }
      const [highestBidRows] = await app.db.query(
        "SELECT MAX(bid_amount) AS highest_bid FROM bids WHERE auction_id = ?",
        [auction_id]
      );
      const highestBid = highestBidRows[0].highest_bid || 0;
      if (bid_amount <= highestBid) {
        conn.release();
        return res.status(400).json({
          error:
            "A licit összegnek nagyobbnak kell lennie a jelenlegi legmagasabb licitnél",
        });
      }
      try {
        const [result] = await app.db.query(
          `INSERT INTO bids (auction_id, bidder_id, bid_amount) VALUES (?, ?, ?)`,
          [auction_id, bidder_id, bid_amount]
        );
        conn.release();
        return res
          .status(201)
          .json({ message: "Licit sikeresen leadva", bidId: result.insertId });
      } catch (error) {
        console.error("Hiba történt a licit leadása közben:", error);
        conn.release();
        return res.status(500).json({ error: "Belső szerverhiba" });
      }
    }
  }
}
async function RegisterHU(req, res) {
  const conn = await app.db.getConnection();
  const { usertag, display_name, password_hash, email, fullname, mobile, gender} = req.body;
  const birth_date = new Date(req.body.birth_date);
  const profile_picture = req.file;

  if (typeof req.body !== 'object' || req.body === null || Object.keys(req.body).length != 8) {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen kérés törzse' });
  }
  else if (!usertag || !display_name || !password_hash || !email || !fullname || !mobile || !gender || !birth_date) {
    conn.release();
    return res.status(400).json({ error: 'Hiányzó kötelező mezők' });
  }
  else if (typeof usertag !== 'string' || typeof display_name !== 'string' || typeof password_hash !== 'string' || typeof email !== 'string' || typeof fullname !== 'string' || typeof mobile !== 'string' || typeof gender !== 'boolean' || !(birth_date instanceof Date)) {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen mezőtípusok' });
  }
  else if (usertag.length < 3 || usertag.length > 32) {
    conn.release();
    return res.status(400).json({ error: 'A usertag hossza 3 és 32 karakter között kell legyen' });
  }
  else if (display_name.length < 3 || display_name.length > 100) {
    conn.release();
    return res.status(400).json({ error: 'A megjelenítendő név hossza 3 és 100 karakter között kell legyen' });
  }
  else if (password_hash.length < 8 || password_hash.length > 64) {
    conn.release();
    return res.status(400).json({ error: 'A jelszó hossza 8 és 64 karakter között kell legyen' });
  }
  else if (/\s/.test(password_hash)) {
    conn.release();
    return res.status(400).json({ error: 'A jelszó nem tartalmazhat szóközöket' });
  }
  else if (!/[A-Z]/.test(password_hash) || !/[a-z]/.test(password_hash) || !/[0-9]/.test(password_hash) || !/[!@#$%^&*(),.?":{}|<>]/.test(password_hash)) {
    conn.release();
    return res.status(400).json({ error: 'A jelszónak tartalmaznia kell legalább egy nagybetűt, egy kisbetűt, egy számot és egy speciális karaktert' });
  }
  else if (email.length < 5 || email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen e-mail cím' });
  }
  else if (fullname.length < 3 || fullname.length > 150) {
    conn.release();
    return res.status(400).json({ error: 'A teljes név hossza 3 és 150 karakter között kell legyen' });
  }
  else if (mobile.length < 6 || mobile.length > 30 || !/^\+?[0-9\s\-()]+$/.test(mobile)) {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen telefonszám' });
  }
  else if (isNaN(birth_date.getTime()) || birth_date > new Date()) {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen születési dátum' });
  }
  else if (profile_picture && !CheckFileType(profile_picture)) {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen fájltípus a profilképhez' });
  }
  else if (await app.db.query('SELECT id FROM users WHERE usertag = ?', [usertag]).then(([rows]) => rows.length > 0)) {
    conn.release();
    return res.status(409).json({ error: 'A usertag már használatban van' });
  }
  else if (await app.db.query('SELECT id FROM users WHERE email = ?', [email]).then(([rows]) => rows.length > 0)) {
    conn.release();
    return res.status(409).json({ error: 'Az e-mail cím már használatban van' });
  }
  else if (await app.db.query('SELECT id FROM users WHERE mobile = ?', [mobile]).then(([rows]) => rows.length > 0)) {
    conn.release();
    return res.status(409).json({ error: 'A telefonszám már használatban van' });
  }

  else {
    try {
      const hpassword = await hash(password_hash);
      const [result] = await app.db.query(
        'INSERT INTO users (usertag, display_name, password_hash, email, fullname, mobile, gender, birth_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [usertag, display_name, hpassword, email, fullname, mobile, gender, birth_date]
      );
      if (profile_picture) {
              const profilePicturePath = path.join(__dirname, '../uploads/profiles', profile_picture.filename);
              fs.renameSync(profile_picture.path, profilePicturePath);
              await app.db.query('UPDATE users SET profile_picture = ? WHERE id = ?', [profilePicturePath, result.insertId]);
        }
      await sendVerificationEmail(email, result.insertId, "verification");
      conn.release();
      return res.status(201).json({ message: 'Felhasználó sikeresen regisztrálva', userId: result.insertId });
    } catch (error) {
      console.error('Hiba tortent a felhasznalo regisztracioja kozben:', error);
      await conn.release();
      return res.status(500).json({ error: 'Belső szerverhiba' });
    }
  }
}
async function PasstempcodeHU(req, res) {
  const conn = await app.db.getConnection();
  const { info } = req.body;
  if (typeof req.body !== 'object' || req.body === null || Object.keys(req.body).length < 1) {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen kérés törzse' });
  }
  else if (!info) {
    conn.release();
    return res.status(400).json({ error: 'Hiányzó kötelező mező' });
  }
  else {
    try {
      let user;
      [user] = await app.db.query('SELECT id, email FROM users WHERE (email = ? OR phone = ? OR usertag = ?)', [info, info, info]);
      if (user.length === 0) {
        conn.release();
        return res.status(404).json({ error: 'Felhasználó nem található' });
      }
      await sendVerificationEmail(user[0].email, user[0].id, "password_reset");
      conn.release();
      return res.status(200).json({ message: 'Jelszó visszaállító kód elküldve az e-mail címre' });
    } catch (error) {
      console.error('Hiba tortent a jelszo visszaallito kod kuldese kozben:', error);
      conn.release();
      return res.status(500).json({ error: 'Belső szerverhiba' });
    }
  }
}
async function ResetPassword(req, res) {
    const conn = await app.db.getConnection();
    const { code, newPassword } = req.body;
    if (typeof req.body !== 'object' || req.body === null || Object.keys(req.body).length < 1) {
      conn.release();
      return res.status(400).json({ error: 'Érvénytelen kérés törzse' });
    }
    else if (!code) {
      conn.release();
      return res.status(400).json({ error: 'Hiányzó kötelező mező' });
    }
    else {
      try {
        let emailCode;
        [emailCode] = await app.db.query('SELECT id, user_id, expires_at, type FROM email_codes WHERE (code = ? AND type = "password_reset" AND expires_at > NOW())', [code]);
        if (emailCode.length === 0) {
          conn.release();
          return res.status(404).json({ error: 'Érvénytelen kód' });
        }
        if (!newPassword || typeof newPassword !== 'string') {
          conn.release();
          return res.status(400).json({ error: 'Érvénytelen új jelszó' });
        }
        if (newPassword.length < 8) {
          conn.release();
          return res.status(400).json({ error: 'Az új jelszónak legalább 8 karakter hosszúnak kell lennie' });
        }
        if (newPassword.length > 64) {
          conn.release();
          return res.status(400).json({ error: 'Az új jelszó nem lehet hosszabb 64 karakternél' });
        }
        if (/\s/.test(newPassword)) {
          conn.release();
          return res.status(400).json({ error: 'Az új jelszó nem tartalmazhat szóközöket' });
        }
        if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
          conn.release();
          return res.status(400).json({ error: 'Az új jelszónak tartalmaznia kell legalább egy nagybetűt, egy kisbetűt, egy számot és egy speciális karaktert' });
        }
        const hpassword = await hash(newPassword);
        await app.db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hpassword, emailCode[0].user_id]);
        await app.db.query('DELETE FROM email_codes WHERE id = ?', [emailCode[0].id]);
        conn.release();
        return res.status(200).json({ message: 'Jelszó sikeresen frissítve' });
      } catch (error) {
        console.error('Hiba tortent a jelszo frissitese kozben:', error);
        conn.release();
        return res.status(500).json({ error: 'Belső szerverhiba' });
      }
    }
}
exports = { PostCarHU, PostAuctionHU, PostBidHU, RegisterHU, PasstempcodeHU, ResetPassword };