const superTest = require("supertest");
const { app } = require("./index.js");
const cookieSession = require("cookie-session");

test("GET /petition sends a 302 code and redirect to /register when user is logged out", () => {
    cookieSession.mockSessionOnce({
        userId: null,
    });
    return superTest(app)
        .get("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/register");
        });
});

test("GET /register sends a 302 code and redirect to /petition when user is logged in", () => {
    cookieSession.mockSessionOnce({ userId: 1 });
    return superTest(app)
        .get("/register")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});

test("GET /login sends a 302 code and redirect to /petition when user is logged in", () => {
    cookieSession.mockSessionOnce({ userId: 1 });
    return superTest(app)
        .get("/login")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});

test("GET /petition sends a 302 code and redirect to /thanks when user is logged in and had signed the petition", () => {
    cookieSession.mockSessionOnce({ userId: 1, sigId: 1 });
    return superTest(app)
        .get("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/thanks");
        });
});

test("POST /petition sends a 302 code and redirect to /thanks when user is logged in and had signed the petition", () => {
    cookieSession.mockSessionOnce({ userId: 1, sigId: 1 });
    return superTest(app)
        .post("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/thanks");
        });
});

test("GET /thanks sends a 302 code and redirect to /petition when user is logged in and hasn't signed the petition", () => {
    cookieSession.mockSessionOnce({ userId: 1, sigId: null });
    return superTest(app)
        .get("/thanks")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});

test("GET /signers sends a 302 code and redirect to /petition when user is logged in and hasn't signed the petition", () => {
    cookieSession.mockSessionOnce({ userId: 1, sigId: null });
    return superTest(app)
        .get("/signers")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});
