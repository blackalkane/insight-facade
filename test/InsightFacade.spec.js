"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const IInsightFacade_1 = require("../src/controller/IInsightFacade");
const InsightFacade_1 = require("../src/controller/InsightFacade");
const Util_1 = require("../src/Util");
const TestUtil_1 = require("./TestUtil");
const Course_1 = require("../src/controller/Course");
const ParseZipBuilding_1 = require("../src/controller/ParseZipBuilding");
describe("InsightFacade Add/Remove Dataset", function () {
    const datasetsToLoad = {
        number: "./test/data/number.zip",
        courses: "./test/data/courses.zip",
        courses_copy: "./test/data/courses(copy).zip",
        courses_duplicateID: "./test/data/courses(one_valid_course).zip",
        courses_empty: "./test/data/courses(empty).zip",
        courses_empty_filed: "./test/data/courses(empty_Field).zip",
        corrupted: "./test/data/corrupted.zip",
        courses_invalidJSon: "./test/data/courses(invalidJSon).zip",
        courses_invalidJSonNonJSon: "./test/data/courses(invalidJSonNonJSon).zip",
        courses_json_missing_field: "./test/data/courses(JSon_missing_field).zip",
        courses_json_nonjson_invalid: "./test/data/courses(JSONwithNonJSONInvalid).zip",
        courses_many_folders: "./test/data/courses(many_folders).zip",
        courses_many_folders_invalid: "./test/data/courses(manyFoldersInvalid).zip",
        courses_many_folders_no_course: "./test/data/courses(manyFoldersNoCourse).zip",
        courses_many_folders_valid: "./test/data/courses(manyFoldersValid).zip",
        courses_missing_Field: "./test/data/courses(missing_field).zip",
        courses_multiValidCourses: "./test/data/courses(multiValidCourses).zip",
        courses_no_json: "./test/data/courses(no_JSON).zip",
        courses_no_json_file: "./test/data/courses(no_JSON_File).zip",
        courses_not_courses: "./test/data/courses(not_courses).zip",
        courses_notJSon: "./test/data/courses(not_JSon).zip",
        courses_notJSon_course: "./test/data/courses(not_JSon_course).zip",
        courses_one_section: "./test/data/courses(one_section).zip",
        courses_oneValid: "./test/data/courses(one_valid_course).zip",
        courses_oneValid_with_JSONandnonJSON: "./test/data/courses(oneValidwithJSONandNonJSON).zip",
        courses_oneValid_with_JSONInvalid: "./test/data/courses(oneValidwithJSONInvalid).zip",
        courses_oneValid_with_JSONnoJSON: "./test/data/courses(oneValidwithJSONonJSON).zip",
        courses_oneValid_with_noJSON: "./test/data/courses(oneValidwithNonJSON).zip",
        courses_oneValid_with_nonJSONInvalid: "./test/data/courses(oneValidwithNonJSONInvalid).zip",
        courses_onlyInvalid: "./test/data/courses(onlyInvalid).zip",
        courses_only_JSON_invalid: "./test/data/courses(onlyJSONInvalid).zip",
        courses_sameID: "./test/data/courses(one_valid_course).zip",
        courses_someValid_with_JSONandNonJSONInvalid: "./test/data/courses(someValidwithJSONandNonJSONInvalid).zip",
        courses_someValid_with_JSONInvalid: "./test/data/courses(someValidwithJSONInvalid).zip",
        courses_someValid_with_NonJSONInvalid: "./test/data/courses(someValidwithNonJSONInvalid).zip",
        courses_superInvalid_JSON: "./test/data/courses(superInvalid_JSON).zip",
        courses_two_folders: "./test/data/courses(two_folders).zip",
        courses_undefined: "./test/data/courses(undefined).zip",
        courses_validAndInvalidJSon: "./test/data/courses(validAndInvalidJSon).zip",
        courses_valid_with_NoJSON: "./test/data/courses(ValidwithNoJSON).zip",
        courses_with_folders: "./test/data/courses(with_folders).zip",
        courses_wrong_courses: "./test/data/wrong_courses.zip",
        courses_zero_section: "./test/data/courses(zero_Section).zip",
        courses_zip_inside: "./test/data/courses(zip_inside).zip",
        courses_zip_with_valid: "./test/data/courses(zip_with_valid).zip",
        spam: "./test/data/spam.zip",
        text: "./test/data/text.txt",
        rooms: "./test/data/rooms.zip",
    };
    let insightFacade;
    let datasets;
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            Util_1.default.test(`Before: ${this.test.parent.title}`);
            try {
                const loadDatasetPromises = [];
                for (const [id, path] of Object.entries(datasetsToLoad)) {
                    loadDatasetPromises.push(TestUtil_1.default.readFileAsync(path));
                }
                const loadedDatasets = (yield Promise.all(loadDatasetPromises)).map((buf, i) => {
                    return { [Object.keys(datasetsToLoad)[i]]: buf.toString("base64") };
                });
                datasets = Object.assign({}, ...loadedDatasets);
                chai_1.expect(Object.keys(datasets)).to.have.length.greaterThan(0);
            }
            catch (err) {
                chai_1.expect.fail("", "", `Failed to read one or more datasets. ${JSON.stringify(err)}`);
            }
            try {
                insightFacade = new InsightFacade_1.default();
            }
            catch (err) {
                Util_1.default.error(err);
            }
            finally {
                chai_1.expect(insightFacade).to.be.instanceOf(InsightFacade_1.default);
            }
        });
    });
    beforeEach(function () {
        Util_1.default.test(`BeforeTest: ${this.currentTest.title}`);
    });
    after(function () {
        Util_1.default.test(`After: ${this.test.parent.title}`);
    });
    afterEach(function () {
        Util_1.default.test(`AfterTest: ${this.currentTest.title}`);
    });
    it("Should add number", () => __awaiter(this, void 0, void 0, function* () {
        const id = "number";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("handle course should return null", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        let course = new Course_1.Course("test");
        try {
            response = yield course.handleData("", "");
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(null);
        }
    }));
    it("Should have empty dataset", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.listDatasets();
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal([]);
        }
    }));
    it("Should add a valid dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal([id]);
        }
    }));
    it("Should add a valid dataset with different id", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_sameID";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(["courses", id]);
        }
    }));
    it("Should remove a courses_sameID dataset", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.removeDataset("courses_sameID");
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal("courses_sameID");
        }
    }));
    it("Should add a valid dataset with many folders", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_many_folders";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(["courses", id]);
        }
    }));
    it("Should remove many folders", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.removeDataset("courses_many_folders");
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal("courses_many_folders");
        }
    }));
    it("Should add courses_copy", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_copy";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(["courses", id]);
        }
    }));
    it("Should add courses_many_folders_valid", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_many_folders_valid";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(["courses", "courses_copy", id]);
        }
    }));
    it("Should add courses_oneValid_with_JSONInvalid", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_oneValid_with_JSONInvalid";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(["courses", "courses_copy",
                "courses_many_folders_valid", id]);
        }
    }));
    it("Should add courses_oneValid_with_JSONandnonJSON", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_oneValid_with_JSONandnonJSON";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(["courses", "courses_copy",
                "courses_many_folders_valid", "courses_oneValid_with_JSONInvalid", id]);
        }
    }));
    it("Should add courses_oneValid_with_JSONnoJSON", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_oneValid_with_JSONnoJSON";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(["courses", "courses_copy",
                "courses_many_folders_valid", "courses_oneValid_with_JSONInvalid",
                "courses_oneValid_with_JSONandnonJSON", id]);
        }
    }));
    it("Should add courses_oneValid_with_noJSON", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_oneValid_with_noJSON";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(["courses", "courses_copy",
                "courses_many_folders_valid", "courses_oneValid_with_JSONInvalid",
                "courses_oneValid_with_JSONandnonJSON", "courses_oneValid_with_JSONnoJSON", id]);
        }
    }));
    it("Should add courses_oneValid_with_nonJSONInvalid", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_oneValid_with_nonJSONInvalid";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(["courses", "courses_copy",
                "courses_many_folders_valid", "courses_oneValid_with_JSONInvalid",
                "courses_oneValid_with_JSONandnonJSON", "courses_oneValid_with_JSONnoJSON",
                "courses_oneValid_with_noJSON", id]);
        }
    }));
    it("Should add courses_one_section", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_one_section";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(["courses", "courses_copy",
                "courses_many_folders_valid", "courses_oneValid_with_JSONInvalid",
                "courses_oneValid_with_JSONandnonJSON", "courses_oneValid_with_JSONnoJSON",
                "courses_oneValid_with_noJSON", "courses_oneValid_with_nonJSONInvalid", id]);
        }
    }));
    it("Should add courses_someValid_with_JSONandNonJSONInvalid", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_someValid_with_JSONandNonJSONInvalid";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(["courses", "courses_copy",
                "courses_many_folders_valid", "courses_oneValid_with_JSONInvalid",
                "courses_oneValid_with_JSONandnonJSON", "courses_oneValid_with_JSONnoJSON",
                "courses_oneValid_with_noJSON", "courses_oneValid_with_nonJSONInvalid",
                "courses_one_section", id]);
        }
    }));
    it("Should add courses_someValid_with_JSONInvalid", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_someValid_with_JSONInvalid";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(["courses", "courses_copy",
                "courses_many_folders_valid", "courses_oneValid_with_JSONInvalid",
                "courses_oneValid_with_JSONandnonJSON", "courses_oneValid_with_JSONnoJSON",
                "courses_oneValid_with_noJSON", "courses_oneValid_with_nonJSONInvalid",
                "courses_one_section", "courses_someValid_with_JSONandNonJSONInvalid", id]);
        }
    }));
    it("Should add courses_someValid_with_NonJSONInvalid", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_someValid_with_NonJSONInvalid";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(["courses", "courses_copy",
                "courses_many_folders_valid", "courses_oneValid_with_JSONInvalid",
                "courses_oneValid_with_JSONandnonJSON", "courses_oneValid_with_JSONnoJSON",
                "courses_oneValid_with_noJSON", "courses_oneValid_with_nonJSONInvalid",
                "courses_one_section", "courses_someValid_with_JSONandNonJSONInvalid",
                "courses_someValid_with_JSONInvalid", id]);
        }
    }));
    it("Should add courses_valid_with_NoJSON", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_valid_with_NoJSON";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(["courses", "courses_copy",
                "courses_many_folders_valid", "courses_oneValid_with_JSONInvalid",
                "courses_oneValid_with_JSONandnonJSON", "courses_oneValid_with_JSONnoJSON",
                "courses_oneValid_with_noJSON", "courses_oneValid_with_nonJSONInvalid",
                "courses_one_section", "courses_someValid_with_JSONandNonJSONInvalid",
                "courses_someValid_with_JSONInvalid", "courses_someValid_with_NonJSONInvalid", id]);
        }
    }));
    it("Should add courses_with_folders", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_with_folders";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(["courses", "courses_copy",
                "courses_many_folders_valid", "courses_oneValid_with_JSONInvalid",
                "courses_oneValid_with_JSONandnonJSON", "courses_oneValid_with_JSONnoJSON",
                "courses_oneValid_with_noJSON", "courses_oneValid_with_nonJSONInvalid",
                "courses_one_section", "courses_someValid_with_JSONandNonJSONInvalid",
                "courses_someValid_with_JSONInvalid", "courses_someValid_with_NonJSONInvalid",
                "courses_valid_with_NoJSON", id]);
        }
    }));
    it("Should remove courses_copy", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_copy";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(id);
        }
    }));
    it("Should remove courses_copy", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_copy";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.NotFoundError);
        }
    }));
    it("Should remove the courses_many_folders_valid dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_many_folders_valid";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(id);
        }
    }));
    it("Should remove courses_oneValid_with_JSONInvalid", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_oneValid_with_JSONInvalid";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(id);
        }
    }));
    it("Should remove courses_oneValid_with_noJSON dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_oneValid_with_noJSON";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(id);
        }
    }));
    it("Should remove courses_oneValid_with_nonJSONInvalid", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_oneValid_with_nonJSONInvalid";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(id);
        }
    }));
    it("Should remove courses_oneValid_with_JSONandnonJSON", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_oneValid_with_JSONandnonJSON";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(id);
        }
    }));
    it("Should remove courses_oneValid_with_JSONnoJSON dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_oneValid_with_JSONnoJSON";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(id);
        }
    }));
    it("Should remove courses_one_section dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_one_section";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(id);
        }
    }));
    it("Should remove courses_someValid_with_JSONandNonJSONInvalid", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_someValid_with_JSONandNonJSONInvalid";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(id);
        }
    }));
    it("Should remove courses_someValid_with_JSONInvalid", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_someValid_with_JSONInvalid";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(id);
        }
    }));
    it("Should remove courses_someValid_with_NonJSONInvalid", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_someValid_with_NonJSONInvalid";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(id);
        }
    }));
    it("Should remove the courses_valid_with_NoJSON dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_valid_with_NoJSON";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(id);
        }
    }));
    it("Should remove the courses_with_folders dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_with_folders";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(id);
        }
    }));
    it("Should have 1 elemnets", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        let expected = { id: "courses", kind: IInsightFacade_1.InsightDatasetKind.Courses, numRows: 64612 };
        try {
            response = yield insightFacade.listDatasets();
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal([expected]);
        }
    }));
    it("Should add a dataset with one valid course", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_oneValid";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(["courses", id]);
        }
    }));
    it("Should lists 1 elemnets", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        let expected = { id: "courses", kind: IInsightFacade_1.InsightDatasetKind.Courses, numRows: 64612 };
        let expected2 = { id: "courses_oneValid", kind: IInsightFacade_1.InsightDatasetKind.Courses, numRows: 8 };
        try {
            response = yield insightFacade.listDatasets();
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal([expected, expected2]);
        }
    }));
    it("Should add a dataset with valid and invalid courses", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_validAndInvalidJSon";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(["courses", "courses_oneValid", id]);
        }
    }));
    it("Should add a dataset with multiple valid JSon ", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_multiValidCourses";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(["courses", "courses_oneValid", "courses_validAndInvalidJSon", id]);
        }
    }));
    it("Should remove the courses_multiValidCourses dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_multiValidCourses";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(id);
        }
    }));
    it("Should remove the courses_oneValid dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_oneValid";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(id);
        }
    }));
    it("Should remove the courses_validAndInvalidJSon dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_validAndInvalidJSon";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(id);
        }
    }));
    it("Should add a dataset with multiple valid JSon ", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_duplicateID";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(["courses", id]);
        }
    }));
    it("Should remove the courses dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_duplicateID";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(id);
        }
    }));
    it("Should add an invalid dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_empty";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should not add an invalid dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_notJSon";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should add an invalid dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "text";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should add a dataset called spam", () => __awaiter(this, void 0, void 0, function* () {
        const id = "spam";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should add courses_no_json_file", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_no_json_file";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should add courses_onlyInvalid", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_onlyInvalid";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should add invalid json courses", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_json_nonjson_invalid";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should add a dataset with invalid JSon and invalid JSOn format", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_invalidJSonNonJSon";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should add a corrupted file", () => __awaiter(this, void 0, void 0, function* () {
        const id = "corrupted";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should add a dataset with invalid JSon ", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_invalidJSon";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should add a dataset with multiple valid JSon ", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_notJSon_course";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should add a NULL dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = null;
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should add an undefined object", () => __awaiter(this, void 0, void 0, function* () {
        const id = undefined;
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should add a dataset with multiple valid JSon ", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_zero_section";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should add a dataset with courses_multi_file", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_multi_file";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should add an wrong courses", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_wrong_courses";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should add invalid json courses", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_only_JSON_invalid";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should add an undefined object", () => __awaiter(this, void 0, void 0, function* () {
        const id = "";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should add an duplicate object", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should remove the courses dataset");
    it("Should remove a non-existing dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "does_not_exist";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.NotFoundError);
        }
    }));
    it("Should remove a dataset whose id is null", () => __awaiter(this, void 0, void 0, function* () {
        const id = null;
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should remove a non-existing dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = undefined;
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should remove an exmpty string", () => __awaiter(this, void 0, void 0, function* () {
        const id = "";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should add a dataset with zip and valid JSON format", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_zip_with_valid";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(["courses", id]);
        }
    }));
    it("Should remove a courses_zip_with_valid dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses_zip_with_valid";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(id);
        }
    }));
    it("Should remove the courses dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal(id);
        }
    }));
    it("Should remove courses again", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.NotFoundError);
        }
    }));
    it("add Dataset parameter is null null", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset(null, null, IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("add Dataset parameter is null undefined", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset("courses", undefined, IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is null", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset("courses", "", IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is undefined null", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset(undefined, null, IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is empty null", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset("", null, IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is courses null", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset("courses", null, IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is null null", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset(null, null, IInsightFacade_1.InsightDatasetKind.Rooms);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is courses undefined", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset("courses", undefined, IInsightFacade_1.InsightDatasetKind.Rooms);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is courses", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset("courses", "", IInsightFacade_1.InsightDatasetKind.Rooms);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is undefined null", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset(undefined, null, IInsightFacade_1.InsightDatasetKind.Rooms);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is courses null", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset("courses", null, IInsightFacade_1.InsightDatasetKind.Rooms);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is empty null", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset("", null, IInsightFacade_1.InsightDatasetKind.Rooms);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("add Dataset parameter is null undefined", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset("courses", datasets["courses"], null);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is null", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset("courses", datasets["courses"], undefined);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("add Dataset parameter is null null", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset(null, null, null);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("add Dataset parameter is null undefined", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset(null, undefined, null);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is null", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset(null, "", null);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is undefined null", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset(undefined, null, null);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is undefined empty", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset(undefined, "", null);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is undefined undefined", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset(undefined, undefined, null);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is empty null", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset("", null, null);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is empty undefined", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset("", undefined, null);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is empty empty", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset("", "", null);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is null null", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset(null, null, undefined);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is null undefined", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset(null, undefined, undefined);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is null", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset(null, "", undefined);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is undefined null", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset(undefined, null, undefined);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is undefined empty", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset(undefined, "", undefined);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is undefined undefined", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset(undefined, undefined, undefined);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is empty null", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset("", null, undefined);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is empty undefined", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset("", undefined, undefined);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("addDataset parameter is empty empty", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.addDataset("", "", undefined);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should have empty dataset", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.listDatasets();
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal([]);
        }
    }));
    it("addDataset room", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        let id = "rooms";
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Rooms);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal([id]);
        }
    }));
    it("get lat", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        let id = "rooms";
        let x = new ParseZipBuilding_1.ParseZipBuilding();
        try {
            response = yield x.getCoordinates("6245 Agronomy Road V6T 1Z4");
            let stub = response;
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal({ lat: 49.26125, lon: -123.24807 });
        }
    }));
    it("should list rooms", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        let expected = { id: "rooms", kind: IInsightFacade_1.InsightDatasetKind.Rooms, numRows: 364 };
        try {
            response = yield insightFacade.listDatasets();
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal([expected]);
        }
    }));
});
describe("InsightFacade PerformQuery", () => {
    const datasetsToQuery = {
        courses: "./test/data/courses.zip",
        rooms: "./test/data/rooms.zip",
    };
    let insightFacade;
    let testQueries = [];
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            Util_1.default.test(`Before: ${this.test.parent.title}`);
            try {
                testQueries = yield TestUtil_1.default.readTestQueries();
                chai_1.expect(testQueries).to.have.length.greaterThan(0);
            }
            catch (err) {
                chai_1.expect.fail("", "", `Failed to read one or more test queries. ${JSON.stringify(err)}`);
            }
            try {
                insightFacade = new InsightFacade_1.default();
            }
            catch (err) {
                Util_1.default.error(err);
            }
            finally {
                chai_1.expect(insightFacade).to.be.instanceOf(InsightFacade_1.default);
            }
            try {
                const loadDatasetPromises = [];
                for (const [id, path] of Object.entries(datasetsToQuery)) {
                    loadDatasetPromises.push(TestUtil_1.default.readFileAsync(path));
                }
                const loadedDatasets = (yield Promise.all(loadDatasetPromises)).map((buf, i) => {
                    return { [Object.keys(datasetsToQuery)[i]]: buf.toString("base64") };
                });
                chai_1.expect(loadedDatasets).to.have.length.greaterThan(0);
                const responsePromises = [];
                const datasets = Object.assign({}, ...loadedDatasets);
                for (const [id, content] of Object.entries(datasets)) {
                    if (id === "rooms") {
                        responsePromises.push(insightFacade.addDataset(id, content, IInsightFacade_1.InsightDatasetKind.Rooms));
                    }
                    else {
                        responsePromises.push(insightFacade.addDataset(id, content, IInsightFacade_1.InsightDatasetKind.Courses));
                    }
                }
                try {
                    const responses = yield Promise.all(responsePromises);
                    responses.forEach((response) => chai_1.expect(response).to.be.an("array"));
                }
                catch (err) {
                    Util_1.default.warn(`Ignoring addDataset errors. For D1, you should allow errors to fail the Before All hook.`);
                }
            }
            catch (err) {
                chai_1.expect.fail("", "", `Failed to read one or more datasets. ${JSON.stringify(err)}`);
            }
        });
    });
    beforeEach(function () {
        Util_1.default.test(`BeforeTest: ${this.currentTest.title}`);
    });
    after(function () {
        Util_1.default.test(`After: ${this.test.parent.title}`);
    });
    afterEach(function () {
        Util_1.default.test(`AfterTest: ${this.currentTest.title}`);
    });
    it("Should run test queries", () => {
        describe("Dynamic InsightFacade PerformQuery tests", () => {
            for (const test of testQueries) {
                it(`[${test.filename}] ${test.title}`, () => __awaiter(this, void 0, void 0, function* () {
                    let response;
                    try {
                        response = yield insightFacade.performQuery(test.query);
                    }
                    catch (err) {
                        response = err;
                    }
                    finally {
                        if (test.isQueryValid) {
                            chai_1.expect(response).to.deep.equal(test.result);
                        }
                        else {
                            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
                        }
                    }
                }));
            }
        });
    });
});
//# sourceMappingURL=InsightFacade.spec.js.map