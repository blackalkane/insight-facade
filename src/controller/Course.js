"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Section_1 = require("./Section");
const Util_1 = require("../Util");
class Course {
    constructor(name) {
        this.name = name;
        this.sections = new Array();
    }
    addSection(section) {
        this.sections.push(section);
    }
    getSections() {
        return this.sections;
    }
    size() {
        return this.sections.length;
    }
    handleData(name, data) {
        let json;
        try {
            json = JSON.parse(data);
        }
        catch (err) {
            Util_1.default.info("fulfill null P100");
            return null;
        }
        let object = this;
        if (json.hasOwnProperty("result")) {
            if (json.result.length !== 0) {
                for (let eachSection of json.result) {
                    if (eachSection["Section"] === "overall") {
                        let section = new Section_1.Section(eachSection["Subject"], eachSection["Course"], eachSection["Avg"], eachSection["Professor"], eachSection["Title"], eachSection["Pass"], eachSection["Fail"], eachSection["Audit"], eachSection["id"].toString(), 1900);
                        object.addSection(section);
                    }
                    else {
                        let section = new Section_1.Section(eachSection["Subject"], eachSection["Course"], eachSection["Avg"], eachSection["Professor"], eachSection["Title"], eachSection["Pass"], eachSection["Fail"], eachSection["Audit"], eachSection["id"].toString(), Number(eachSection["Year"]));
                        object.addSection(section);
                    }
                }
            }
        }
        else {
            return null;
        }
        return object;
    }
}
exports.Course = Course;
//# sourceMappingURL=Course.js.map