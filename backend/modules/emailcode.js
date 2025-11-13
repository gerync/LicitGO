import mailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({ path: "EmailConfig.env" });
async function sendVerificationEmail(email, userId, type) {
  function random_code() {
    const min = 100000;
    const max = 999999;

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  const code = random_code();
  async function createEmailCode() {
    const expiresAt = new Date(Date.now() + 600000);
    await app.db.query(
      "INSERT INTO email_codes (user_id, code, expires_at, type) VALUES (?, ?, ?, ?)",
      [userId, code, expiresAt, type]
    );
  }

  if (!(type == "verification" || type == "password_reset")) {
    throw new Error("Invalid email code type");
  }
  await createEmailCode();
  if (type == "password_reset") {
    const nodemailer = mailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: '"LicitGO.eu" <no-reply@licitgo.eu>',
      to: email,
      subject: "Jelszó visszaállítás",
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
              <h2 style="color: #d9534f;">Jelszó visszaállítási kérelem</h2>
              <p style="color: #555;">Kérés érkezett a fiókjához tartozó jelszó visszaállítására. Kérjük, használja az alábbi kódot a folytatáshoz:</p>
              
              <div style="background-color: #f9f9f9; padding: 15px; text-align: center; border: 1px solid #eee; border-radius: 4px; margin: 20px 0;">
                  <strong style="font-size: 24px; color: #d9534f; letter-spacing: 2px;">${code}</strong>
              </div>
              
              <p style="color: #555;">**Figyelem:** Ez a kód **10 percig** érvényes. Ha nem Ön kezdeményezte a jelszó visszaállítást, kérjük, hagyja figyelmen kívül ezt az e-mailt.</p>
              
              <a 
                href="https://licitgo.eu/password-reset" 
                style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px;"
              >
                Jelszó visszaállítása
              </a>

              <p style="color: #888; font-size: 12px; margin-top: 30px;">Üdvözlettel,<br>A LicitGO.eu Csapat</p>
          </div>
          `,
    };
    await nodemailer.sendMail(mailOptions);
  }
  if (type == "verification") {
    const nodemailer = mailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: '"LicitGO.eu" <no-reply@licitgo.eu>',
      to: email,
      subject: "Regisztráció megerősítése",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333;">Tisztelt Felhasználó!</h2>
          <p style="color: #555;">Köszönjük, hogy regisztrált a LicitGO.eu oldalán. A regisztráció véglegesítéséhez szükséges kód:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; text-align: center; border: 1px solid #eee; border-radius: 4px; margin: 20px 0;">
              <strong style="font-size: 24px; color: #007bff; letter-spacing: 2px;">${code}</strong>
          </div>
          
          <p style="color: #555;">Ez a kód 10 percig érvényes. Kérjük, adja meg a weboldalon a fiókja aktiválásához.</p>
          
          <a href="https://licitgo.eu" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px;">
            LicitGO.eu megnyitása
          </a>

          <p style="color: #888; font-size: 12px; margin-top: 30px;">Üdvözlettel,<br>A LicitGO.eu Csapat</p>
    </div>
    `,
    };
    await nodemailer.sendMail(mailOptions);
  }
}
export { sendVerificationEmail };
