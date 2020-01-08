"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decimal_js_1 = require("decimal.js");
class QueryHelper {
    constructor(query) {
        this.query = query;
        this.formats = query;
    }
    checkWholeQuery() {
        if (!this.checkQueryExistence()) {
            return false;
        }
        if (!this.checkOverallFormat()) {
            return false;
        }
        if (Object.keys(this.query).length === 3) {
            if (!this.checkIfCheckTransformations()) {
                return false;
            }
        }
        if (!this.checkOptions(this.query["OPTIONS"])) {
            return false;
        }
        if (!this.checkIfCheckWhere()) {
            return false;
        }
        return true;
    }
    checkQueryExistence() {
        if (this.formats === undefined || this.formats === null) {
            return false;
        }
        return true;
    }
    checkOverallFormat() {
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
    checkIfCheckTransformations() {
        if (!this.query.hasOwnProperty("TRANSFORMATIONS")) {
            return false;
        }
        if (!this.checkTransformations(this.query["TRANSFORMATIONS"])) {
            return false;
        }
        return true;
    }
    checkIfCheckWhere() {
        if (Object.keys(this.query["WHERE"]).length !== 0) {
            if (!this.checkWhereFilter(this.query["WHERE"])) {
                return false;
            }
        }
        return true;
    }
    checkIfFilterExist() {
        if (Object.keys(this.query["WHERE"]).length === 0) {
            return 0;
        }
        return 1;
    }
    checkIfTransformationExist() {
        if (!this.formats.hasOwnProperty("TRANSFORMATIONS")) {
            return 0;
        }
        return 1;
    }
    checkIfOrderExist() {
        if (!this.formats.OPTIONS.hasOwnProperty("ORDER")) {
            return 0;
        }
        return 1;
    }
    checkWhereFilter(filterPart) {
        if (!filterPart || filterPart === null || filterPart === undefined) {
            return false;
        }
        if (Object.keys(filterPart).length !== 1) {
            return false;
        }
        const subPartFilter = Object.keys(filterPart)[0];
        if (subPartFilter === "AND" || subPartFilter === "OR") {
            return this.checkLogic(filterPart[subPartFilter]);
        }
        else if (subPartFilter === "LT" || subPartFilter === "GT" || subPartFilter === "EQ") {
            return this.checkMComparator(filterPart[subPartFilter]);
        }
        else if (subPartFilter === "IS") {
            return this.checkSComparator(filterPart[subPartFilter]);
        }
        else if (subPartFilter === "NOT") {
            return this.checkNegation(filterPart[subPartFilter]);
        }
        else {
            return false;
        }
    }
    checkLogic(lPart) {
        if (!lPart || lPart === null || lPart === undefined) {
            return false;
        }
        if (lPart.length === 0) {
            return false;
        }
        if (!(lPart instanceof Array)) {
            return false;
        }
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
    checkMComparator(mPart) {
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
        if (!this.checkNumber(Object.keys(mPart)[0]) && !this.checkRoomNumber(Object.keys(mPart)[0])) {
            return false;
        }
        return true;
    }
    checkSComparator(sPart) {
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
    checkNegation(nPart) {
        if (!nPart) {
            return false;
        }
        if (!this.checkWhereFilter(nPart)) {
            return false;
        }
        return true;
    }
    checkKey(key) {
        if (!key || key.split("_").length !== 2 ||
            key.split("_")[0] !== this.id) {
            return false;
        }
        if (this.id === "courses") {
            if (!this.checkNumber(key) && !this.checkString(key)) {
                return false;
            }
        }
        else {
            if (!this.checkRoomNumber(key) && !this.checkRoomString(key)) {
                return false;
            }
        }
        return true;
    }
    checkNumber(key) {
        const type = key.split("_")[1];
        if (type === "avg" || type === "pass" || type === "fail" ||
            type === "audit" || type === "year") {
            return true;
        }
        return false;
    }
    checkString(key) {
        const type = key.split("_")[1];
        if (type === "dept" || type === "id" || type === "instructor" ||
            type === "title" || type === "uuid") {
            return true;
        }
        return false;
    }
    checkRoomNumber(key) {
        const type = key.split("_")[1];
        if (type === "lat" || type === "lon" || type === "seats") {
            return true;
        }
        return false;
    }
    checkRoomString(key) {
        const type = key.split("_")[1];
        if (type === "fullname" || type === "shortname" || type === "number" ||
            type === "name" || type === "address" || type === "type" ||
            type === "furniture" || type === "href") {
            return true;
        }
        return false;
    }
    checkOptions(optionsPart) {
        if (!optionsPart.hasOwnProperty("COLUMNS")) {
            return false;
        }
        if (!this.checkColumns(optionsPart["COLUMNS"])) {
            return false;
        }
        const col = [];
        for (const colKey of optionsPart["COLUMNS"]) {
            col.push(colKey);
        }
        if (Object.keys(optionsPart).length === 1) {
            return true;
        }
        else if (Object.keys(optionsPart).length === 2) {
            if (optionsPart.hasOwnProperty("ORDER")) {
                if (this.checkOrder(col, optionsPart["ORDER"])) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    checkColumns(cPart) {
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
        }
        else {
            if (!this.checkColumnsGroupKey(cPart)) {
                return false;
            }
        }
        return true;
    }
    checkColumnsKey(cPart) {
        let idSoFar;
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
    checkColumnsGroupKey(cPart) {
        for (const subPart of cPart) {
            if (!subPart.includes("_")) {
                if (this.applyToken === undefined) {
                    return false;
                }
                if (!this.applyToken.includes(subPart)) {
                    return false;
                }
            }
            else {
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
    checkOrder(cPart, oPart) {
        if (!oPart) {
            return false;
        }
        if (typeof oPart === "string") {
            if (cPart.includes(oPart)) {
                return true;
            }
        }
        else if (Object.keys(oPart).length === 2) {
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
        }
        else {
            return false;
        }
    }
    checkTransformations(tB) {
        if (!tB) {
            return false;
        }
        if (Object.keys(tB).length !== 2) {
            return false;
        }
        if (!tB.hasOwnProperty("GROUP") ||
            !tB.hasOwnProperty("APPLY")) {
            return false;
        }
        if (!tB["GROUP"] || !tB["APPLY"]) {
            return false;
        }
        if (tB["GROUP"].length === 0) {
            return false;
        }
        this.id = tB["GROUP"][0].split("_")[0];
        for (const groupKey of tB["GROUP"]) {
            if (!this.checkKey(groupKey)) {
                return false;
            }
        }
        if (!this.checkApply(tB["APPLY"])) {
            return false;
        }
        this.group = tB["GROUP"];
        return true;
    }
    checkApply(aPart) {
        if (aPart.length === 0) {
            return true;
        }
        let applyKeys = [];
        for (const applyRule of aPart) {
            if (!this.checkApplyRule(applyRule)) {
                return false;
            }
            applyKeys.push(Object.keys(applyRule)[0]);
        }
        let backKeys = [];
        if (applyKeys.length === 1) {
            this.applyToken = applyKeys;
            return true;
        }
        else {
            const tempKey = applyKeys[0];
            applyKeys = applyKeys.slice(1);
            for (const applyKey of applyKeys) {
                if (applyKey === tempKey) {
                    return false;
                }
            }
            backKeys.push(tempKey);
            for (const applyKey of applyKeys) {
                backKeys.push(applyKey);
            }
        }
        this.applyToken = backKeys;
        return true;
    }
    checkApplyRule(arPart) {
        if (!arPart) {
            return false;
        }
        if (Object.keys(arPart).length !== 1 ||
            Object.keys(arPart)[0] === undefined ||
            Object.keys(arPart)[0] === null ||
            Object.keys(arPart)[0] === "" ||
            Object.keys(arPart)[0].includes("_")) {
            return false;
        }
        if (!this.checkApplyKey(arPart[Object.keys(arPart)[0]])) {
            return false;
        }
        return true;
    }
    checkApplyKey(akPart) {
        if (!akPart) {
            return false;
        }
        if (Object.keys(akPart).length !== 1) {
            return false;
        }
        const applyToken = Object.keys(akPart)[0];
        const key = akPart[applyToken];
        if (applyToken === "MAX" || applyToken === "MIN" || applyToken === "AVG" ||
            applyToken === "SUM") {
            if (!this.checkKey(key)) {
                return false;
            }
            if (this.id === "courses") {
                if (!this.checkNumber(key)) {
                    return false;
                }
            }
            else {
                if (!this.checkRoomNumber(key)) {
                    return false;
                }
            }
            return true;
        }
        else if (applyToken === "COUNT") {
            if (!this.checkKey(key)) {
                return false;
            }
            return true;
        }
        else {
            return false;
        }
    }
    startFilter(fPart, sectionSet) {
        const subPart = Object.keys(fPart)[0];
        if (subPart === "AND" || subPart === "OR") {
            sectionSet = this.startLogic(fPart[subPart], subPart, sectionSet);
        }
        else if (subPart === "LT" || subPart === "GT" || subPart === "EQ") {
            sectionSet = this.startMComparator(fPart[subPart], subPart, sectionSet);
        }
        else if (subPart === "IS") {
            sectionSet = this.startSComparator(fPart[subPart], sectionSet);
        }
        else if (subPart === "NOT") {
            sectionSet = this.startNegation(fPart[subPart], sectionSet);
        }
        return sectionSet;
    }
    startLogic(lPart, subPart, sectionSet) {
        const ans = [];
        for (const sublPart of lPart) {
            ans.push(this.startFilter(sublPart, sectionSet));
        }
        let ansSet = ans[0];
        if (subPart === "AND") {
            for (const subAns of ans) {
                let tempSet;
                tempSet = new Set([...ansSet].filter((x) => subAns.has(x)));
                ansSet = tempSet;
            }
        }
        else if (subPart === "OR") {
            for (const subAns of ans) {
                let tempSet;
                tempSet = new Set([...ansSet, ...subAns]);
                ansSet = tempSet;
            }
        }
        return ansSet;
    }
    startMComparator(mPart, subPart, sectionSet) {
        const ansSet = new Set();
        let sectionArray = [];
        sectionSet.forEach((x) => sectionArray.push(x));
        let resultArray = [];
        if (subPart === "LT") {
            resultArray = sectionArray.filter((x) => {
                return x[(Object.keys(mPart)[0]).split("_")[1]] < mPart[Object.keys(mPart)[0]];
            });
        }
        else if (subPart === "GT") {
            resultArray = sectionArray.filter((x) => {
                return x[(Object.keys(mPart)[0]).split("_")[1]] > mPart[Object.keys(mPart)[0]];
            });
        }
        else if (subPart === "EQ") {
            resultArray = sectionArray.filter((x) => {
                return x[(Object.keys(mPart)[0]).split("_")[1]] === mPart[Object.keys(mPart)[0]];
            });
        }
        resultArray.forEach((x) => ansSet.add(x));
        return ansSet;
    }
    startSComparator(sPart, sectionSet) {
        const ansSet = new Set();
        let value = sPart[Object.keys(sPart)[0]];
        sectionSet.forEach((section) => {
            const trueValue = section[Object.keys(sPart)[0].split("_")[1]];
            if (value[0] === "*" && value.length === 1) {
                ansSet.add(section);
            }
            else if (value[0] === "*" && value[value.length - 1] === "*") {
                if (trueValue.includes(value.substring(1, value.length - 1))) {
                    ansSet.add(section);
                }
            }
            else if (value[0] === "*" && value[value.length - 1] !== "*") {
                if (trueValue.includes(value.substring(1, value.length))) {
                    if (trueValue.substring(trueValue.length - value.length + 1) === value.substring(1, value.length)) {
                        ansSet.add(section);
                    }
                }
            }
            else if (value[0] !== "*" && value[value.length - 1] === "*") {
                if (trueValue.includes(value.substring(0, value.length - 1))) {
                    if (trueValue.substring(0, value.length - 1) === value.substring(0, value.length - 1)) {
                        ansSet.add(section);
                    }
                }
            }
            else if (value[0] !== "*" && value[value.length - 1] !== "*") {
                if (value === trueValue) {
                    ansSet.add(section);
                }
            }
        });
        return ansSet;
    }
    startNegation(nPart, sectionSet) {
        const ans = this.startFilter(nPart, sectionSet);
        let ansSet;
        ansSet = new Set([...sectionSet].filter((x) => !ans.has(x)));
        return ansSet;
    }
    startColumns(cPart, sections) {
        const ans = [];
        for (const subPart of sections) {
            const resultsub = {};
            for (const subc of cPart) {
                if (subc.includes("_")) {
                    if (this.id === "courses") {
                        resultsub[subc] = subPart.getPart(subc.split("_")[1]);
                    }
                    else {
                        resultsub[subc] = subPart.getRPart(subc.split("_")[1]);
                    }
                }
                else {
                    resultsub[subc] = subPart[subc];
                }
            }
            ans.push(resultsub);
        }
        return ans;
    }
    startOrder(oPart, resultData) {
        if (typeof oPart === "string") {
            if (oPart.includes("_")) {
                resultData.sort((a, b) => {
                    if (a[oPart.split("_")[1]] > b[oPart.split("_")[1]]) {
                        return 1;
                    }
                    else if (a[oPart.split("_")[1]] < b[oPart.split("_")[1]]) {
                        return -1;
                    }
                    else {
                        return 0;
                    }
                });
            }
            else {
                resultData.sort((a, b) => {
                    if (a[oPart] > b[oPart]) {
                        return 1;
                    }
                    else if (a[oPart] < b[oPart]) {
                        return -1;
                    }
                    else {
                        return 0;
                    }
                });
            }
        }
        else {
            let keys = [];
            for (let key of oPart.keys) {
                if (key.includes("_")) {
                    key = key.split("_")[1];
                }
                keys.push(key);
            }
            if (oPart.dir === "UP") {
                resultData.sort((a, b) => {
                    if (keys.length === 1) {
                        if (a[keys[0]] > b[keys[0]]) {
                            return 1;
                        }
                        else if (a[keys[0]] < b[keys[0]]) {
                            return -1;
                        }
                        else if (a[keys[0]] === b[keys[0]]) {
                            return 0;
                        }
                    }
                    else {
                        return this.startOrderKeys(a, b, keys, 1, 0);
                    }
                });
            }
            else if (oPart.dir === "DOWN") {
                resultData.sort((a, b) => {
                    if (keys.length === 1) {
                        if (a[keys[0]] > b[keys[0]]) {
                            return -1;
                        }
                        else if (a[keys[0]] < b[keys[0]]) {
                            return 1;
                        }
                        else if (a[keys[0]] === b[keys[0]]) {
                            return 0;
                        }
                    }
                    else {
                        return this.startOrderKeys(a, b, keys, -1, 0);
                    }
                });
            }
        }
    }
    startOrderKeys(a, b, keys, dir, i) {
        if (a[keys[i]] > b[keys[i]]) {
            return dir;
        }
        else if (a[keys[i]] < b[keys[i]]) {
            return -1 * dir;
        }
        else if (keys.length - 1 === i) {
            return 0;
        }
        else {
            i++;
            return this.startOrderKeys(a, b, keys, dir, i);
        }
    }
    startTransformations(tPart, results) {
        let groups = {};
        for (const res of results) {
            if (this.group.length === 1) {
                const groupKey = res[this.group[0].split("_")[1]];
                if (groups[groupKey] === undefined) {
                    groups[groupKey] = [];
                }
                groups[groupKey].push(res);
            }
            else {
                let groupKey = "";
                for (const key of this.group) {
                    groupKey = groupKey + res[key.split("_")[1]];
                }
                if (groups[groupKey] === undefined) {
                    groups[groupKey] = [];
                }
                groups[groupKey].push(res);
            }
        }
        let result = [];
        if (this.query["TRANSFORMATIONS"]["APPLY"].length === 0) {
            for (const key of Object.keys(groups)) {
                let group = groups[key];
                result.push(group[0]);
            }
        }
        else {
            for (const applyRule of this.query["TRANSFORMATIONS"]["APPLY"]) {
                const applyToken = Object.keys(applyRule[Object.keys(applyRule)[0]])[0];
                const key = (applyRule[Object.keys(applyRule)[0]])[Object.keys(applyRule[Object.keys(applyRule)[0]])[0]].split("_")[1];
                for (const gKey of Object.keys(groups)) {
                    let group = groups[gKey];
                    let finalValue = 0;
                    if (applyToken === "MAX") {
                        let max = group[0][key];
                        for (const sub of group) {
                            if (sub[key] > max) {
                                max = sub[key];
                            }
                        }
                        finalValue = max;
                    }
                    else if (applyToken === "MIN") {
                        let min = group[0][key];
                        for (const sub of group) {
                            if (sub[key] < min) {
                                min = sub[key];
                            }
                        }
                        finalValue = min;
                    }
                    else if (applyToken === "AVG") {
                        let total = new decimal_js_1.default(0);
                        for (const sub of group) {
                            total = total.add((new decimal_js_1.default(sub[key])));
                        }
                        const avg = total.toNumber() / group.length;
                        const res = Number(avg.toFixed(2));
                        finalValue = res;
                    }
                    else if (applyToken === "COUNT") {
                        let temp = 0;
                        let tempArray = [];
                        for (const sub of group) {
                            if (!tempArray.includes(sub[key])) {
                                tempArray.push(sub[key]);
                                temp++;
                            }
                        }
                        finalValue = temp;
                    }
                    else if (applyToken === "SUM") {
                        let temp = 0;
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
                let group = groups[grKey];
                result.push(group[0]);
            }
        }
        return result;
    }
}
exports.default = QueryHelper;
//# sourceMappingURL=QueryHelper.js.map