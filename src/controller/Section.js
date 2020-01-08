"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Section {
    constructor(dept, id, avg, instructor, title, pass, fail, audit, uuid, year) {
        this.dept = dept;
        this.id = id;
        this.avg = avg;
        this.instructor = instructor;
        this.title = title;
        this.pass = pass;
        this.fail = fail;
        this.audit = audit;
        this.uuid = uuid;
        this.year = year;
    }
    getPart(part) {
        if (part === "dept") {
            return this.dept;
        }
        else if (part === "id") {
            return this.id;
        }
        else if (part === "avg") {
            return this.avg;
        }
        else if (part === "instructor") {
            return this.instructor;
        }
        else if (part === "title") {
            return this.title;
        }
        else if (part === "pass") {
            return this.pass;
        }
        else if (part === "fail") {
            return this.fail;
        }
        else if (part === "audit") {
            return this.audit;
        }
        else if (part === "uuid") {
            return this.uuid;
        }
        else if (part === "year") {
            return this.year;
        }
    }
}
exports.Section = Section;
//# sourceMappingURL=Section.js.map