import { CheckAPIKey, CheckSessionToken } from "../Checkings";
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
    } else if (
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

module.exports = { PostCarHU, PostAuctionHU, PostBidHU };
