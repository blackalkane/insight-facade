"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("../Util");
const IInsightFacade_1 = require("./IInsightFacade");
const ParseZip_1 = require("./ParseZip");
const Building_1 = require("./Building");
const ParseZipBuilding_1 = require("./ParseZipBuilding");
const Course_1 = require("./Course");
const QueryHelper_1 = require("./QueryHelper");
let fs = require("fs");
class InsightFacade {
    constructor() {
        this.data = new Map();
        Util_1.default.trace("InsightFacadeImpl::init()");
    }
    addDataset(id, content, kind) {
        let object = this;
        return new Promise(function (fulfill, reject) {
            if (object.data.has(id)) {
                reject(new IInsightFacade_1.InsightError("400"));
            }
            if (id == null || id === undefined || id === "") {
                Util_1.default.info("reject line I26");
                reject(new IInsightFacade_1.InsightError("400"));
            }
            if (content === null || content === undefined || content === "") {
                Util_1.default.info("reject line I29");
                reject(new IInsightFacade_1.InsightError("400"));
            }
            if (kind === IInsightFacade_1.InsightDatasetKind.Courses) {
                object.zipInput = new ParseZip_1.ParseZip();
                object.zipInput.parseZip(content).then(function (courses) {
                    if (courses.length > 0) {
                        object.data.set(id, courses);
                    }
                    let stub;
                    stub = Array.from(object.data.keys());
                    if (courses.length === 0) {
                        Util_1.default.info("reject I58");
                        reject(new IInsightFacade_1.InsightError("400"));
                    }
                    else {
                        object.cacheFile(id, courses).then(function (result) {
                            Util_1.default.info("fulfill I62");
                            return fulfill(stub);
                        }).catch(function (err) {
                            reject(new IInsightFacade_1.InsightError("400"));
                        });
                    }
                }).catch(function (err) {
                    Util_1.default.info("reject at I43");
                    reject(new IInsightFacade_1.InsightError());
                });
            }
            else if (kind === IInsightFacade_1.InsightDatasetKind.Rooms) {
                object.zipInput = new ParseZipBuilding_1.ParseZipBuilding();
                object.zipInput.parseZipBuilding(content).then(function (buildings) {
                    if (buildings.length > 0) {
                        object.data.set(id, buildings);
                    }
                    let x = object.data;
                    let stub;
                    stub = Array.from(object.data.keys());
                    if (buildings.length === 0) {
                        reject(new IInsightFacade_1.InsightError("400"));
                    }
                    else {
                        object.cacheFile(id, buildings).then(function (result) {
                            Util_1.default.info("fulfill I79");
                            return fulfill(stub);
                        }).catch(function (err) {
                            reject(new IInsightFacade_1.InsightError("400"));
                        });
                    }
                }).catch(function (err) {
                    Util_1.default.info("reject at I87");
                    reject(new IInsightFacade_1.InsightError("400"));
                });
            }
            else {
                return reject(new IInsightFacade_1.InsightError("400"));
            }
        });
    }
    cacheFile(id, courses) {
        let fileName = id.concat(".json");
        let path = "./data";
        let object = this;
        let JSONArray = JSON.stringify(courses);
        if (!fs.existsSync(path)) {
            Util_1.default.info("error at line I84");
            fs.mkdirSync(path);
        }
        return new Promise(function (fulfill, reject) {
            fs.writeFile(path + "/" + id + ".json", JSONArray, function (err1) {
                if (err1) {
                    Util_1.default.info("reject line I65");
                    reject(new IInsightFacade_1.InsightError("400"));
                }
                else {
                    object.data.set(id, courses);
                    let stub;
                    stub = Array.from(object.data.keys());
                    fulfill(stub);
                }
            });
        });
    }
    removeDataset(id) {
        Util_1.default.info("removeDataset");
        let fileName = id + ".json";
        let object = this;
        return new Promise(function (fulfill, reject) {
            if (id == null || id === undefined || id === "") {
                reject(new IInsightFacade_1.InsightError("400"));
            }
            fs.unlink("./data/" + fileName, function (err) {
                if (err) {
                    reject(new IInsightFacade_1.NotFoundError("404"));
                }
                object.data.delete(id);
                Util_1.default.info("fulfill at I119");
                fulfill(id);
            });
        });
    }
    performQuery(query) {
        return new Promise((fulfill, reject) => {
            let currentQuery = new QueryHelper_1.default(query);
            if (!currentQuery.checkWholeQuery()) {
                reject(new IInsightFacade_1.InsightError("400"));
            }
            let setForData = this.getData(currentQuery);
            if (setForData.size === 0) {
                reject(new IInsightFacade_1.InsightError("400"));
            }
            let ans = this.perform(currentQuery, setForData);
            if (!this.checkResult(ans)) {
                reject(new IInsightFacade_1.InsightError("400"));
            }
            fulfill(ans);
        });
    }
    getData(currentQuery) {
        let object = this;
        const IdByUser = currentQuery.id;
        currentQuery.dataSet = object.data.get(IdByUser);
        if (currentQuery.dataSet === undefined) {
            let setForData = new Set();
            return setForData;
        }
        else {
            let wholeDataArray = [];
            if (IdByUser === "courses") {
                for (const dataSet of currentQuery.dataSet) {
                    wholeDataArray.push(dataSet.getSections());
                }
            }
            else {
                for (const dataSet of currentQuery.dataSet) {
                    wholeDataArray.push(dataSet.getRooms());
                }
            }
            let dataArray = [];
            for (const bigData of wholeDataArray) {
                for (const data of bigData) {
                    dataArray.push(data);
                }
            }
            currentQuery.data = [];
            for (const subArray of dataArray) {
                currentQuery.data.push(subArray);
            }
            let setForData = new Set(currentQuery.data);
            return setForData;
        }
    }
    perform(currentQuery, setForData) {
        let finalData = this.performFilter(currentQuery, setForData);
        let tranResult = this.performTransformations(currentQuery, finalData);
        let ans = this.performOptions(currentQuery, tranResult);
        return ans;
    }
    performFilter(currentQuery, setForData) {
        let resultData = new Set();
        const finalData = [];
        if (currentQuery.checkIfFilterExist() === 1) {
            resultData = currentQuery.startFilter(currentQuery.formats.WHERE, setForData);
            for (const subData of resultData) {
                finalData.push(subData);
            }
        }
        else {
            resultData = setForData;
            for (const subData of resultData) {
                finalData.push(subData);
            }
        }
        return finalData;
    }
    performTransformations(currentQuery, finalData) {
        let result = finalData;
        let tranResult;
        if (currentQuery.checkIfTransformationExist() === 1) {
            tranResult = currentQuery.startTransformations(currentQuery.formats.TRANSFORMATIONS, result);
        }
        else {
            tranResult = result;
        }
        return tranResult;
    }
    performOptions(currentQuery, tranResult) {
        let ans;
        if (currentQuery.checkIfOrderExist() === 1) {
            currentQuery.startOrder(currentQuery.formats.OPTIONS.ORDER, tranResult);
            ans = currentQuery.startColumns(currentQuery.formats.OPTIONS.COLUMNS, tranResult);
        }
        else {
            ans = currentQuery.startColumns(currentQuery.formats.OPTIONS.COLUMNS, tranResult);
        }
        return ans;
    }
    checkResult(ans) {
        if (ans.length > 5000) {
            return false;
        }
        return true;
    }
    listDatasets() {
        let arr = [];
        let object = this;
        return new Promise(function (fulfill) {
            if (object.data.size === 0) {
                Util_1.default.info("fulfill at I203");
                fulfill([]);
            }
            object.data.forEach(function (value, key) {
                let count = 0;
                let type;
                for (let course of value) {
                    count += course.size();
                    if (course instanceof Course_1.Course) {
                        type = IInsightFacade_1.InsightDatasetKind.Courses;
                    }
                    if (course instanceof Building_1.Building) {
                        type = IInsightFacade_1.InsightDatasetKind.Rooms;
                    }
                }
                let insightFacadeDataset = object.createInsightDataset(key, type, count);
                arr.push(insightFacadeDataset);
            });
            Util_1.default.info("fulfill at I214");
            return fulfill(arr);
        });
    }
    createInsightDataset(name, dataKind, rows) {
        return {
            id: name,
            kind: dataKind,
            numRows: rows
        };
    }
}
exports.default = InsightFacade;
//# sourceMappingURL=InsightFacade.js.map