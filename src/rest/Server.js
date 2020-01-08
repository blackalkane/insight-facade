"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const restify = require("restify");
const Util_1 = require("../Util");
const InsightFacade_1 = require("../controller/InsightFacade");
const IInsightFacade_1 = require("../controller/IInsightFacade");
class Server {
    constructor(port) {
        Util_1.default.info("Server::<init>( " + port + " )");
        this.port = port;
        Server.insightFacade = new InsightFacade_1.default();
    }
    stop() {
        Util_1.default.info("Server::close()");
        const that = this;
        return new Promise(function (fulfill) {
            that.rest.close(function () {
                fulfill(true);
            });
        });
    }
    start() {
        const that = this;
        return new Promise(function (fulfill, reject) {
            try {
                Util_1.default.info("Server::start() - start");
                that.rest = restify.createServer({
                    name: "insightUBC",
                });
                that.rest.use(restify.bodyParser({ mapFiles: true, mapParams: true }));
                that.rest.use(function crossOrigin(req, res, next) {
                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-Allow-Headers", "X-Requested-With");
                    return next();
                });
                that.rest.get("/echo/:msg", Server.echo);
                that.rest.put("/dataset/:id/:kind", Server.addDataset);
                that.rest.del("/dataset/:id", Server.removeDataset);
                that.rest.post("/query", Server.performQuery);
                that.rest.get("/datasets", Server.listDataset);
                that.rest.get("/.*", Server.getStatic);
                that.rest.listen(that.port, function () {
                    Util_1.default.info("Server::start() - restify listening: " + that.rest.url);
                    fulfill(true);
                });
                that.rest.on("error", function (err) {
                    Util_1.default.info("Server::start() - restify ERROR: " + err);
                    reject(err);
                });
            }
            catch (err) {
                Util_1.default.error("Server::start() - ERROR: " + err);
                reject(err);
            }
        });
    }
    static echo(req, res, next) {
        try {
            const response = Server.performEcho(req.params.msg);
            Util_1.default.info("Server::echo(..) - responding " + 200);
            res.json(200, { result: response });
        }
        catch (err) {
            Util_1.default.error("Server::echo(..) - responding 400");
            res.json(400, { error: err.message });
        }
        return next();
    }
    static addDataset(req, res, next) {
        Util_1.default.info("start adding");
        let stub = req.params.body;
        let buffer = new Buffer(stub);
        let content = buffer.toString("base64");
        let id = req.params.id;
        let kind = req.params.kind;
        Util_1.default.info("S123");
        try {
            Server.insightFacade.addDataset(id, content, kind).then(function (response) {
                res.json(200, { result: response });
                Util_1.default.info("S127");
            }).catch(function (err) {
                Util_1.default.info("S129");
                res.json(400, { error: err.message });
            });
        }
        catch (err) {
            Util_1.default.info("134");
            res.json(400, err.message);
        }
        return next();
    }
    static removeDataset(req, res, next) {
        let id = req.params.id;
        try {
            Util_1.default.info("start removing");
            Server.insightFacade.removeDataset(id).then(function (response) {
                Util_1.default.info("145");
                res.json(200, { result: response });
            }).catch(function (err) {
                Util_1.default.info("S149");
                if (err instanceof IInsightFacade_1.InsightError) {
                    let x = err;
                    Util_1.default.info("151");
                    res.json(400, { error: err.message });
                }
                else if (err instanceof IInsightFacade_1.NotFoundError) {
                    Util_1.default.info("154");
                    res.json(404, { error: err.message });
                }
            });
        }
        catch (err) {
            Util_1.default.info("S159");
            if (err instanceof IInsightFacade_1.InsightError) {
                Util_1.default.info("S161");
                res.json(400, { error: err.message });
            }
            else if (err instanceof IInsightFacade_1.NotFoundError) {
                Util_1.default.info("S164");
                res.json(404, { error: err.message });
            }
        }
        return next();
    }
    static performQuery(req, res, next) {
        let query = req.body;
        try {
            Server.insightFacade.performQuery(query).then(function (response) {
                Util_1.default.info("S176");
                res.json(200, { result: response });
            }).catch(function (err) {
                Util_1.default.info("S179");
                Util_1.default.error(err);
                res.json(400, { error: err.message });
            });
        }
        catch (err) {
            Util_1.default.info("S183");
            res.json(400, { error: err.message });
        }
        return next();
    }
    static listDataset(req, res, next) {
        try {
            Util_1.default.info("start listing");
            Server.insightFacade.listDatasets().then(function (response) {
                Util_1.default.info("S196");
                res.json(200, { result: response });
            });
        }
        catch (err) {
            Util_1.default.info("S201");
            res.json(400, { error: err.message });
        }
        return next();
    }
    static performEcho(msg) {
        if (typeof msg !== "undefined" && msg !== null) {
            return `${msg}...${msg}`;
        }
        else {
            return "Message not provided";
        }
    }
    static getStatic(req, res, next) {
        const publicDir = "frontend/public/";
        Util_1.default.trace("RoutHandler::getStatic::" + req.url);
        let path = publicDir + "index.html";
        if (req.url !== "/") {
            path = publicDir + req.url.split("/").pop();
        }
        fs.readFile(path, function (err, file) {
            if (err) {
                res.send(500);
                Util_1.default.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    }
}
exports.default = Server;
//# sourceMappingURL=Server.js.map