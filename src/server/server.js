const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const axios = require("axios");
const bodyParser = require("body-parser");
const crypto = require('crypto');
const lnurlPay = require("lnurl-pay");
const { setupAuth } = require("./auth.js");
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(expressLayouts);
app.use('/js', express.static('src/js'));
app.use(express.static('public'));

app.set("view engine", "ejs");
app.set("views", "src/views");

// Setup authentication, register routes & session handling
setupAuth(app);

// Functions from the second code
function generateRandomCode(length = 6) {
    return crypto.randomBytes(length).toString('hex');
}

function generateMd5(username, ref_id) {
    const apiKey = "";
    const dataToHash = username + apiKey + ref_id;
    return crypto.createHash('md5').update(dataToHash).digest('hex');
}

async function topUpGoPay(phoneNumber) {
    const username = "";
    const refId = "order" + generateRandomCode();
    const productCode = "go1";
    const sign = generateMd5(username, refId);

    const url = "https://prepaid.iak.dev/api/top-up";
    const payload = {
        username: username,
        customer_id: phoneNumber,
        ref_id: refId,
        product_code: productCode,
        sign: sign
    };

    const headers = { "Content-Type": "application/json" };
    const response = await axios.post(url, payload, { headers: headers });

    return response.data;
}

function setupPay(app) {
    app.post("/invoice", async function (req, res) {
        try {
            const phoneNumber = req.body.phoneNumber;

            const options = {
                method: 'POST',
                url: 'https://getalby.com/api/invoices',
                headers: {
                    'LIGHTNING-ADDRESS': process.env.ALBY_LIGHTNING_ADDRESS,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                data: { amount: req.body.amount, memo: req.body.comment ? req.body.comment : "" }
            };

            const result = await axios.request(options);

            if (result.data.settled) {
                const topUpResponse = await topUpGoPay(phoneNumber);
                console.log("Top Up Response:", topUpResponse);
            }

            res.json({
                payment_hash: result.data.payment_hash,
                payment_request: result.data.payment_request,
                qrCode: result.data.qr_code_svg,
            });
        } catch (e) {
            console.error(e);
            res.status(500).send("Internal Server Error");
        }
    });

    app.get("/invoice/:paymentHash", async function (req, res) {
        try {
            const request = await axios.get(
                `https://getalby.com/api/invoices/${req.params.paymentHash}`,
                {
                    headers: {
                        "Accept": "application/json",
                    },
                }
            );

            res.json({
                paid: request.data.settled,
            });
        } catch (e) {
            console.error(e);
            res.status(500).send("Internal Server Error");
        }
    });
}

// Setup payment APIs for invoice generation & more 🚀
setupPay(app);

app.get("/", function (req, res) {
    return res.render("pay", {
        user: req.user,
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
