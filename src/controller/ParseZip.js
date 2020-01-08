"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("../Util");
const JSZip = require("jszip");
const IInsightFacade_1 = require("./IInsightFacade");
const Course_1 = require("./Course");
class ParseZip {
    constructor() {
        this.zip = new JSZip();
    }
    parseZip(content) {
        let object = this;
        let promises = [];
        this.content = content;
        return new Promise(function (fulfill, reject) {
            if (content === undefined || content === null || content === "") {
                reject(new IInsightFacade_1.InsightError("400"));
            }
            object.zip.loadAsync(content, { base64: true }).then(function (zip) {
                for (let name in zip.files) {
                    if (name.match("courses/")) {
                        let temp = object.courseHandling(name);
                        promises.push(temp);
                    }
                }
                Promise.all(promises).then(function (data) {
                    fulfill(data.filter(function (element) {
                        return element != null;
                    }));
                });
            }).catch(function (err) {
                Util_1.default.info("reject 29");
                reject(new IInsightFacade_1.InsightError("400"));
            });
        });
    }
    courseHandling(name) {
        let object = this;
        if (object.zip.file(name) !== null) {
            return new Promise(function (fulfill, reject) {
                object.zip.file(name).async("string").then(function (data) {
                    let course;
                    course = new Course_1.Course(name);
                    course = course.handleData(name, data);
                    if (course != null && course.size() > 0) {
                        fulfill(course);
                    }
                    else {
                        fulfill(null);
                    }
                });
            });
        }
        else {
            return null;
        }
    }
}
exports.ParseZip = ParseZip;
//# sourceMappingURL=ParseZip.js.map