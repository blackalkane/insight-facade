export class Section {

    public dept: string;
    public id: string;
    public avg: number;
    public instructor: string;
    public title: string;
    public pass: number;
    public fail: number;
    public audit: number;
    public uuid: string;
    public year: number;

    constructor(dept: string, id: string, avg: number, instructor: string, title: string, pass: number, fail: number,
                audit: number, uuid: string, year: number) {
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

    public getPart(part: string) {
        if (part === "dept") {
            return this.dept;
        } else if (part === "id") {
            return this.id;
        } else if (part === "avg") {
            return this.avg;
        } else if (part === "instructor") {
            return this.instructor;
        } else if (part === "title") {
            return this.title;
        } else if (part === "pass") {
            return this.pass;
        } else if (part === "fail") {
            return this.fail;
        } else if (part === "audit") {
            return this.audit;
        } else if (part === "uuid") {
            return this.uuid;
        } else if (part === "year") {
            return this.year;
        }
    }
}
