import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "./IInsightFacade";
import {ParseZip} from "./ParseZip";
import {Building} from "./Building";
import {ParseZipBuilding} from "./ParseZipBuilding";
import {Course} from "./Course";
import {Section} from "./Section";
import QueryHelper from "./QueryHelper";
import {Room} from "./Room";

let fs = require("fs");

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */

export default class InsightFacade implements IInsightFacade {
    public zipInput: any;
    public data: Map<string, any[]> = new Map<string, any[]>();
    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<any[]> {
        let object = this;
        return new Promise(function (fulfill, reject) {

            if (object.data.has(id)) {
                reject (new InsightError("400"));
            }

            if (id == null || id === undefined || id === "") {
                Log.info("reject line I26");
                reject(new InsightError("400"));
            }
            if (content === null || content === undefined || content === "") {
                Log.info("reject line I29");
                reject(new InsightError("400"));
            }

            if (kind === InsightDatasetKind.Courses) {
                object.zipInput = new ParseZip();
                object.zipInput.parseZip(content).then(function (courses: Course[]) {
                    // store the dara into local disk
                    if (courses.length > 0) {
                        object.data.set(id, courses);
                    }
                    let stub: any[];
                    stub = Array.from(object.data.keys());
                    if (courses.length === 0) {
                        Log.info("reject I58");
                        reject(new InsightError("400"));
                    } else {
                        object.cacheFile(id, courses).then(function (result: any[]) {
                            Log.info("fulfill I62");
                            return fulfill(stub);
                        }).catch(function (err: any) {
                            reject(new InsightError("400"));
                        });
                    }
                }).catch(function (err: any) {
                    Log.info("reject at I43");
                    reject(new InsightError());
                });
            } else if (kind === InsightDatasetKind.Rooms) {
                // TODO
                object.zipInput = new ParseZipBuilding();
                object.zipInput.parseZipBuilding(content).then(function (buildings: Building[]) {
                    // TODO
                    if (buildings.length > 0) {
                        object.data.set(id, buildings);
                    }
                    let x = object.data;
                    let stub: any[];
                    stub = Array.from(object.data.keys());
                    if (buildings.length === 0) {
                        reject(new InsightError("400"));
                    } else {
                        object.cacheFile(id, buildings).then(function (result: any) {
                            Log.info("fulfill I79");
                            return fulfill(stub);
                        }).catch(function (err: any) {
                            reject(new InsightError("400"));
                        });
                    }
                }).catch(function (err: any) {
                    Log.info("reject at I87");
                    reject (new InsightError("400"));
                });

            } else {
                return reject(new InsightError("400"));
            }
        });
    }

    public cacheFile(id: string, courses: any[]): Promise<any[]> {
        let fileName = id.concat(".json");
        let path = "./data"; // + id + ".json";
        let object = this;
        let JSONArray = JSON.stringify(courses);       // convert TypeScript value into JSON string
        if (!fs.existsSync(path)) {
            Log.info("error at line I84");
            fs.mkdirSync(path);
        }
        return new Promise(function (fulfill, reject) {
            fs.writeFile(path + "/" + id + ".json", JSONArray, function (err1: any) {
                if (err1) {
                    Log.info("reject line I65");
                    reject(new InsightError("400"));
                } else {
                    object.data.set(id, courses);
                    let stub: any[];
                    stub = Array.from(object.data.keys());
                    fulfill(stub);
                }
            });
        });
    }

    public removeDataset(id: string): Promise<string> {
        Log.info("removeDataset");
        let fileName = id + ".json";
        let object = this;

        return new Promise(function (fulfill, reject) {
            if (id == null || id === undefined || id === "") {
                reject(new InsightError("400"));
            }
            fs.unlink("./data/" + fileName, function (err: any) {
                if (err) {
                    reject (new NotFoundError("404"));
                }
                object.data.delete(id);
                Log.info("fulfill at I119");
                fulfill(id);
            });
        });
    }

    public performQuery(query: any): Promise <any[]> {
        return new Promise<any[]>((fulfill, reject) => {
            // get the original query
            let currentQuery: QueryHelper = new QueryHelper(query);

            // 1. check query
            if (!currentQuery.checkWholeQuery()) {
                reject(new InsightError("400"));
            }

            // 2. get the data
            let setForData: Set<Section | Room> = this.getData(currentQuery);

            // check if no such dataset
            if (setForData.size === 0) {
                reject(new InsightError("400"));
            }

            // 3. perform query for data
            let ans: any[] = this.perform(currentQuery, setForData);

            // 4. check final result
            if (!this.checkResult(ans)) {
                reject(new InsightError("400"));
            }

            // 6. display the result
            fulfill(ans);
        });
    }

    // ___________________Helper for PerformQuery_______________________________________________________________________
    private getData(currentQuery: QueryHelper): Set<Section | Room> {
        let object = this;
        // get the <id> = "courses/rooms" from the user
        const IdByUser: string = currentQuery.id;
        currentQuery.dataSet = object.data.get(IdByUser);

        if (currentQuery.dataSet === undefined) {
            let setForData: Set<Section | Room> = new Set<Section|Room>();
            return setForData;
        } else {
            // get the data(section/room) from the dataSet, push them into an Array
            let wholeDataArray: any[] = [];
            if (IdByUser === "courses") {
                for (const dataSet of currentQuery.dataSet) {
                    wholeDataArray.push(dataSet.getSections());
                }
            } else {
                for (const dataSet of currentQuery.dataSet) {
                    wholeDataArray.push(dataSet.getRooms());
                }
            }
            let dataArray: any[] = [];
            for (const bigData of wholeDataArray) {
                for (const data of bigData) {
                    dataArray.push(data);
                }
            }
            currentQuery.data = [];
            for (const subArray of dataArray) {
                currentQuery.data.push(subArray);
            }

            // using Set to store data
            let setForData: Set<Section | Room> = new Set(currentQuery.data);
            return setForData;
        }
    }

    private perform(currentQuery: QueryHelper, setForData: Set<Section | Room>): any[] {
        // 1. perform filter
        let finalData: Array<Section | Room> = this.performFilter(currentQuery, setForData);

        // 2. perform transformations
        let tranResult: Array<Section | Room> = this.performTransformations(currentQuery, finalData);

        // 3. perform options
        let ans: any[] = this.performOptions(currentQuery, tranResult);
        return ans;
    }

    private performFilter(currentQuery: QueryHelper, setForData: Set<Section | Room>): Array<Section | Room> {
        // get the data to perform filter, return the data after filtering
        let resultData: Set<Section | Room> = new Set();
        const finalData: Array<Section | Room> = [];
        if (currentQuery.checkIfFilterExist() === 1) {
            resultData = currentQuery.startFilter(currentQuery.formats.WHERE, setForData);
            for (const subData of resultData) {
                finalData.push(subData);
            }
        } else {
            resultData = setForData;
            for (const subData of resultData) {
                finalData.push(subData);
            }
        }
        return finalData;
    }

    private performTransformations(currentQuery: QueryHelper, finalData: Array<Section | Room>): Array<Section | Room> {
        // get new data (result)
        let result: Array<Section | Room> = finalData;

        // get result from transformations
        let tranResult: Array<Section | Room>;
        // perform transformations
        if (currentQuery.checkIfTransformationExist() === 1) {
            tranResult = currentQuery.startTransformations(currentQuery.formats.TRANSFORMATIONS, result);
        } else {
            tranResult = result;
        }
        return tranResult;
    }

    private performOptions(currentQuery: QueryHelper, tranResult: Array<Section | Room>): any[] {
        let ans: any[];
        if (currentQuery.checkIfOrderExist() === 1) {
            currentQuery.startOrder(currentQuery.formats.OPTIONS.ORDER, tranResult);
            ans = currentQuery.startColumns(currentQuery.formats.OPTIONS.COLUMNS, tranResult);
        } else {
            ans = currentQuery.startColumns(currentQuery.formats.OPTIONS.COLUMNS, tranResult);
        }
        return ans;
    }

    private checkResult(ans: any[]): boolean {
        if (ans.length > 5000) {
            return false;
        }
        return true;
    }
    // _________________________________________________________________________________________________________________

    public listDatasets(): Promise<InsightDataset[]> {
        let arr: any[] = [];
        let object = this;
        return new Promise(function (fulfill) {
            if (object.data.size === 0 ) {
                Log.info("fulfill at I203");
                fulfill([]);
            }
            object.data.forEach(function (value: any[], key: string) {
                // TODO change here to retrieve kind for different object
                let count: number = 0;
                let type: InsightDatasetKind;
                for (let course of value) {
                    count += course.size();
                    if (course instanceof Course) {
                        type = InsightDatasetKind.Courses;
                    }
                    if (course instanceof Building) {
                        type = InsightDatasetKind.Rooms;
                    }
                }
                let insightFacadeDataset = object.createInsightDataset(key, type, count);
                arr.push(insightFacadeDataset);
            });
            Log.info("fulfill at I214");
            return fulfill(arr);
        });
    }

    public createInsightDataset(name: string, dataKind: InsightDatasetKind, rows: number) {
        return{
            id: name,
            kind: dataKind,
            numRows: rows
        };
    }

}
