//           .---.
//          /-====)
//          | / '(
//          / /  _/
//          | |-(    _
//          / |  \  //|
//         /  \   \/\/
//       |    |\   /
//        `-;./ ;-'
//          |    \
//          |     \
//        _/       |
// .--/         /
//    `''---`-----`
// May the Lord protects this code from bugs
import Log from "../Util";
import * as JSZip from "jszip";
import {InsightError} from "./IInsightFacade";
import {Building} from "./Building";
import {Room} from "./Room";
const parse5 = require("parse5");
const http = require("http");

export class ParseZipBuilding {
    public zip: any;
    public content: string;

    constructor() {
        this.zip = new JSZip();
    }

    public parseZipBuilding(content: string): Promise<Building[]> {
        // TODO
        let object = this;
        let promises: Promise<any[]>;
        this.content = content;
        return new Promise( function (fulfill, reject) {
            if (content === undefined || content === null || content === "") {
                reject (new InsightError("400"));
            }
            object.zip.loadAsync(content, {base64: true}).then(function (zip: any) {
                for (let name in zip.files) {
                    // load the index.htm file
                    if (name.match("index")) {
                        // TODO need to notify this change to partner
                        // TODO fixed 2d array bug
                        let temp = object.buildingHandling(name);
                        fulfill(temp);
                    }
                }
            }).catch(function (err: any) {
                reject(new InsightError("rejected at P53"));
            });
        });
    }

    public buildingHandling(name: string): Promise<any[]> {
        let object = this;
        if (object.zip.file(name) !== null) {
            return new Promise(function (fulfill, reject) {
                object.zip.file(name).async("text").then(function (data: any) {
                    let buildingData = parse5.parse(data);
                    let buildings: any[] = [];
                    object.parseHTML(buildingData, buildings);
                    let stub = buildings;
                    object.roomHandling(buildings).then(function (buildingWithRooms: Building[]) {
                        Log.info("fulfill at P73");
                        fulfill(buildingWithRooms);
                    }).catch (function (e: any) {
                        // Log.info("reject at P77");
                        reject(new InsightError("rejected at P72"));
                    });
                }).catch(function (e: any) {
                    // Log.info("reject at P80");
                    reject (new InsightError("rejected at P76"));
                });
            });
        } else {
            return null;
        }
    }
    public parseHTML(data: any, buildings: any[]): void {
        if (data === null) {return null; }
        if (data.nodeName === "tbody") {
            this.parseTr(data, buildings);
            let stub = buildings;
        } else {
            if (data.childNodes !== null && data.childNodes !== undefined) {
                let size = data.childNodes.length;
                for (let i = 0; i < size; i++) {
                    this.parseHTML(data.childNodes[i], buildings);
                }
            }
        }
        return null;
    }
    // tree traversal taken from TA
    public parseTr(data: any, names: any[]): void {
        //
        let tbodyArr = data.childNodes;                 // array conatains tr and #text's
        for (let node of tbodyArr) {
            if (node.nodeName === "tr" && node["attrs"] && node["attrs"] && node["attrs"][0]["value"] &&
                (node["attrs"][0]["value"].match("odd") || node["attrs"][0]["value"].match("even"))) {
                let a: string;
                let b: string;
                let c: string;
                let d: string;
                for (let tdNode of node.childNodes) {
                    if (tdNode.nodeName === "td") { // Don't need this
                        // TODO helper to iterate class to find attribute
                        let x: any;
                        if (tdNode["attrs"] && tdNode["attrs"][0] && tdNode["attrs"][0]["value"]) {
                            x = tdNode["attrs"][0]["value"];
                        } else {
                            return null;
                        }
                        // let x = tdNode["attrs"][0]["value"];
                        if (x.match("building-code")) {
                            if (tdNode.childNodes[0] && tdNode.childNodes[0]["value"]) {
                                a = tdNode.childNodes[0]["value"].trim();
                            } else {
                                return null;
                            }
                        }
                        if (x.match("building-address")) {
                            if (tdNode.childNodes[0] && tdNode.childNodes[0]["value"]) {
                                c = tdNode.childNodes[0]["value"].trim();
                            } else {
                                return null;
                            }
                        }
                        if (x.match("title")) {
                            // TODO
                            if (tdNode.childNodes[1] && tdNode.childNodes[1].childNodes[0]
                                && tdNode.childNodes[1].childNodes[0]["value"]) {
                                b = tdNode.childNodes[1].childNodes[0]["value"].trim();
                            } else {
                                return null;
                            }
                        }
                        if (x.match("views-field-nothing")) {
                            if (tdNode.childNodes[1] && tdNode.childNodes[1]["attrs"]
                                && tdNode.childNodes[1]["attrs"][0]
                                && tdNode.childNodes[1]["attrs"][0]["value"]) {
                                d = tdNode.childNodes[1]["attrs"][0]["value"].trim().substring(2);
                            } else {
                                return null;
                            }
                        }
                    }
                }
                let shortName = a;
                let longName = b;
                let address = c;
                let stub = d ;
                let building = new Building(longName, address, shortName);
                building.addPath(d);
                let stub1 = building;
                names.push(building);
            }
        }
    }

//                                          ________________________
//    /\    /\                             /                        \
//    \ \  / /                            /                          \
//     \ \/ /~~.                         /                            \
//      \  //_/                         /                              \
//      /  \/                          /                                \
//     / /\ \                         /
//    / /| \/                       _/
//   / / --/                       /
//  / / /  |                   ___/
// / / /   |                 _/
// \/  \   \_      _________/
// ---------------/
    // ----------------------------Given an array of buildins, use the files in zip to get rooms------------------------
    // data contains all building objects parsed from index.htm
    public roomHandling(buildings: any[]): Promise<Building[]> {
        let object = this;
        let buildingWithRooms: Array<Promise<any>> = [];
        return new Promise(function (fulfill, reject) {
            let zip = new JSZip();
            zip.loadAsync(object.content, {base64: true}).then(function (zipData: any) {
                for (let building of buildings) {
                    let temp = object.getBuilding(building, zipData);
                    let stub = temp;
                    buildingWithRooms.push(temp);
                }
                Promise.all(buildingWithRooms).then (function (buildingData: any[]) {
                    fulfill(buildingData.filter( function (element) {
                        return element != null;
                    }));
                }).catch(function (err: any) {
                    // Log.info("reject P163");
                    reject(new InsightError("rejected at P194"));
                });
            }).catch(function (err: any) {
                //  Log.info("reject P167");
                reject(new InsightError("rejected at P198"));
            });
        });
    }

    public getBuilding(building: Building, zipData: any): Promise<any> {
        let object = this;
        return new Promise(function (fulfill, reject) {
            // "campus/discover/buildings-and-classrooms/" + building.getShortname()
            zipData.file(building.getPath()).async("string").
            then(function (roomDataRaw: any) {
                let roomData = parse5.parse(roomDataRaw);
                object.parseHTMLRoom(roomData, building).then(function (rooms: any) {
                    building.addRooms(rooms);
                    fulfill(building);
                }).catch(function (e: any) {
                    // Log.info("reject at P183");
                    reject (new InsightError("rejected at P215"));
                });
            }).catch(function (e: any) {
                // Log.trace(e);
                // Log.info("reject at P188");
                reject (new InsightError("rejected at P220"));
            });
        });
    }

    public parseHTMLRoom(data: any, building: Building): Promise<any[]> {

        let object = this;
        return new Promise(function (fulfill, reject) {
            let rooms: Array<Promise<any>> = [];
            // TODO added helper function
            let tableNode = object.findTableNode(data);
            let x = tableNode;
            // TODO end
            object.findTbodyNode(tableNode, building, rooms);
            let stub = rooms;
            // object.parseTrRoom(tbodyNode, building, rooms);
            Promise.all(rooms).then(function (roomsData) {
                // Log.info("fulfill at P206");
                fulfill(roomsData.filter(function (room) {
                    return room !== null;
                }));
            }).catch(function (err: any) {
                // Log.info("reject at P202");
                reject(new InsightError("rejected at P244"));
            });
        });

    }

    public findTableNode(data: any): any {
        if (data === null ) {
            return null;
        } else if (data.nodeName === "table") {
            if (data["attrs"] && data["attrs"][0] && data["attrs"][0]["value"]
                && data["attrs"][0]["value"].trim() === "views-table cols-5 table") {
                let stub = data;
                return data;
            }
            return null;
        } else {
            if (data.childNodes !== null && data.childNodes !== undefined) {
                let size = data.childNodes.length;
                // Log.info(data.nodeName);
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
    // tree traversal taken from TA
    public findTbodyNode(data: any, building: any, rooms: any[]): any {
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
        } else {
            if (data.childNodes !== null && data.childNodes !== undefined) {
                let size = data.childNodes.length;
                for (let i = 0; i < size; i++) {
                    this.findTbodyNode(data.childNodes[i], building, rooms);
                }
            }
        }
    }

    public parseTrRoom(data: any, building: Building): Promise<any> {
        // TODO
        let object = this;
        return new Promise(function (fulfill, reject) {
            if (data.parentNode.nodeName === "tbody" && data["attrs"] && data["attrs"][0]["value"] &&
                (data["attrs"][0]["value"].match("odd") || data["attrs"][0]["value"].match("even"))) {
                object.getCoordinates(building.getAddress()).then(function (geoLoc) {
                    // TODO retrieve info from td nodes
                    // TODO use these info to create a room object
                    let lon: number;
                    let fullname = building.getName();
                    let shortname = building.getShortname();
                    let num: string;
                    let name = shortname + "_" + num;
                    let address = building.getAddress();
                    let lat: number;
                    let seats: number;
                    let type: string;
                    let furniture: string;
                    let href: string;
                    if (geoLoc) {
                        lat = geoLoc.lat;
                        lon = geoLoc.lon;
                    } else {
                        lat = 0;
                        lon = 0;
                    }
                    for (let tdNode of data.childNodes) {
                        if (tdNode.nodeName === "td") {
                            let x: any;
                            if (tdNode["attrs"] && tdNode["attrs"][0] && tdNode["attrs"][0]["value"]) {
                                x = tdNode["attrs"][0]["value"];
                            } else {
                                // fulfill(null);
                                reject(new InsightError("rejected at P327"));
                            }

                            // let x = tdNode["attrs"][0]["value"];
                            if (x.match("room-number")) {
                                // retrieve room number
                                if (tdNode.childNodes[1] && tdNode.childNodes[1].childNodes[0]
                                    && tdNode.childNodes[1].childNodes[0]["value"]) {
                                    num = tdNode.childNodes[1].childNodes[0]["value"].trim();
                                } else {
                                    // return null;
                                    reject(new InsightError("rejected at P337"));
                                }
                            }
                            if (x.match("room-capacity")) {
                                // retrieve number of seats
                                if (tdNode.childNodes[0] && tdNode.childNodes[0]["value"]) {
                                    seats = tdNode.childNodes[0]["value"].trim();
                                } else {
                                    // return null;
                                    reject(new InsightError("rejected at P346"));
                                }
                            }
                            if (x.match("room-furniture")) {
                                // retrieve furniture
                                if (tdNode.childNodes[0] && tdNode.childNodes[0]["value"]) {
                                    furniture = tdNode.childNodes[0]["value"].trim();
                                } else {
                                    // return null;
                                    reject(new InsightError("rejected at P355"));
                                }
                            }
                            if (x.match("room-type")) {
                                // retrieve room type
                                if (tdNode.childNodes[0] && tdNode.childNodes[0]["value"]) {
                                    type = tdNode.childNodes[0]["value"].trim();
                                } else {
                                    // return null;
                                    reject(new InsightError("rejected at P364"));
                                }
                            }
                            if (x.match("nothing")) {
                                // retrieve href
                                if (tdNode.childNodes[1] && tdNode.childNodes[1]["attrs"]
                                    && tdNode.childNodes[1]["attrs"][0]["value"]) {
                                    href = tdNode.childNodes[1]["attrs"][0]["value"].trim();
                                } else {
                                    // return null;
                                    reject(new InsightError("rejected at P373"));
                                }
                            }
                        }
                    }
                    let room = new Room(fullname, shortname, num, shortname + "_" + num,
                        address, lat, lon, Number(seats), type, furniture, href);
                    fulfill(room);
                }).catch(function (err: any) {
                    // Log.info("reject at P290");
                    reject (new InsightError("rejected at P383"));
                });
            } else {
                fulfill(null);
            }
        });
    }

    // Code snippet from http documentation
    public getCoordinates(address: any): Promise<any> {
        // return new Promise(function (fulfill, reject) {
        // Use encodeURI to encode our address into desired format
        return new Promise(function (fulfill, reject) {
            let url = "http://cs310.ugrad.cs.ubc.ca:11316/api/v1/project_r3d1b_v7c1b/" + encodeURI(address);
            http.get(url, function (geoLoc: any) {
                let latlon = "";

                if (geoLoc.error) {
                    reject (new InsightError("rejected at P401"));
                }

                geoLoc.on("data", function (data: any) {
                    latlon = JSON.parse(data);
                });

                geoLoc.on("end", function () {
                    // Log.info("Fulfill at P354");
                    fulfill(latlon);
                });
            }).on("error", function (err: any) {
                fulfill();
            });
        });
        // });
    }
    //            |
    //        \       /
    //          .---.
    //     '-.  |   |  .-'
    //       ___|   |___
    //  -=  [           ]  =-
    //      `---.   .---'
    //   __||__ |   | __||__
    //   '-..-' |   | '-..-'
    //     ||   |   |   ||
    //     ||_.-|   |-,_||
    //   .-"`   `"`'`   `"-.
    // .'                   '.
    // Amen
}
