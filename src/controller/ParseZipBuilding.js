"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("../Util");
const JSZip = require("jszip");
const IInsightFacade_1 = require("./IInsightFacade");
const Building_1 = require("./Building");
const Room_1 = require("./Room");
const parse5 = require("parse5");
const http = require("http");
class ParseZipBuilding {
    constructor() {
        this.zip = new JSZip();
    }
    parseZipBuilding(content) {
        let object = this;
        let promises;
        this.content = content;
        return new Promise(function (fulfill, reject) {
            if (content === undefined || content === null || content === "") {
                reject(new IInsightFacade_1.InsightError("400"));
            }
            object.zip.loadAsync(content, { base64: true }).then(function (zip) {
                for (let name in zip.files) {
                    if (name.match("index")) {
                        let temp = object.buildingHandling(name);
                        fulfill(temp);
                    }
                }
            }).catch(function (err) {
                reject(new IInsightFacade_1.InsightError("rejected at P53"));
            });
        });
    }
    buildingHandling(name) {
        let object = this;
        if (object.zip.file(name) !== null) {
            return new Promise(function (fulfill, reject) {
                object.zip.file(name).async("text").then(function (data) {
                    let buildingData = parse5.parse(data);
                    let buildings = [];
                    object.parseHTML(buildingData, buildings);
                    let stub = buildings;
                    object.roomHandling(buildings).then(function (buildingWithRooms) {
                        Util_1.default.info("fulfill at P73");
                        fulfill(buildingWithRooms);
                    }).catch(function (e) {
                        reject(new IInsightFacade_1.InsightError("rejected at P72"));
                    });
                }).catch(function (e) {
                    reject(new IInsightFacade_1.InsightError("rejected at P76"));
                });
            });
        }
        else {
            return null;
        }
    }
    parseHTML(data, buildings) {
        if (data === null) {
            return null;
        }
        if (data.nodeName === "tbody") {
            this.parseTr(data, buildings);
            let stub = buildings;
        }
        else {
            if (data.childNodes !== null && data.childNodes !== undefined) {
                let size = data.childNodes.length;
                for (let i = 0; i < size; i++) {
                    this.parseHTML(data.childNodes[i], buildings);
                }
            }
        }
        return null;
    }
    parseTr(data, names) {
        let tbodyArr = data.childNodes;
        for (let node of tbodyArr) {
            if (node.nodeName === "tr" && node["attrs"] && node["attrs"] && node["attrs"][0]["value"] &&
                (node["attrs"][0]["value"].match("odd") || node["attrs"][0]["value"].match("even"))) {
                let a;
                let b;
                let c;
                let d;
                for (let tdNode of node.childNodes) {
                    if (tdNode.nodeName === "td") {
                        let x;
                        if (tdNode["attrs"] && tdNode["attrs"][0] && tdNode["attrs"][0]["value"]) {
                            x = tdNode["attrs"][0]["value"];
                        }
                        else {
                            return null;
                        }
                        if (x.match("building-code")) {
                            if (tdNode.childNodes[0] && tdNode.childNodes[0]["value"]) {
                                a = tdNode.childNodes[0]["value"].trim();
                            }
                            else {
                                return null;
                            }
                        }
                        if (x.match("building-address")) {
                            if (tdNode.childNodes[0] && tdNode.childNodes[0]["value"]) {
                                c = tdNode.childNodes[0]["value"].trim();
                            }
                            else {
                                return null;
                            }
                        }
                        if (x.match("title")) {
                            if (tdNode.childNodes[1] && tdNode.childNodes[1].childNodes[0]
                                && tdNode.childNodes[1].childNodes[0]["value"]) {
                                b = tdNode.childNodes[1].childNodes[0]["value"].trim();
                            }
                            else {
                                return null;
                            }
                        }
                        if (x.match("views-field-nothing")) {
                            if (tdNode.childNodes[1] && tdNode.childNodes[1]["attrs"]
                                && tdNode.childNodes[1]["attrs"][0]
                                && tdNode.childNodes[1]["attrs"][0]["value"]) {
                                d = tdNode.childNodes[1]["attrs"][0]["value"].trim().substring(2);
                            }
                            else {
                                return null;
                            }
                        }
                    }
                }
                let shortName = a;
                let longName = b;
                let address = c;
                let stub = d;
                let building = new Building_1.Building(longName, address, shortName);
                building.addPath(d);
                let stub1 = building;
                names.push(building);
            }
        }
    }
    roomHandling(buildings) {
        let object = this;
        let buildingWithRooms = [];
        return new Promise(function (fulfill, reject) {
            let zip = new JSZip();
            zip.loadAsync(object.content, { base64: true }).then(function (zipData) {
                for (let building of buildings) {
                    let temp = object.getBuilding(building, zipData);
                    let stub = temp;
                    buildingWithRooms.push(temp);
                }
                Promise.all(buildingWithRooms).then(function (buildingData) {
                    fulfill(buildingData.filter(function (element) {
                        return element != null;
                    }));
                }).catch(function (err) {
                    reject(new IInsightFacade_1.InsightError("rejected at P194"));
                });
            }).catch(function (err) {
                reject(new IInsightFacade_1.InsightError("rejected at P198"));
            });
        });
    }
    getBuilding(building, zipData) {
        let object = this;
        return new Promise(function (fulfill, reject) {
            zipData.file(building.getPath()).async("string").
                then(function (roomDataRaw) {
                let roomData = parse5.parse(roomDataRaw);
                object.parseHTMLRoom(roomData, building).then(function (rooms) {
                    building.addRooms(rooms);
                    fulfill(building);
                }).catch(function (e) {
                    reject(new IInsightFacade_1.InsightError("rejected at P215"));
                });
            }).catch(function (e) {
                reject(new IInsightFacade_1.InsightError("rejected at P220"));
            });
        });
    }
    parseHTMLRoom(data, building) {
        let object = this;
        return new Promise(function (fulfill, reject) {
            let rooms = [];
            let tableNode = object.findTableNode(data);
            let x = tableNode;
            object.findTbodyNode(tableNode, building, rooms);
            let stub = rooms;
            Promise.all(rooms).then(function (roomsData) {
                fulfill(roomsData.filter(function (room) {
                    return room !== null;
                }));
            }).catch(function (err) {
                reject(new IInsightFacade_1.InsightError("rejected at P244"));
            });
        });
    }
    findTableNode(data) {
        if (data === null) {
            return null;
        }
        else if (data.nodeName === "table") {
            if (data["attrs"] && data["attrs"][0] && data["attrs"][0]["value"]
                && data["attrs"][0]["value"].trim() === "views-table cols-5 table") {
                let stub = data;
                return data;
            }
            return null;
        }
        else {
            if (data.childNodes !== null && data.childNodes !== undefined) {
                let size = data.childNodes.length;
                for (let i = 0; i < size; i++) {
                    let x = this.findTableNode(data.childNodes[i]);
                    if (x) {
                        return x;
                    }
                }
                return null;
            }
            return null;
        }
    }
    findTbodyNode(data, building, rooms) {
        if (data === null) {
            return null;
        }
        if (data.nodeName === "tbody") {
            if (data.childNodes !== null && data.childNodes !== undefined) {
                let size = data.childNodes.length;
                for (let i = 0; i < size; i++) {
                    if (data.childNodes[i] && data.childNodes[i].nodeName === "tr") {
                        let stub = this.parseTrRoom(data.childNodes[i], building);
                        let x = stub;
                        rooms.push(stub);
                    }
                }
                return;
            }
        }
        else {
            if (data.childNodes !== null && data.childNodes !== undefined) {
                let size = data.childNodes.length;
                for (let i = 0; i < size; i++) {
                    this.findTbodyNode(data.childNodes[i], building, rooms);
                }
            }
        }
    }
    parseTrRoom(data, building) {
        let object = this;
        return new Promise(function (fulfill, reject) {
            if (data.parentNode.nodeName === "tbody" && data["attrs"] && data["attrs"][0]["value"] &&
                (data["attrs"][0]["value"].match("odd") || data["attrs"][0]["value"].match("even"))) {
                object.getCoordinates(building.getAddress()).then(function (geoLoc) {
                    let lon;
                    let fullname = building.getName();
                    let shortname = building.getShortname();
                    let num;
                    let name = shortname + "_" + num;
                    let address = building.getAddress();
                    let lat;
                    let seats;
                    let type;
                    let furniture;
                    let href;
                    if (geoLoc) {
                        lat = geoLoc.lat;
                        lon = geoLoc.lon;
                    }
                    else {
                        lat = 0;
                        lon = 0;
                    }
                    for (let tdNode of data.childNodes) {
                        if (tdNode.nodeName === "td") {
                            let x;
                            if (tdNode["attrs"] && tdNode["attrs"][0] && tdNode["attrs"][0]["value"]) {
                                x = tdNode["attrs"][0]["value"];
                            }
                            else {
                                reject(new IInsightFacade_1.InsightError("rejected at P327"));
                            }
                            if (x.match("room-number")) {
                                if (tdNode.childNodes[1] && tdNode.childNodes[1].childNodes[0]
                                    && tdNode.childNodes[1].childNodes[0]["value"]) {
                                    num = tdNode.childNodes[1].childNodes[0]["value"].trim();
                                }
                                else {
                                    reject(new IInsightFacade_1.InsightError("rejected at P337"));
                                }
                            }
                            if (x.match("room-capacity")) {
                                if (tdNode.childNodes[0] && tdNode.childNodes[0]["value"]) {
                                    seats = tdNode.childNodes[0]["value"].trim();
                                }
                                else {
                                    reject(new IInsightFacade_1.InsightError("rejected at P346"));
                                }
                            }
                            if (x.match("room-furniture")) {
                                if (tdNode.childNodes[0] && tdNode.childNodes[0]["value"]) {
                                    furniture = tdNode.childNodes[0]["value"].trim();
                                }
                                else {
                                    reject(new IInsightFacade_1.InsightError("rejected at P355"));
                                }
                            }
                            if (x.match("room-type")) {
                                if (tdNode.childNodes[0] && tdNode.childNodes[0]["value"]) {
                                    type = tdNode.childNodes[0]["value"].trim();
                                }
                                else {
                                    reject(new IInsightFacade_1.InsightError("rejected at P364"));
                                }
                            }
                            if (x.match("nothing")) {
                                if (tdNode.childNodes[1] && tdNode.childNodes[1]["attrs"]
                                    && tdNode.childNodes[1]["attrs"][0]["value"]) {
                                    href = tdNode.childNodes[1]["attrs"][0]["value"].trim();
                                }
                                else {
                                    reject(new IInsightFacade_1.InsightError("rejected at P373"));
                                }
                            }
                        }
                    }
                    let room = new Room_1.Room(fullname, shortname, num, shortname + "_" + num, address, lat, lon, Number(seats), type, furniture, href);
                    fulfill(room);
                }).catch(function (err) {
                    reject(new IInsightFacade_1.InsightError("rejected at P383"));
                });
            }
            else {
                fulfill(null);
            }
        });
    }
    getCoordinates(address) {
        return new Promise(function (fulfill, reject) {
            let url = "http://cs310.ugrad.cs.ubc.ca:11316/api/v1/project_r3d1b_v7c1b/" + encodeURI(address);
            http.get(url, function (geoLoc) {
                let latlon = "";
                if (geoLoc.error) {
                    reject(new IInsightFacade_1.InsightError("rejected at P401"));
                }
                geoLoc.on("data", function (data) {
                    latlon = JSON.parse(data);
                });
                geoLoc.on("end", function () {
                    fulfill(latlon);
                });
            }).on("error", function (err) {
                fulfill();
            });
        });
    }
}
exports.ParseZipBuilding = ParseZipBuilding;
//# sourceMappingURL=ParseZipBuilding.js.map