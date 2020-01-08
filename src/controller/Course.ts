// create a course object type to store all the course information

import {Section} from "./Section";
import Log from "../Util";
import {InsightDatasetKind} from "./IInsightFacade";
export class Course {
    public name: string;
    public sections: any[]; // Need to work on its type
    constructor(name: string) {
        this.name = name;
        this.sections = new Array();
    }

    public addSection(section: Section) {
        this.sections.push(section);
    }

    public getSections() {
        return this.sections;
    }

    public size(): number {
        return this.sections.length;
    }

    public handleData(name: string, data: string): Course {
        let json;

        try {
            json = JSON.parse(data);
        } catch (err) {
            Log.info("fulfill null P100");
            return null;
        }

        let object = this;

        if (json.hasOwnProperty("result")) {
            if (json.result.length !== 0) {
                for (let eachSection of json.result) {
                    if (eachSection["Section"] === "overall") {
                        let section = new Section(eachSection["Subject"], eachSection["Course"],
                            eachSection["Avg"],
                            eachSection["Professor"], eachSection["Title"],
                            eachSection["Pass"], eachSection["Fail"],
                            eachSection["Audit"], eachSection["id"].toString(), 1900);
                        object.addSection(section);
                    } else {
                        let section = new Section(eachSection["Subject"], eachSection["Course"],
                            eachSection["Avg"],
                            eachSection["Professor"], eachSection["Title"],
                            eachSection["Pass"], eachSection["Fail"],
                            eachSection["Audit"], eachSection["id"].toString(), Number(eachSection["Year"]));
                        object.addSection(section);
                    }
                }
            }
        } else {
            return null;
        }
        return object;
    }

}
