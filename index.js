const express = require("express");
const app = express();
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const { hash, compare } = require("./bc");
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
    console.log("----------------------------");
    console.log(`${req.method} request coming in on route ${req.url}`);
    console.log("----------------------------");
    next();
});

app.use(express.static("./public"));

app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/petition", (req, res) => {
    if (req.session.userId) {
        if (req.session.sigId) {
            res.redirect("/thanks");
        } else {
            res.render("petition");
        }
    } else {
        res.redirect("/login");
    }
});

app.post("/petition", (req, res) => {
    const { signature } = req.body;
    db.addSignature(signature, req.session.userId)
        .then(({ rows }) => {
            req.session.sigId = rows[0].id;
            res.redirect("/thanks");
        })
        .catch(() => {
            console.error("error in db.addSignature", err);
            const issue = true;
            res.render("petition", {
                issue,
            });
        });
});

app.get("/thanks", (req, res) => {
    if (req.session.userId) {
        if (req.session.sigId) {
            db.howManyRegistered()
                .then(({ rows }) => {
                    const numOfRegistered = rows[0].count;
                    db.getSignature(req.session.sigId)
                        .then(({ rows }) => {
                            const usersig = rows[0].signature;
                            res.render("thanks", { numOfRegistered, usersig });
                        })
                        .catch((err) => {
                            console.error("error in db.getSignature", err);
                        });
                })
                .catch((err) => {
                    console.error("error in db.howManyRegistered", err);
                });
        } else {
            res.redirect("/petition");
        }
    } else {
        res.redirect("/login");
    }
});

app.get("/signers", (req, res) => {
    if (req.session.userId) {
        if (req.session.sigId) {
            db.allSigners()
                .then(({ rows }) => {
                    res.render("signers", { rows });
                })
                .catch((err) => {
                    console.error("error in db.allSigners", err);
                });
        } else {
            res.redirect("/petition");
        }
    } else {
        res.redirect("/login");
    }
});

app.get("/register", (req, res) => {
    if (req.session.userId) {
        if (req.session.sigId) {
            res.redirect("/thanks");
        } else {
            res.redirect("/petition");
        }
    } else {
        res.render("register");
    }
});

app.post("/register", (req, res) => {
    const { first, last, email, pw } = req.body;
    hash(pw)
        .then((hashedPw) => {
            db.addNewUser(first, last, email, hashedPw)
                .then(({ rows }) => {
                    req.session.userId = rows[0].id;
                    res.redirect("/login");
                })
                .catch((err) => {
                    console.error("error in db.addNewUser", err);
                    const issue = true;
                    res.render("register", { issue });
                });
        })
        .catch((err) => {
            console.error("error in hash: ", err);
        });
});

app.get("/login", (req, res) => {
    if (req.session.userId) {
        if (req.session.sigId) {
            res.redirect("/thanks");
        } else {
            res.redirect("/petition");
        }
    } else {
        res.render("login");
    }
});

app.post("/login", (req, res) => {
    const { email, typedPw } = req.body;
    db.getHashedPwandUserId(email)
        .then(({ rows }) => {
            const { password: hashedPw, id: userId } = rows[0];
            compare(typedPw, hashedPw)
                .then((result) => {
                    if (result) {
                        req.session.userId = userId;
                        db.didUserSign(userId)
                            .then((sigId) => {
                                if (sigId.rows[0]) {
                                    req.session.sigId = sigId.rows[0].id;
                                    res.redirect("/thanks");
                                } else {
                                    res.redirect("/petition");
                                }
                            })
                            .catch((err) => {
                                console.error("error in db.didUserSign: ", err);
                            });
                    } else {
                        const issue = true;
                        res.render("login", { issue });
                    }
                })
                .catch((err) => {
                    console.error("error in compare: ", err);
                });
        })
        .catch((err) => {
            "error in db.getHashedPwandUserId", err;
        });
});

app.get("*", (req, res) => {
    res.redirect("/login");
});

app.listen(8080, () => console.log("petition server running on 8080"));
