import Server from "../src/rest/Server";

import InsightFacade from "../src/controller/InsightFacade";
import chai = require("chai");

import chaiHttp = require("chai-http");
import Log from "../src/Util";
import {expect} from "chai";
import * as fs from "fs";
import Response = ChaiHttp.Response;

describe("Facade D3", function () {

    let facade: InsightFacade = null;
    let server: Server = null;

    chai.use(chaiHttp);

    before(function () {
        facade = new InsightFacade();
        server = new Server(4321);
        // TODO: start server here once and handle errors properly
        server.start().then(function (result: any) {
            // TODO
            Log.info("start server");
        }).catch(function (error) {
           expect.fail();
        });
    });

    after(function () {
        // TODO: stop server here once!
        server.stop().then(function (result: boolean) {
           // TODO
        }).catch(function (error) {
           expect.fail();
        });
    });

    beforeEach(function () {
        // might want to add some process logging here to keep track of what"s going on
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    afterEach(function () {
        // might want to add some process logging here to keep track of what"s going on
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // TODO: read your courses and rooms datasets here once!
    let rooms = fs.readFileSync("./test/data/rooms.zip");
    let courses = fs.readFileSync("./test/data/courses.zip");
    // Hint on how to test PUT requests
    it("PUT test for courses dataset", function () {
       try {
            Log.info("start");
            return chai.request("http://127.0.0.1:4321")
                .put("/dataset/courses/courses").attach("body", courses, "courses.zip").then(function (res: Response) {
                    // some logging here please!
                    Log.info("62");
                    expect(res.status).to.be.equal(200);
                }).catch(function (err: any) {
                    // some logging here please!
                    Log.trace(err);
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
            Log.error(err);
        }
    });

    it("PUT test for courses dataset twice", function () {
        try {
            Log.info("start");
            return chai.request("http://127.0.0.1:4321")
                .put("/dataset/courses/courses").attach("body", courses, "courses.zip").then(function (res: Response) {
                    // some logging here please!
                    Log.info("62");
                    // expect(res.status).to.be.equal(200);
                }).catch(function (err: any) {
                    // some logging here please!
                    Log.trace(err);
                    expect(err.status).to.be.equal(400);
                });
        } catch (err) {
            // and some more logging here!
            Log.error(err);
        }
    });

    it("PUT test for rooms dataset", function () {
        try {
            Log.info("start");
            return chai.request("http://127.0.0.1:4321")
                .put("/dataset/rooms/rooms").attach("body", rooms, "rooms.zip").then(function (res: Response) {
                    // some logging here please!
                    Log.info("62");
                    expect(res.status).to.be.equal(200);
                }).catch(function (err: any) {
                    // some logging here please!
                    Log.trace(err);
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
            Log.error(err);
        }
    });

   /* it ("test query", function () {
        let query = {
            WHERE: {
                GT: {
                    courses_avg: 97
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
            .post("/query").send({query}).then(function (res: Response) {
                let x = res;
                Log.info("94");
                expect(res.status).to.be.equal(200);
            }).catch(function (err) {
                Log.info("97");
                Log.trace(err);
                expect.fail();
            });
    });*/

    it ("test invalid query", function () {
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
            .post("/query").send({query}).then(function (res: Response) {
                let x = res;
                Log.info("94");
            }).catch(function (err) {
                Log.info("97");
                Log.trace(err);
                expect(err.status).to.be.equal(400);
            });
    });

    it("GET test for list datasets", function () {
        try {
            Log.info("start");
            return chai.request("http://127.0.0.1:4321")
                .get("/datasets").then(function (res: Response) {
                    Log.info("83");
                    expect(res.status).to.be.equal(200);
                }).catch(function (err) {
                    Log.info("87");
                    Log.trace(err);
                    expect.fail();
                });
        } catch (err) {
            Log.error(err);
        }
    });

    it("DEL test for courses dataset", function () {
        try {
            Log.info("start");
            return chai.request("http://127.0.0.1:4321")
                .del("/dataset/courses").attach("body", courses, "courses.zip").then(function (res: Response) {
                    Log.info("103");
                    expect(res.status).to.be.equal(200);
                }).catch(function (err) {
                    Log.info("107");
                    Log.trace(err);
                    expect.fail();
                });
        } catch (err) {
            Log.error(err);
        }
    });

    it("DEL test for rooms dataset", function () {
        try {
            Log.info("start");
            return chai.request("http://127.0.0.1:4321")
                .del("/dataset/rooms").attach("body", rooms, "rooms.zip").then(function (res: Response) {
                    Log.info("103");
                    expect(res.status).to.be.equal(200);
                }).catch(function (err) {
                    Log.info("107");
                    Log.trace(err);
                    expect.fail();
                });
        } catch (err) {
            Log.error(err);
        }
    });

    it("DEL test for courses dataset 404 error", function () {
        try {
            Log.info("start");
            return chai.request("http://127.0.0.1:4321")
                .del("/dataset/courses").attach("body", courses, "courses.zip").then(function (res: Response) {
                    Log.info("103");
                    // expect(res.status).to.be.equal(200);
                }).catch(function (err) {
                    Log.info("107");
                    Log.trace(err);
                    Log.info(err.message);
                    expect(err.status).to.be.equal(404);
                });
        } catch (err) {
            Log.error(err);
        }
    });

    it("DEL test for courses dataset 400 error", function () {
        try {
            Log.info("start");
            return chai.request("http://127.0.0.1:4321")
                .del("/dataset/null").attach("body", null, "courses.zip").then(function (res: Response) {
                    Log.info("103");
                    // expect(res.status).to.be.equal(200);
                }).catch(function (err) {
                    Log.info("107");
                    Log.trace(err);
                    Log.trace(err.message);
                    expect(err.status).to.be.equal(400);
                });
        } catch (err) {
            Log.error(err);
        }
    });
    // The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
