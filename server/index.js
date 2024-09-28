const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 8000;

// let salt_key = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
let salt_key = "96434309-7796-489d-8924-ab56988a6076";
let merchant_id = "PGTESTPAYUAT86";

app.post("/order", async (req, res) => {
    try {
        let merchantTransactionId = req.body.transactionId;

        const data = {
            merchantId: merchant_id,
            merchantTransactionId: merchantTransactionId,
            name: req.body.name,
            amount: req.body.amount * 100, // Amount in paisa
            redirectUrl: `http://localhost:8000/status?id=${merchantTransactionId}`,
            redirectMode: "POST",
            mobileNumber: req.body.number,
            paymentInstrument: {
                type: "PAY_PAGE",
            },
        };

        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString("base64");
        const keyIndex = 1;
        const apiPath = "/pg/v1/pay";
        const string = payloadMain + apiPath + salt_key;
        const sha256 = crypto.createHash("sha256").update(string).digest("hex");
        const checksum = sha256 + "###" + keyIndex;
        const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox" + apiPath;

        const options = {
            method: "POST",
            url: prod_URL,
            headers: {
                accept: "application/json",
                "Content-Type": "application/json",
                "X-Verify": checksum,
                "X-Merchant-Id": merchant_id, // Missing merchant ID in headers
            },
            data: {
                request: payloadMain,
            },
        };

        const response = await axios(options);
        return res.json(response.data);
    } catch (error) {
        console.error("Error occurred: ", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.post("/status",(req,res)=>{
    const merchantTransactionId = req.query.id;
    const merchantId = merchant_id;
    const keyIndex =1
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}${salt_key}`;
    const sha256 = crypto.createHash('sha256').update(string).digest("hex");
    const checksum = sha256+"###"+keyIndex;
    const options = {
        method: "GET",
        url:`https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "X-Verify": checksum,
            "X-Merchant-Id": merchant_id
        }
    }
    axios.request(options).then((response)=>{
        if (response.data.success == true) {
            const url = "https://algorithm-visualizer.org/backtracking/hamiltonean-cycles" //url for success
            // return res.redirect(url)

            res.send("Payment Done Successfully");
            res.end();
        }
        else{
            const url = "" //url for fail
            // return res.redirect(url)

            res.send("Payment Unsucessfull");
            res.end();
        }
    })

})

app.listen(PORT, () => {
    console.log("Server is listening on PORT " + PORT);
});
