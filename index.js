const express = require('express');
const axios = require('axios');
const app = express();

const DEVELOPER = "CY_AGNT";

// ✅ Public Endpoint (No Key System)
app.get('/bin/:bin', async (req, res) => {
    const { bin } = req.params;

    // Basic validation
    if (!bin || bin.length < 6) {
        return res.status(400).json({
            Status: "FAILED",
            Developer: DEVELOPER,
            Message: "Invalid BIN (minimum 6 digits required)"
        });
    }

    try {
        const response = await axios.get(`https://data.handyapi.com/bin/${bin}`);
        const data = response.data;

        res.json({
            Developer: DEVELOPER,
            Status: data.Status || "SUCCESS",
            BIN_Data: {
                BIN: bin,
                Scheme: data.Scheme || "N/A",
                Type: data.Type || "N/A",
                Issuer: data.Issuer || "N/A",
                CardTier: data.CardTier || "N/A",
                Country: {
                    A2: data.Country?.A2 || "N/A",
                    A3: data.Country?.A3 || "N/A",
                    N3: data.Country?.N3 || "N/A",
                    ISD: data.Country?.ISD || "N/A",
                    Name: data.Country?.Name || "N/A",
                    Cont: data.Country?.Cont || "N/A"
                },
                Luhn: data.Luhn ?? false
            }
        });

    } catch (error) {
        res.status(500).json({
            Status: "FAILED",
            Developer: DEVELOPER,
            Message: "Invalid BIN or API Error"
        });
    }
});

module.exports = app;
