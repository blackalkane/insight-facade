import { Section } from "./Section";
import { Room } from "./Room";
import Decimal from "decimal.js";
export interface IFORMAT {WHERE: object;
    OPTIONS: {COLUMNS: string[];
        ORDER?: {dir: {UP?: any, DOWN?: any}; keys: string[]; } | string; };
    TRANSFORMATIONS?: {GROUP: string[], APPLY: any[]}; }

export default class QueryHelper {
    private query: any;
    public formats: any;
    public courses: any;
    public dataSet: any[];
    public data: any[];
    public id: string;
    public group: string[];
    public applyToken: string[];

    constructor(query: any) {
        this.query = query;
        this.formats = query as IFORMAT;
    }

    // ______________________________CHECK______________________________________________________________________________
    public checkWholeQuery(): boolean {
        // check existence
        if (!this.checkQueryExistence()) {
            return false;
        }

        // check overall format
        if (!this.checkOverallFormat()) {
            return false;
        }

        // check TRANSFORMATIONS
        if (Object.keys(this.query).length === 3) {
            if (!this.checkIfCheckTransformations()) {
                return false;
            }
        }

        // check OPTIONS
        if (!this.checkOptions(this.query["OPTIONS"])) {
            return false;
        }

        // check Filter
        if (!this.checkIfCheckWhere()) {
            return false;
        }
        return true;
    }

    private checkQueryExistence(): boolean {
        if (this.formats === undefined || this.formats === null) {
            return false;
        }
        return true;
    }

    private checkOverallFormat(): boolean {
        if (!this.query["WHERE"] || !this.query["OPTIONS"]) {
            return false;
        }

        if (Object.keys(this.query).length !== 2 && Object.keys(this.query).length !== 3) {
            return false;
        }

        if (!this.query.hasOwnProperty("WHERE") || !this.query.hasOwnProperty("OPTIONS")) {
            return false;
        }
        return true;
    }

    private checkIfCheckTransformations(): boolean {
        // even if length is 3, might have a part not transformation
        if (!this.query.hasOwnProperty("TRANSFORMATIONS")) {
            return false;
        }

        // check transformation
        if (!this.checkTransformations(this.query["TRANSFORMATIONS"])) {
            return false;
        }
        return true;
    }

    private checkIfCheckWhere(): boolean {
        // check Filter if it exists
        if (Object.keys(this.query["WHERE"]).length !== 0) {
            if (!this.checkWhereFilter(this.query["WHERE"])) {
                return false;
            }
        }
        return true;
    }

    public checkIfFilterExist(): number {
        if (Object.keys(this.query["WHERE"]).length === 0) {
            return 0;
        }
        return 1;
    }

    public checkIfTransformationExist(): number {
        if (!this.formats.hasOwnProperty("TRANSFORMATIONS")) {
            return 0;
        }
        return 1;
    }

    public checkIfOrderExist(): number {
        if (!this.formats.OPTIONS.hasOwnProperty("ORDER")) {
            return 0;
        }
        return 1;
    }

    private checkWhereFilter(filterPart: any): boolean {
        if (!filterPart || filterPart === null || filterPart === undefined) {
            return false;
        }

        if (Object.keys(filterPart).length !== 1) {
            return false;
        }

        const subPartFilter: string = Object.keys(filterPart)[0];

        // divide into four parts:
        // LOGICCOMPARISON | MCOMPARISON | SCOMPARISON | NEGATION
        if (subPartFilter === "AND" || subPartFilter === "OR") {
            return this.checkLogic(filterPart[subPartFilter]);
        } else if (subPartFilter === "LT" || subPartFilter === "GT" || subPartFilter === "EQ") {
            return this.checkMComparator(filterPart[subPartFilter]);
        } else if (subPartFilter === "IS") {
            return this.checkSComparator(filterPart[subPartFilter]);
        } else if (subPartFilter === "NOT") {
            return this.checkNegation(filterPart[subPartFilter]);
        } else {
            return false;
        }
    }

    private checkLogic(lPart: any): boolean {
        // lPart: AND/OR
        if (!lPart || lPart === null || lPart === undefined) {
            return false;
        }

        // check lPart existence; check at least one filter
        if (lPart.length === 0) {
            return false;
        }

        // check dividing by Array
        if (!(lPart instanceof Array)) {
            return false;
        }

        // check subPart if existing, and recurively check filter
        for (const subPart of lPart) {
            if (!subPart || Object.keys(subPart).length === 0) {
                return false;
            }

            if (!this.checkWhereFilter(subPart)) {
                return false;
            }
        }
        return true;
    }

    private checkMComparator(mPart: any): boolean {
        // mPart: key:number
        // check mPart existence; check only one comparison
        // check format of key should be valid
        // check number part should be right type
        if (!mPart) {
            return false;
        }

        if (Object.keys(mPart).length !== 1) {
            return false;
        }

        if (!this.checkKey(Object.keys(mPart)[0])) {
            return false;
        }

        if (typeof mPart[Object.keys(mPart)[0]] !== "number") {
            return false;
        }

        // check key has to be number part
        if (!this.checkNumber(Object.keys(mPart)[0]) && !this.checkRoomNumber(Object.keys(mPart)[0])) {
            return false;
        }
        return true;
    }

    private checkSComparator(sPart: any): boolean {
        // sPart: key:[*]? inputstring [*]?
        // check sPart existence; check only one comparison
        // check format of key should be valid
        // check inputString part should be string type
        // check regular expression part matching
        // check not number type
        if (!sPart) {
            return false;
        }

        if (Object.keys(sPart).length !== 1) {
            return false;
        }

        if (!this.checkKey(Object.keys(sPart)[0])) {
            return false;
        }

        if (typeof sPart[Object.keys(sPart)[0]] !== "string") {
            return false;
        }

        if (!(/^((\*)?[^*]*(\*)?)$/.test(sPart[Object.keys(sPart)[0]]))) {
            return false;
        }

        if ((!this.checkString(Object.keys(sPart)[0]) && !this.checkRoomString(Object.keys(sPart)[0]))) {
            return false;
        }
        return true;
    }

    private checkNegation(nPart: any): boolean {
        // recursively check sub filter
        if (!nPart) {
            return false;
        }

        if (!this.checkWhereFilter(nPart)) {
            return false;
        }
        return true;
    }

    private checkKey(key: string): boolean {
        // check key existence; check split with "_"
        // check first part be id
        if (!key || key.split("_").length !== 2 ||
            key.split("_")[0] !== this.id) {
            return false;
        }

        // check second part matching
        if (this.id === "courses") {
            if (!this.checkNumber(key) && !this.checkString(key)) {
                return false;
            }
        } else {
            if (!this.checkRoomNumber(key) && !this.checkRoomString(key)) {
                return false;
            }
        }
        return true;
    }

    private checkNumber(key: string): boolean {
        // check key second part for type "number":
        // avg, pass, fail, audit, year
        const type: string = key.split("_")[1];
        if (type === "avg" || type === "pass" || type === "fail" ||
            type === "audit" || type === "year") {
            return true;
        }
        return false;
    }

    private checkString(key: string): boolean {
        // check key part for type "string"
        // dept, id, instructor, title, uuid
        const type: string = key.split("_")[1];
        if (type === "dept" || type === "id" || type === "instructor" ||
            type === "title" || type === "uuid") {
            return true;
        }
        return false;
    }

    private checkRoomNumber(key: string): boolean {
        const type: string = key.split("_")[1];
        if (type === "lat" || type === "lon" || type === "seats") {
            return true;
        }
        return false;
    }

    private checkRoomString(key: string): boolean {
        const type: string = key.split("_")[1];
        if (type === "fullname" || type === "shortname" || type === "number" ||
            type === "name" || type === "address" || type === "type" ||
            type === "furniture" || type === "href") {
            return true;
        }
        return false;
    }

    private checkOptions(optionsPart: any): boolean {
        if (!optionsPart.hasOwnProperty("COLUMNS")) {
            return false;
        }

        if (!this.checkColumns(optionsPart["COLUMNS"])) {
            return false;
        }

        const col: string[] = [];
        for (const colKey of optionsPart["COLUMNS"]) {
            col.push(colKey);
        }

        // check OPTIONS with 1 or 2 parts: COLUMNS, ORDER
        if (Object.keys(optionsPart).length === 1) {
            return true;
        } else if (Object.keys(optionsPart).length === 2) {
            if (optionsPart.hasOwnProperty("ORDER")) {
                if (this.checkOrder(col, optionsPart["ORDER"])) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    private checkColumns(cPart: string[]): boolean {
        if (!cPart || cPart === null || cPart === undefined) {
            return false;
        }

        if (cPart.length === 0) {
            return false;
        }

        if (!(cPart instanceof Array)) {
            return false;
        }

        for (const subPart of cPart) {
            if (typeof subPart !== "string") {
                return false;
            }
        }

        if (this.group === undefined) {
            if (!this.checkColumnsKey(cPart)) {
                return false;
            }
        } else {
            if (!this.checkColumnsGroupKey(cPart)) {
                return false;
            }
        }
        return true;
    }

    private checkColumnsKey(cPart: string[]): boolean {
        // all the keys must be valid
        let idSoFar: string;
        if (!cPart[0].includes("_")) {
            return false;
        }
        idSoFar = cPart[0].split("_")[0];

        for (const subPart of cPart) {
            if (!subPart.includes("_")) {
                return false;
            }

            this.id = subPart.split("_")[0];
            if (this.id !== idSoFar) {
                return false;
            }

            if (!this.checkKey(subPart)) {
                return false;
            }
        }
        return true;
    }

    private checkColumnsGroupKey(cPart: string[]): boolean {
        for (const subPart of cPart) {
            if (!subPart.includes("_")) {
                if (this.applyToken === undefined) {
                    return false;
                }
                if (!this.applyToken.includes(subPart)) {
                    return false;
                }
            } else {
                if (subPart.split("_")[0] !== this.id) {
                    return false;
                }
                if (!this.checkKey(subPart)) {
                    return false;
                }
                if (!this.group.includes(subPart)) {
                    return false;
                }
            }
        }
        return true;
    }

    private checkOrder(cPart: string[], oPart: any): boolean {
        if (!oPart) {
            return false;
        }
        // cPart: colKeys
        if (typeof oPart === "string") {
            if (cPart.includes(oPart)) {
                return true;
            }
        } else if (Object.keys(oPart).length === 2) {
            if (Object.keys(oPart)[0] === ("dir") && Object.keys(oPart)[1] === ("keys")) {
                if (oPart["dir"] === "UP" || oPart["dir"] === "DOWN") {
                    if (oPart["keys"]) {
                        if (oPart["keys"].length !== 0) {
                            for (const key of oPart["keys"]) {
                                if (!cPart.includes(key)) {
                                    return false;
                                }
                            }
                            return true;
                        }
                    }
                }
            }
            return false;
        } else {
            return false;
        }
    }

    private checkTransformations(tB: any): boolean {
        // check existence of transBody
        if (!tB) {
            return false;
        }

        // check length of transBody
        if (Object.keys(tB).length !== 2) {
            return false;
        }

        // check content of transBody
        if (!tB.hasOwnProperty("GROUP") ||
            !tB.hasOwnProperty("APPLY")) {
            return false;
        }

        if (!tB["GROUP"] || !tB["APPLY"]) {
            return false;
        }

        // check GROUP
        if (tB["GROUP"].length === 0) {
            return false;
        }

        // get the id from GROUP if TRANSFORMATION exists
        this.id = tB["GROUP"][0].split("_")[0];

        for (const groupKey of tB["GROUP"]) {
            if (!this.checkKey(groupKey)) {
                return false;
            }
        }

        // check APPLY
        if (!this.checkApply(tB["APPLY"])) {
            return false;
        }

        // update group
        this.group = tB["GROUP"];
        return true;
    }

    private checkApply(aPart: any): boolean {
        // aPart = [ (APPLYRULE (, APPLYRULE )* )? ]
        if (aPart.length === 0) {
            return true;
        }

        // applyRule = {applykey : {APPLYTOKEN : key}}
        let applyKeys: string[] = [];
        for (const applyRule of aPart) {
            if (!this.checkApplyRule(applyRule)) {
                return false;
            }
            applyKeys.push(Object.keys(applyRule)[0]);
        }

        // check the uniqueness of applykeys
        let backKeys: string[] = [];
        if (applyKeys.length === 1) {
            this.applyToken = applyKeys;
            return true;
        } else {
            const tempKey: string = applyKeys[0];
            applyKeys = applyKeys.slice(1);
            for (const applyKey of applyKeys) {
                if (applyKey === tempKey) {
                    return false;
                }
            }
            // applyKeys.push(tempKey);
            backKeys.push(tempKey);
            for (const applyKey of applyKeys) {
                backKeys.push(applyKey);
            }
        }
        this.applyToken = backKeys;
        return true;
    }

    private checkApplyRule(arPart: any): boolean {
        // arPart = {applykey : {APPLYTOKEN : key}}
        if (!arPart) {
            return false;
        }

        // check applyKey
        if (Object.keys(arPart).length !== 1 ||
            Object.keys(arPart)[0] === undefined ||
            Object.keys(arPart)[0] === null ||
            Object.keys(arPart)[0] === "" ||
            Object.keys(arPart)[0].includes("_")) {
            return false;
        }

        // check applyKey's value
        // arPart[Object.keys(arPart)[0]] = {APPLYTOKEN : key}
        if (!this.checkApplyKey(arPart[Object.keys(arPart)[0]])) {
            return false;
        }
        return true;
    }

    private checkApplyKey(akPart: any): boolean {
        // akPart = {APPLYTOKEN : key}
        if (!akPart) {
            return false;
        }

        // check applyToken existence, only one object
        if (Object.keys(akPart).length !== 1) {
            return false;
        }

        // applyToken match 'MAX' | 'MIN' | 'AVG' | 'COUNT' | 'SUM'
        const applyToken: string = Object.keys(akPart)[0];

        // check key
        // MAX/MIN/AVG/SUM should only be requested for numeric keys
        // COUNT can be requested for all keys
        const key: string = akPart[applyToken];
        if (applyToken === "MAX" || applyToken === "MIN" || applyToken === "AVG" ||
            applyToken === "SUM") {
            if (!this.checkKey(key)) {
                return false;
            }
            if (this.id === "courses") {
                if (!this.checkNumber(key)) {
                    return false;
                }
            } else {
                if (!this.checkRoomNumber(key)) {
                    return false;
                }
            }
            return true;
        } else if (applyToken === "COUNT") {
            if (!this.checkKey(key)) {
                return false;
            }
            return true;
        } else {
            return false;
        }
    }
    // _________________________________________________________________________________________________________________

    // ____________________________________________Perform______________________________________________________________
    public startFilter(fPart: any, sectionSet: Set<Section | Room>): Set<Section | Room> {
        const subPart: string = Object.keys(fPart)[0];
        // check for four parts
        // (LOGICCOMPARISON | MCOMPARISON | SCOMPARISON | NEGATION)
        if (subPart === "AND" || subPart === "OR") {
            sectionSet = this.startLogic(fPart[subPart], subPart, sectionSet);
        } else if (subPart === "LT" || subPart === "GT" || subPart === "EQ") {
            sectionSet = this.startMComparator(fPart[subPart], subPart, sectionSet);
        } else if (subPart === "IS") {
            sectionSet = this.startSComparator(fPart[subPart], sectionSet);
        } else if (subPart === "NOT") {
            sectionSet = this.startNegation(fPart[subPart], sectionSet);
        }
        return sectionSet;
    }

    private startLogic(lPart: any[], subPart: string, sectionSet: Set<Section | Room>): Set<Section | Room> {
        const ans: any[] = [];
        // push into one part so that we can filter them one by one
        for (const sublPart of lPart) {
            ans.push(this.startFilter(sublPart, sectionSet));
        }

        // use callback to filter
        let ansSet: Set<Section | Room> = ans[0];
        if (subPart === "AND") {
            for (const subAns of ans) {
                let tempSet: Set<Section | Room>;
                tempSet = new Set([...ansSet].filter((x) => subAns.has(x)));
                ansSet = tempSet;
            }
        } else if (subPart === "OR") {
            for (const subAns of ans) {
                let tempSet: Set<Section | Room>;
                tempSet = new Set([...ansSet, ...subAns]);
                ansSet = tempSet;
            }
        }
        return ansSet;
    }

    private startMComparator(mPart: any, subPart: string, sectionSet: Set<Section | Room>): Set<Section | Room> {
        const ansSet: Set<Section | Room> = new Set();
        let sectionArray: Array<Section | Room> = [];
        sectionSet.forEach((x) => sectionArray.push(x));
        let resultArray: Array<Section | Room> = [];

        if (subPart === "LT") {
            resultArray = sectionArray.filter((x) => {
                return (x as any)[(Object.keys(mPart)[0]).split("_")[1]] < mPart[Object.keys(mPart)[0]];
            });
        } else if (subPart === "GT") {
            resultArray = sectionArray.filter((x) => {
                return (x as any)[(Object.keys(mPart)[0]).split("_")[1]] > mPart[Object.keys(mPart)[0]];
            });
        } else if (subPart === "EQ") {
            resultArray = sectionArray.filter((x) => {
                return (x as any)[(Object.keys(mPart)[0]).split("_")[1]] === mPart[Object.keys(mPart)[0]];
            });
        }
        resultArray.forEach((x) => ansSet.add(x));
        return ansSet;
    }

    private startSComparator(sPart: any, sectionSet: Set<Section | Room>): Set<Section | Room> {
        const ansSet: Set<Section | Room> = new Set();
        // get the value that we need to compare
        let value: string = sPart[Object.keys(sPart)[0]];
        sectionSet.forEach( (section) => {
            // get the true value
            const trueValue = (section as any)[Object.keys(sPart)[0].split("_")[1]];
            // check the case only one *
            // check the case *asdf* both asterisks
            // check the case *abcd left asterisk
            // check the case abcd* right asterisk
            // check the case for no * existing
            // check the case *asdf* both asterisks
            if (value[0] === "*" && value.length === 1) {
                ansSet.add(section);
            } else if (value[0] === "*" && value[value.length - 1] === "*") {
                if (trueValue.includes(value.substring(1, value.length - 1))) {
                    ansSet.add(section);
                }
            } else if (value[0] === "*" && value[value.length - 1] !== "*") {
                if (trueValue.includes(value.substring(1, value.length))) {
                    if (trueValue.substring(trueValue.length - value.length + 1) === value.substring(1, value.length)) {
                        ansSet.add(section);
                    }
                }
            } else if (value[0] !== "*" && value[value.length - 1] === "*") {
                if (trueValue.includes(value.substring(0, value.length - 1))) {
                    if (trueValue.substring(0, value.length - 1) === value.substring(0, value.length - 1)) {
                        ansSet.add(section);
                    }
                }
            } else if (value[0] !== "*" && value[value.length - 1] !== "*") {
                if (value === trueValue) {
                    ansSet.add(section);
                }
            }
        });
        return ansSet;
    }

    private startNegation(nPart: any, sectionSet: Set<Section | Room>): Set<Section | Room> {
        // recursively filter inside
        const ans: Set<Section | Room> = this.startFilter(nPart, sectionSet);
        let ansSet: Set<Section | Room>;
        ansSet = new Set([...sectionSet].filter((x) => !ans.has(x)));
        return ansSet;
    }

    public startColumns(cPart: string[], sections: any[]): any[] {
        const ans: any[] = [];
        for (const subPart of sections) {
            const resultsub: any = {};
            for (const subc of cPart) {
                if (subc.includes("_")) {
                    if (this.id === "courses") {
                        resultsub[subc] = subPart.getPart(subc.split("_")[1]);
                    } else {
                        resultsub[subc] = subPart.getRPart(subc.split("_")[1]);
                    }
                } else {
                    resultsub[subc] = subPart[subc];
                }
            }
            ans.push(resultsub);
        }
        return ans;
    }

    public startOrder(oPart: any, resultData: Array<Section | Room>) {
        // check if has dir
        if (typeof oPart === "string") {
            if (oPart.includes("_")) {
                resultData.sort((a: any, b: any) => {
                    if (a[oPart.split("_")[1]] > b[oPart.split("_")[1]]) {
                        return 1;
                    } else if (a[oPart.split("_")[1]] < b[oPart.split("_")[1]]) {
                        return -1;
                    } else {
                        return 0;
                    }
                });
            } else {
                resultData.sort((a: any, b: any) => {
                    if (a[oPart] > b[oPart]) {
                        return 1;
                    } else if (a[oPart] < b[oPart]) {
                        return -1;
                    } else {
                        return 0;
                    }
                });
            }
        } else {
            let keys: string[] = [];
            for (let key of oPart.keys) {
                if (key.includes("_")) {
                    key = key.split("_")[1];
                }
                keys.push(key);
            }
            if (oPart.dir === "UP") {
                resultData.sort((a: any, b: any) => {
                    if (keys.length === 1) {
                        if (a[keys[0]] > b[keys[0]]) {
                            return 1;
                        } else if (a[keys[0]] < b[keys[0]]) {
                            return -1;
                        } else if (a[keys[0]] === b[keys[0]]) {
                            return 0;
                        }
                    } else {
                        return this.startOrderKeys(a, b, keys, 1, 0);
                    }
                });
            } else if (oPart.dir === "DOWN") {
                resultData.sort((a: any, b: any) => {
                    if (keys.length === 1) {
                        if (a[keys[0]] > b[keys[0]]) {
                            return -1;
                        } else if (a[keys[0]] < b[keys[0]]) {
                            return 1;
                        } else if (a[keys[0]] === b[keys[0]]) {
                            return 0;
                        }
                    } else {
                        return this.startOrderKeys(a, b, keys, -1, 0);
                    }
                });
            }
        }
    }

    private startOrderKeys(a: any, b: any, keys: string[], dir: number, i: number): number {
        if (a[keys[i]] > b[keys[i]]) {
            return dir;
        } else if (a[keys[i]] < b[keys[i]]) {
            return -1 * dir;
        } else if (keys.length - 1 === i) {
            return 0;
        } else {
            i++;
            return this.startOrderKeys(a, b, keys, dir, i);
        }
    }

    public startTransformations(tPart: any, results: Array<Section | Room>): any {
        // GROUP
        // groups: object {groupKey: [Array]}
        let groups: any = {};
        for (const res of results) {
            if (this.group.length === 1) {
                const groupKey: string = (res as any)[this.group[0].split("_")[1]];
                if (groups[groupKey] === undefined) {
                    groups[groupKey] = [];
                }
                groups[groupKey].push(res);
            } else {
                let groupKey: string = "";
                for (const key of this.group) {
                    groupKey = groupKey + (res as any)[key.split("_")[1]];
                }
                if (groups[groupKey] === undefined) {
                    groups[groupKey] = [];
                }
                groups[groupKey].push(res);
            }
        }

        let result: any = [];
        // APPLY
        if (this.query["TRANSFORMATIONS"]["APPLY"].length === 0) {
            for (const key of Object.keys(groups)) {
                let group: any[] = groups[key];
                result.push(group[0]);
            }
        } else {
            for (const applyRule of this.query["TRANSFORMATIONS"]["APPLY"]) {
                const applyToken: string = Object.keys(applyRule[Object.keys(applyRule)[0]])[0];
                const key: string = (applyRule[Object.keys(applyRule)[0]])
                    [Object.keys(applyRule[Object.keys(applyRule)[0]])[0]].split("_")[1];
                for (const gKey of Object.keys(groups)) {
                    let group: any[] = groups[gKey];
                    let finalValue: number = 0;
                    if (applyToken === "MAX") {
                        let max: number = group[0][key];
                        for (const sub of group) {
                            if (sub[key] > max) {
                                max = sub[key];
                            }
                        }
                        finalValue = max;
                    } else if (applyToken === "MIN") {
                        let min: number = group[0][key];
                        for (const sub of group) {
                            if (sub[key] < min) {
                                min = sub[key];
                            }
                        }
                        finalValue = min;
                    } else if (applyToken === "AVG") {
                        let total: Decimal = new Decimal(0);
                        for (const sub of group) {
                            total = total.add((new Decimal(sub[key])));
                        }
                        const avg: number = total.toNumber() / group.length;
                        const res: number = Number(avg.toFixed(2));
                        finalValue = res;
                    } else if (applyToken === "COUNT") {
                        let temp: number = 0;
                        let tempArray: any[] = [];
                        for (const sub of group) {
                            if (!tempArray.includes(sub[key])) {
                                tempArray.push(sub[key]);
                                temp++;
                            }
                        }
                        finalValue = temp;
                    } else if (applyToken === "SUM") {
                        let temp: number = 0;
                        for (const sub of group) {
                            temp = temp + sub[key];
                        }
                        finalValue = Number(temp.toFixed(2));
                    }
                    for (const sub of group) {
                        sub[Object.keys(applyRule)[0]] = finalValue;
                    }
                }
            }
            for (const grKey of Object.keys(groups)) {
                let group: any = groups[grKey];
                result.push(group[0]);
            }
        }

        return result;
    }
    // _________________________________________________________________________________________________________________
}
