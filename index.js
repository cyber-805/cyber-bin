const express = require('express');
const axios = require('axios');
const app = express();

const DEVELOPER = "CY_AGNT";

// 3 Keys with Details
const API_KEYS = {
    "CYBER_OWNER": { owner: "User1", expiry: "2026-12-31", limit: 900000000000 },
    "EXR&DEBA": { owner: "User2", expiry: "2026-12-15", limit: 169 },
    "CYBER_TEST": { owner: "Guest", expiry: "2026-04-29", limit: 69 }
};

const usageMap = new Map();

app.get('/api/bin/:bin', async (req, res) => {
    const { bin } = req.params;
    const { key } = req.query;
    const today = new Date().toDateString();

    // 1. Key Validation
    if (!key || !API_KEYS[key]) {
        return res.status(401).json({ Status: "FAILED", Developer: DEVELOPER, Message: "Invalid Key!" });
    }

    const keyInfo = API_KEYS[key];

    // 2. Expiry Check
    if (new Date() > new Date(keyInfo.expiry)) {
        return res.status(403).json({ Status: "FAILED", Developer: DEVELOPER, Message: "Key Expired!" });
    }

    // 3. Limit Check
    const userKey = `${key}-${today}`;
    const currentUsage = usageMap.get(userKey) || 0;
    if (currentUsage >= keyInfo.limit) {
        return res.status(429).json({ Status: "FAILED", Message: "Daily Limit Reached!" });
    }

    try {
        const response = await axios.get(`https://data.handyapi.com/bin/${bin}`);
        const data = response.data;
        usageMap.set(userKey, currentUsage + 1);

        // 4. FULL RESPONSE (Merging Everything)
        res.json({
            Dev: DEVELOPER,
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
        res.status(500).json({ Status: "FAILED", Message: "Invalid BIN or API Error" });
    }
});

module.exports = app;
