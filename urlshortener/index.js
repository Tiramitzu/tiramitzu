require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const dns = require("dns");
const cors = require("cors");
const app = express();
const urlDatabase = {};
let urlCounter = 1;

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
    res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
    res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", (req, res) => {
    const originalUrl = req.body.url;
    const urlPattern = /^(http|https):\/\/([^\/]+)(\/.*)?$/;

    if (!urlPattern.test(originalUrl)) {
        return res.json({ error: "invalid url" });
    }

    const hostname = originalUrl.match(urlPattern)[2];

    dns.lookup(hostname, err => {
        if (err) {
            return res.json({ error: "invalid url" });
        }

        const shortUrl = urlCounter++;
        urlDatabase[shortUrl] = originalUrl;

        res.json({
            original_url: originalUrl,
            short_url: shortUrl
        });
    });
});

app.get("/api/shorturl/:short_url", (req, res) => {
    const shortUrl = req.params.short_url;
    const originalUrl = urlDatabase[shortUrl];

    if (originalUrl) {
        res.redirect(originalUrl);
    } else {
        res.json({ error: "invalid url" });
    }
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
