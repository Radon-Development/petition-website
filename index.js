const express = require("express");
const app = (module.exports.app = express());
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const { hash, compare } = require("./bc");
const db = require("./db");
const {
    requireLoggedInUser,
    requireSignedPetition,
    requireUnsignedPetition,
    requireLoggedOutUser,
} = require("./middleware");

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
    res.locals.isAuthenticated = req.session.userId;
    console.log("----------------------------");
    console.log(`${req.method} request coming in on route ${req.url}`);
    console.log("----------------------------");
    next();
});

app.use(express.static("./public"));

app.get("/", (req, res) => {
    res.redirect("/register");
});

app.get(
    "/petition",
    requireLoggedInUser,
    requireUnsignedPetition,
    (req, res) => {
        res.render("petition", {
            title: "Sign The Petition",
            name: req.session.name,
        });
    }
);

app.post(
    "/petition",
    requireLoggedInUser,
    requireUnsignedPetition,
    (req, res) => {
        const { signature } = req.body;
        db.addSignature(signature, req.session.userId)
            .then(({ rows }) => {
                req.session.sigId = rows[0].id;
                res.redirect("/thanks");
            })
            .catch(() => {
                console.error("error in db.addSignature", err);
                const issue = true;
                res.render("petition", { issue, name: req.session.name });
            });
    }
);

app.get("/thanks", requireLoggedInUser, requireSignedPetition, (req, res) => {
    db.howManyRegistered()
        .then(({ rows }) => {
            const numOfRegistered = rows[0].count;
            db.getSignature(req.session.sigId)
                .then(({ rows }) => {
                    const usersig = rows[0].signature;
                    res.render("thanks", {
                        title: "Thank You!",
                        numOfRegistered,
                        usersig,
                        name: req.session.name,
                    });
                })
                .catch((err) => {
                    console.error("error in db.getSignature", err);
                });
        })
        .catch((err) => {
            console.error("error in db.howManyRegistered", err);
        });
});

app.post("/thanks", requireLoggedInUser, requireSignedPetition, (req, res) => {
    const { deleteSig } = req.body;
    if (typeof deleteSig === "string") {
        db.deleteSig(req.session.userId)
            .then(() => {
                req.session.sigId = null;
                res.redirect("/petition");
            })
            .catch((err) => {
                console.error("error in db.deleteSig", err);
            });
    }
});

app.get("/signers", requireLoggedInUser, requireSignedPetition, (req, res) => {
    db.allSigners()
        .then(({ rows }) => {
            for (let i = 0; i < rows.length; i++) {
                const lowerCity = rows[i].city;
                if (lowerCity) {
                    let upperCity = lowerCity[0].toUpperCase();
                    for (let j = 1; j < lowerCity.length; j++) {
                        upperCity += lowerCity[j];
                    }
                    rows[i].upperCity = upperCity;
                }
            }
            res.render("signers", {
                title: "Signers",
                rows,
                name: req.session.name,
            });
        })
        .catch((err) => {
            console.error("error in db.allSigners", err);
        });
});

app.get("/register", requireLoggedOutUser, (req, res) => {
    res.render("register", { title: "Register" });
});

app.post("/register", requireLoggedOutUser, (req, res) => {
    const { first, last, email, pw } = req.body;
    db.doesEmailExists(email)
        .then(({ rows }) => {
            if (rows.length > 0) {
                const emailExists = true;
                res.render("register", { emailExists });
            } else {
                let missingPw = false;
                let missingFirst = false;
                let missingLast = false;
                let missingEmail = false;
                if (!pw) {
                    missingPw = true;
                    if (!first) {
                        missingFirst = true;
                    }
                    if (!last) {
                        missingLast = true;
                    }
                    if (!email) {
                        missingEmail = true;
                    }
                    res.render("register", {
                        missingFirst,
                        missingLast,
                        missingEmail,
                        missingPw,
                    });
                } else {
                    hash(pw)
                        .then((hashedPw) => {
                            db.addNewUser(first, last, email, hashedPw)
                                .then(({ rows }) => {
                                    req.session.userId = rows[0].id;
                                    res.redirect("/profile");
                                })
                                .catch((err) => {
                                    console.error(
                                        "error in db.addNewUser: ",
                                        err
                                    );
                                    if (!first) {
                                        missingFirst = true;
                                    }
                                    if (!last) {
                                        missingLast = true;
                                    }
                                    if (!email) {
                                        missingEmail = true;
                                    }
                                    if (!pw) {
                                        missingPw = true;
                                    }
                                    res.render("register", {
                                        missingFirst,
                                        missingLast,
                                        missingEmail,
                                        missingPw,
                                    });
                                });
                        })
                        .catch((err) => {
                            console.error("error in hash: ", err);
                        });
                }
            }
        })
        .catch((err) => {
            console.error("error in db.doesEmailExists: ", err);
        });
});

app.get("/login", requireLoggedOutUser, (req, res) => {
    res.render("login", { title: "Login" });
});

app.post("/login", requireLoggedOutUser, (req, res) => {
    const { email, typedPw } = req.body;
    db.doesEmailExists(email)
        .then(({ rows }) => {
            if (rows.length <= 0) {
                const emailNotExists = true;
                res.render("login", { emailNotExists });
            } else {
                db.getHashedPwAndUserIdAndFirst(email)
                    .then(({ rows }) => {
                        const {
                            password: hashedPw,
                            id: userId,
                            first,
                        } = rows[0];
                        compare(typedPw, hashedPw)
                            .then((result) => {
                                if (result) {
                                    req.session.userId = userId;
                                    db.didUserSign(userId)
                                        .then((sigId) => {
                                            if (sigId.rows[0]) {
                                                req.session.sigId =
                                                    sigId.rows[0].id;
                                                req.session.name = first;
                                                res.redirect("/thanks");
                                            } else {
                                                res.redirect("/petition");
                                            }
                                        })
                                        .catch((err) => {
                                            console.error(
                                                "error in db.didUserSign: ",
                                                err
                                            );
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
            }
        })
        .catch((err) => {
            console.error("error in db.doesEmailExists: ", err);
        });
});

app.get("/profile", requireLoggedInUser, (req, res) => {
    db.didUserVisitProfilePage(req.session.userId)
        .then((userProfileId) => {
            if (userProfileId.rows[0]) {
                res.redirect("/thanks");
            } else {
                res.render("profile", {
                    title: "Profile",
                    name: req.session.name,
                });
            }
        })
        .catch((err) => {
            console.error("error in db.didUserVisitProfilePage: ", err);
        });
});

app.post("/profile", requireLoggedInUser, (req, res) => {
    let { age, city, url } = req.body;
    if (!url || url.indexOf("http://") === 0 || url.indexOf("https://") === 0) {
        db.insertProfile(age, city, url, req.session.userId)
            .then(() => {
                res.redirect("/thanks");
            })
            .catch((err) => {
                console.error("error in db.insertProfile: ", err);
            });
    } else {
        const urlIssue = true;
        res.render("profile", { urlIssue, name: req.session.name });
    }
});

app.get(
    "/signers/:city",
    requireLoggedInUser,
    requireSignedPetition,
    (req, res) => {
        const { city } = req.params;
        db.getSignersByCity(city)
            .then(({ rows }) => {
                let upperCity = city[0].toUpperCase();
                for (let i = 1; i < city.length; i++) {
                    upperCity += city[i];
                }
                res.render("signers", {
                    title: `Signers By City, ${upperCity}`,
                    rows,
                    name: req.session.name,
                });
            })
            .catch((err) => {
                console.error("error in db.getSignersByCity: ", err);
            });
    }
);

app.get("/profile/edit", requireLoggedInUser, (req, res) => {
    db.getProfileInfo(req.session.userId)
        .then(({ rows }) => {
            res.render("edit-profile", {
                title: "Edit Profile",
                rows,
                name: req.session.name,
            });
        })
        .catch((err) => {
            console.error("error in db.getProfileInfo: ", err);
        });
});

app.post("/profile/edit", requireLoggedInUser, (req, res) => {
    const {
        first,
        last,
        email,
        typedPw,
        age,
        city,
        url,
        update,
        deleteAcc,
    } = req.body;

    if (typeof deleteAcc === "string") {
        db.deleteAcc(req.session.userId);
        req.session = null;
        res.redirect("/login");
    }
    if (typeof update === "string") {
        if (typedPw) {
            hash(typedPw)
                .then((hashedPw) => {
                    db.updateUserInfoWithPw(
                        first,
                        last,
                        email,
                        hashedPw,
                        req.session.userId
                    )
                        .then(() => {
                            db.updateUserProfile(
                                age,
                                city,
                                url,
                                req.session.userId
                            )
                                .then(() => {
                                    if (first) {
                                        req.session.name = first;
                                    }
                                    res.redirect("/thanks");
                                })
                                .catch((err) => {
                                    console.error(
                                        "error in db.updateUserProfile: ",
                                        err
                                    );
                                });
                        })
                        .catch((err) => {
                            console.error(
                                "error in db.updateUserInfoWithPw: ",
                                err
                            );
                        });
                })
                .catch((err) => {
                    console.error("error in hash: ", err);
                });
        } else {
            db.updateUserInfoWithoutPw(first, last, email, req.session.userId)
                .then(() => {
                    db.updateUserProfile(age, city, url, req.session.userId)
                        .then(() => {
                            res.redirect("/thanks");
                        })
                        .catch((err) => {
                            console.error(
                                "error in db.updateUserProfile: ",
                                err
                            );
                        });
                })
                .catch((err) => {
                    console.error("error in db.updateUserInfoWithoutPw: ", err);
                });
        }
    }
});

app.get("/logout", requireLoggedInUser, (req, res) => {
    req.session = null;
    res.redirect("/register");
});

app.get("/about", (req, res) => {
    res.render("about", { title: "About This Project" });
});

app.get("*", (req, res) => {
    res.redirect("/register");
});

if (require.main == module) {
    app.listen(process.env.PORT || 8080, () =>
        console.log("petition server running on 8080")
    );
}
