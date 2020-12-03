const express = require("express");
const app = express();
const hb = require("express-handlebars");
const cookieParser = require("cookie-parser");
const db = require("./db");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(cookieParser());

app.use((req, res, next) => {
    console.log("----------------------------");
    console.log(`${req.method} request coming in on route ${req.url}`);
    console.log("----------------------------");
    next();
});

app.use(express.static("./public"));

app.get("/petition", (req, res) => {
    if (req.cookies.registered == "true") {
        res.redirect("/thanks");
    } else {
        res.render("petition");
    }
});

app.post("/petition", (req, res) => {
    const { first, last } = req.body;
    db.addSignature(first, last)
        .then(() => {
            res.cookie("registered", true);
            res.redirect("/thanks");
        })
        .catch(() => {
            res.render("petition", {
                missingInfo: true,
            });
        });
});

app.get("/thanks", (req, res) => {
    if (req.cookies.registered != "true") {
        res.redirect("/petition");
    } else {
        db.howManyRegistered()
            .then(({ rows }) => {
                const numOfRegistered = rows[0].count;
                res.render("thanks", { numOfRegistered });
            })
            .catch((err) => {
                console.error("error in db.howManyRegistered", err);
            });
    }
});

// GET /signers

//     redirect users to /petition if there is no cookie (this means they haven't signed yet & should not see this page!)
//     SELECT first and last values of every person that has signed from the database and pass them to signers.handlebars
//     SELECT the number of people that have signed the petition from the db → I recommend looking into what COUNT can do for you here ;)

app.get("/signers", (req, res) => {
    if (req.cookies.registered != "true") {
        res.redirect("/petition");
    } else {
        db.allSigners()
            .then(({ rows }) => {
                res.render("signers", { rows });
            })
            .catch((err) => {
                console.error("error in db.allSigners", err);
            });
    }
});

app.listen(8080, () => console.log("petition server running on 8080"));
