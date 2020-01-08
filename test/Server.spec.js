"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Server_1 = require("../src/rest/Server");
const InsightFacade_1 = require("../src/controller/InsightFacade");
const chai = require("chai");
const chaiHttp = require("chai-http");
const Util_1 = require("../src/Util");
const chai_1 = require("chai");
const fs = require("fs");
describe("Facade D3", function () {
    let facade = null;
    let server = null;
    chai.use(chaiHttp);
    before(function () {
        facade = new InsightFacade_1.default();
        server = new Server_1.default(4321);
        server.start().then(function (result) {
            Util_1.default.info("start server");
        }).catch(function (error) {
            chai_1.expect.fail();
        });
    });
    after(function () {
        server.stop().then(function (result) {
        }).catch(function (error) {
            chai_1.expect.fail();
        });
    });
    beforeEach(function () {
        Util_1.default.test(`BeforeTest: ${this.currentTest.title}`);
    });
    afterEach(function () {
        Util_1.default.test(`AfterTest: ${this.currentTest.title}`);
    });
    let rooms = fs.readFileSync("./test/data/rooms.zip");
    let courses = fs.readFileSync("./test/data/courses.zip");
    it("PUT test for courses dataset", function () {
        try {
            Util_1.default.info("start");
            return chai.request("http://127.0.0.1:4321")
                .put("/dataset/courses/courses").attach("body", courses, "courses.zip").then(function (res) {
                Util_1.default.info("62");
                chai_1.expect(res.status).to.be.equal(200);
            }).catch(function (err) {
                Util_1.default.trace(err);
                chai_1.expect.fail();
            });
        }
        catch (err) {
            Util_1.default.error(err);
        }
    });
    it("PUT test for courses dataset twice", function () {
        try {
            Util_1.default.info("start");
            return chai.request("http://127.0.0.1:4321")
                .put("/dataset/courses/courses").attach("body", courses, "courses.zip").then(function (res) {
                Util_1.default.info("62");
            }).catch(function (err) {
                Util_1.default.trace(err);
                chai_1.expect(err.status).to.be.equal(400);
            });
        }
        catch (err) {
            Util_1.default.error(err);
        }
    });
    it("PUT test for rooms dataset", function () {
        try {
            Util_1.default.info("start");
            return chai.request("http://127.0.0.1:4321")
                .put("/dataset/rooms/rooms").attach("body", rooms, "rooms.zip").then(function (res) {
                Util_1.default.info("62");
                chai_1.expect(res.status).to.be.equal(200);
            }).catch(function (err) {
                Util_1.default.trace(err);
                chai_1.expect.fail();
            });
        }
        catch (err) {
            Util_1.default.error(err);
        }
    });
    it("test invalid query", function () {
        let query = {
            WHERE: {
                GT: {
                    平均分: 97
                }
            },
            OPTIONS: {
                COLUMNS: [
                    "courses_dept",
                    "courses_avg"
                ],
                ORDER: "courses_avg"
            }
        };
        return chai.request("http://127.0.0.1:4321")
            .post("/query").send({ query }).then(function (res) {
            let x = res;
            Util_1.default.info("94");
        }).catch(function (err) {
            Util_1.default.info("97");
            Util_1.default.trace(err);
            chai_1.expect(err.status).to.be.equal(400);
        });
    });
    it("GET test for list datasets", function () {
        try {
            Util_1.default.info("start");
            return chai.request("http://127.0.0.1:4321")
                .get("/datasets").then(function (res) {
                Util_1.default.info("83");
                chai_1.expect(res.status).to.be.equal(200);
            }).catch(function (err) {
                Util_1.default.info("87");
                Util_1.default.trace(err);
                chai_1.expect.fail();
            });
        }
        catch (err) {
            Util_1.default.error(err);
        }
    });
    it("DEL test for courses dataset", function () {
        try {
            Util_1.default.info("start");
            return chai.request("http://127.0.0.1:4321")
                .del("/dataset/courses").attach("body", courses, "courses.zip").then(function (res) {
                Util_1.default.info("103");
                chai_1.expect(res.status).to.be.equal(200);
            }).catch(function (err) {
                Util_1.default.info("107");
                Util_1.default.trace(err);
                chai_1.expect.fail();
            });
        }
        catch (err) {
            Util_1.default.error(err);
        }
    });
    it("DEL test for rooms dataset", function () {
        try {
            Util_1.default.info("start");
            return chai.request("http://127.0.0.1:4321")
                .del("/dataset/rooms").attach("body", rooms, "rooms.zip").then(function (res) {
                Util_1.default.info("103");
                chai_1.expect(res.status).to.be.equal(200);
            }).catch(function (err) {
                Util_1.default.info("107");
                Util_1.default.trace(err);
                chai_1.expect.fail();
            });
        }
        catch (err) {
            Util_1.default.error(err);
        }
    });
    it("DEL test for courses dataset 404 error", function () {
        try {
            Util_1.default.info("start");
            return chai.request("http://127.0.0.1:4321")
                .del("/dataset/courses").attach("body", courses, "courses.zip").then(function (res) {
                Util_1.default.info("103");
            }).catch(function (err) {
                Util_1.default.info("107");
                Util_1.default.trace(err);
                Util_1.default.info(err.message);
                chai_1.expect(err.status).to.be.equal(404);
            });
        }
        catch (err) {
            Util_1.default.error(err);
        }
    });
    it("DEL test for courses dataset 400 error", function () {
        try {
            Util_1.default.info("start");
            return chai.request("http://127.0.0.1:4321")
                .del("/dataset/null").attach("body", null, "courses.zip").then(function (res) {
                Util_1.default.info("103");
            }).catch(function (err) {
                Util_1.default.info("107");
                Util_1.default.trace(err);
                Util_1.default.trace(err.message);
                chai_1.expect(err.status).to.be.equal(400);
            });
        }
        catch (err) {
            Util_1.default.error(err);
        }
    });
});
//# sourceMappingURL=Server.spec.js.map