const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const { setupAuth } = require("./auth.js");
const { setupPay } = require("./pay.js");
const { exec } = require("child_process"); // Impor modul child_process
require('dotenv').config();

// Validate configuration
if (!process.env.ALBY_LIGHTNING_ADDRESS) {
  console.error(
    "You need to configure your environment variables first. Check out the README file!"
  );
  process.exit(1);
}

const app = express();

app.use(bodyParser.json());

app.use(expressLayouts);
app.use('/js', express.static('src/js'));
app.use(express.static('public'));

app.set("view engine", "ejs");
app.set("views", "src/views");

// Setup authentication, register routes & session handling
setupAuth(app);

// Setup payment APIs for invoice generation & more 🚀
setupPay(app);

// Your application routes go here 👇
app.get("/", function (req, res) {
  return res.render("index", {
    user: req.user
  });
});

app.get("/pay", function (req, res) {
  return res.render("pay", {
    user: req.user,
  });
});

app.get("/scroll", function (req, res) {
  return res.render("scroll", {
    user: req.user
  });
});

// Rute baru untuk menjalankan iak.py
app.post("/run-iak", (req, res) => {
    const phoneNumber = req.body.phoneNumber;
    if (phoneNumber) {
        exec(`python3 iak.py ${phoneNumber}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return res.json({ success: false, message: "Terjadi kesalahan saat menjalankan iak.py" });
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
            res.json({ success: true, message: "iak.py berhasil dijalankan!" });
        });
    } else {
        res.json({ success: false, message: "Nomor ponsel tidak diberikan" });
    }
});

// Start express on the defined port
app.listen(process.env.PORT || 3000, () =>
  console.log(`🚀 Server running on port ${process.env.PORT || 3000}`)
);
