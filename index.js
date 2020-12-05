const express = require("express");
const app = express();
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const db = require("./db");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(csurf());

app.use((req, res, next) => {
    res.set("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    // console.log("----------------------------");
    // console.log(`${req.method} request coming in on route ${req.url}`);
    // console.log("----------------------------");
    next();
});

app.use(express.static("./public"));

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    if (req.session.registered) {
        res.redirect("/thanks");
    } else {
        res.render("petition");
    }
});

app.post("/petition", (req, res) => {
    const { first, last, signature } = req.body;
    db.addSignature(first, last, signature)
        .then(({ rows }) => {
            req.session.id = rows[0].id;
            req.session.registered = true;
            res.redirect("/thanks");
        })
        .catch(({ detail }) => {
            let errStr = detail.substr(22, detail.length - 3 - 22);
            let arr = errStr.split(",");
            let missingFirst = false;
            let missingLast = false;
            let missingSig = false;
            if (arr[1] == " ") {
                missingFirst = true;
            }
            if (arr[2] == " ") {
                missingLast = true;
            }
            if (arr[3] == "") {
                missingSig = true;
            }
            res.render("petition", {
                missingFirst,
                missingLast,
                missingSig,
            });
        });
});

app.get("/thanks", (req, res) => {
    if (!req.session.registered) {
        res.redirect("/petition");
    } else {
        db.howManyRegistered()
            .then(({ rows }) => {
                const numOfRegistered = rows[0].count;
                db.getSignature(req.session.id).then(({ rows }) => {
                    const usersig = rows[0].signature;
                    res.render("thanks", { numOfRegistered, usersig });
                });
            })
            .catch((err) => {
                console.error("error in db.howManyRegistered", err);
            });
    }
});

app.get("/signers", (req, res) => {
    if (!req.session.registered) {
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
