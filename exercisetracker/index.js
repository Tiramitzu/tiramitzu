const express = require("express");
const app = express();
const cors = require("cors");
const shortid = require("shortid");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

let users = [];
let exercises = [];

app.post("/api/users", (req, res) => {
    const username = req.body.username;

    if (!username) {
        return res.json({ error: "username is required" });
    }

    const _id = shortid.generate();

    const newUser = { username, _id };
    users.push(newUser);

    res.json(newUser);
});

app.get("/api/users", (req, res) => {
    res.json(users);
});

app.post("/api/users/:_id/exercises", (req, res) => {
    const user = users.find(user => user._id === req.params._id);

    if (!user) {
        return res.json({ error: "unknown _id" });
    }

    const { description, duration, date } = req.body;
    const exercise = {
        _id: user._id,
        username: user.username,
        description: description,
        duration: parseInt(duration),
        date: date || new Date().toDateString()
    };

    exercises.push(exercise);

    res.json(exercise);
});

app.get("/api/users/:_id/logs", (req, res) => {
    const user = users.find(user => user._id === req.params._id);

    if (!user) {
        return res.json({ error: "unknown _id" });
    }

    let log = exercises.filter(exercise => exercise._id === user._id);

    if (req.query.from) {
        log = log.filter(exercise => new Date(exercise.date) >= new Date(req.query.from));
    }

    if (req.query.to) {
        log = log.filter(exercise => new Date(exercise.date) <= new Date(req.query.to));
    }

    if (req.query.limit) {
        log = log.slice(0, req.query.limit);
    }

    res.json({
        _id: user._id,
        username: user.username,
        count: log.length,
        log: log
    });
});

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is listening on port " + listener.address().port);
});
