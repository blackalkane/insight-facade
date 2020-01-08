import Log from "../Util";
import * as JSZip from "jszip";
import {InsightError} from "./IInsightFacade";
import {Course} from "./Course";
export class ParseZip {

    public zip: any;
    private jadata: any;
    private jasonfiles: any;
    public content: string;

    constructor() {
        this.zip = new JSZip();
    }

    public parseZip(content: string): Promise<Course[]> {
        let object = this;
        let promises: Array<Promise<any>> = [];
        this.content = content;
        return new Promise(function (fulfill, reject) {
            if (content === undefined || content === null || content === "") {
                reject (new InsightError("400"));
            }
            object.zip.loadAsync(content, {base64: true}).then(function (zip: any) {
                for (let name in zip.files) {
                    if (name.match("courses/")) {
                        // read each course folder and store them into a course object
                        let temp = object.courseHandling(name);
                        promises.push(temp);
                    }
                }
                Promise.all(promises).then(function (data: any[]) {
                    fulfill(data.filter(function (element) {
                        return element != null;
                    }));
                });
            }).catch(function (err: any) {        // stub
                // not valid ZIP
                Log.info("reject 29");
                reject(new InsightError("400"));
            });
        });
    }

    public courseHandling(name: string): Promise<any> {
        let object = this;
        // let json;
        if (object.zip.file(name) !== null) {
            return new Promise (function (fulfill, reject) {
                object.zip.file(name).async("string").then(function (data: any) {    // convert data into string
                    let course: Course;
                    course = new Course(name);
                    course = course.handleData(name, data);
                    if (course != null && course.size() > 0) {
                        fulfill(course);
                    } else {
                        fulfill(null);
                    }
                });
            });
        } else {
            return null;
        }
    }

}
