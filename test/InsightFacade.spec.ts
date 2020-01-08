import {expect} from "chai";

import {
    InsightDataset,
    InsightDatasetKind,
    InsightError, NotFoundError,
} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import TestUtil from "./TestUtil";
import {Course} from "../src/controller/Course";
import {ParseZipBuilding} from "../src/controller/ParseZipBuilding";

// This should match the JSON schema described in test/query.schema.json
// except 'filename' which is injected when the file is read.
export interface ITestQuery {
    title: string;
    query: any;  // make any to allow testing structurally invalid queries
    isQueryValid: boolean;
    result: string | string[];
    filename: string;  // This is injected when reading the file
}

describe("InsightFacade Add/Remove Dataset", function () {
    // Reference any datasets you've added to test/data here and they will
    // automatically be loaded in the Before All hook.
    const datasetsToLoad: { [id: string]: string } = {
        number: "./test/data/number.zip",
        courses: "./test/data/courses.zip", //
        courses_copy: "./test/data/courses(copy).zip",      //
        courses_duplicateID: "./test/data/courses(one_valid_course).zip",   //
        courses_empty: "./test/data/courses(empty).zip",    //
        courses_empty_filed: "./test/data/courses(empty_Field).zip", /// not tested
        corrupted: "./test/data/corrupted.zip",             //
        courses_invalidJSon: "./test/data/courses(invalidJSon).zip",    //
        courses_invalidJSonNonJSon: "./test/data/courses(invalidJSonNonJSon).zip",  //
        courses_json_missing_field: "./test/data/courses(JSon_missing_field).zip",   //
        courses_json_nonjson_invalid: "./test/data/courses(JSONwithNonJSONInvalid).zip",    //
        courses_many_folders: "./test/data/courses(many_folders).zip",      //
        courses_many_folders_invalid: "./test/data/courses(manyFoldersInvalid).zip",    //
        courses_many_folders_no_course: "./test/data/courses(manyFoldersNoCourse).zip", //
        courses_many_folders_valid: "./test/data/courses(manyFoldersValid).zip",    //
        courses_missing_Field: "./test/data/courses(missing_field).zip", ///
        courses_multiValidCourses: "./test/data/courses(multiValidCourses).zip",        //
        courses_no_json: "./test/data/courses(no_JSON).zip",    //
        courses_no_json_file: "./test/data/courses(no_JSON_File).zip",  //
        courses_not_courses: "./test/data/courses(not_courses).zip",        ///
        courses_notJSon: "./test/data/courses(not_JSon).zip",   //
        courses_notJSon_course: "./test/data/courses(not_JSon_course).zip", ////
        courses_one_section: "./test/data/courses(one_section).zip",    //
        courses_oneValid: "./test/data/courses(one_valid_course).zip",  //
        courses_oneValid_with_JSONandnonJSON: "./test/data/courses(oneValidwithJSONandNonJSON).zip",    //
        courses_oneValid_with_JSONInvalid: "./test/data/courses(oneValidwithJSONInvalid).zip",  //
        courses_oneValid_with_JSONnoJSON: "./test/data/courses(oneValidwithJSONonJSON).zip",    //
        courses_oneValid_with_noJSON: "./test/data/courses(oneValidwithNonJSON).zip",    //
        courses_oneValid_with_nonJSONInvalid: "./test/data/courses(oneValidwithNonJSONInvalid).zip",    //
        courses_onlyInvalid: "./test/data/courses(onlyInvalid).zip",
        courses_only_JSON_invalid: "./test/data/courses(onlyJSONInvalid).zip",  //
        courses_sameID: "./test/data/courses(one_valid_course).zip",
        courses_someValid_with_JSONandNonJSONInvalid: "./test/data/courses(someValidwithJSONandNonJSONInvalid).zip", //
        courses_someValid_with_JSONInvalid: "./test/data/courses(someValidwithJSONInvalid).zip",    //
        courses_someValid_with_NonJSONInvalid: "./test/data/courses(someValidwithNonJSONInvalid).zip",  //
        courses_superInvalid_JSON: "./test/data/courses(superInvalid_JSON).zip",       //
        courses_two_folders: "./test/data/courses(two_folders).zip",        ///
        courses_undefined: "./test/data/courses(undefined).zip",    //
        courses_validAndInvalidJSon: "./test/data/courses(validAndInvalidJSon).zip", //
        courses_valid_with_NoJSON: "./test/data/courses(ValidwithNoJSON).zip",  //
        courses_with_folders: "./test/data/courses(with_folders).zip",  //
        courses_wrong_courses: "./test/data/wrong_courses.zip", //
        courses_zero_section: "./test/data/courses(zero_Section).zip", ////
        courses_zip_inside: "./test/data/courses(zip_inside).zip",
        courses_zip_with_valid: "./test/data/courses(zip_with_valid).zip",
        spam: "./test/data/spam.zip",   //
        text: "./test/data/text.txt",   //
        // -------------------------- rooms ------------------
        rooms: "./test/data/rooms.zip",
    };

    let insightFacade: InsightFacade;
    let datasets: { [id: string]: string };

    before(async function () {
        Log.test(`Before: ${this.test.parent.title}`);

        try {
            const loadDatasetPromises: Array<Promise<Buffer>> = [];
            for (const [id, path] of Object.entries(datasetsToLoad)) {
                loadDatasetPromises.push(TestUtil.readFileAsync(path));
            }
            const loadedDatasets = (await Promise.all(loadDatasetPromises)).map((buf, i) => {
                return { [Object.keys(datasetsToLoad)[i]]: buf.toString("base64") };
            });
            datasets = Object.assign({}, ...loadedDatasets);
            expect(Object.keys(datasets)).to.have.length.greaterThan(0);
        } catch (err) {
            expect.fail("", "", `Failed to read one or more datasets. ${JSON.stringify(err)}`);
        }

        try {
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        } finally {
            expect(insightFacade).to.be.instanceOf(InsightFacade);
        }
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    it("Should add number", async () => {
        const id: string = "number";
        let response: string[];

        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    it("handle course should return null", async () => {
        let response: Course;
        let course = new Course("test");

        try {
            response = await course.handleData("", "");
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(null);
        }
    });

    it("Should have empty dataset", async () => {
        let response;
        try {
            response = await insightFacade.listDatasets();
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal([]);
        }
    });

    // SUCCESS !!!!
    it("Should add a valid dataset", async () => {
        const id: string = "courses";
        let response: string[];

        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal([id]);
        }
    });

    // SUCCESS !!!! add same data sey with different id
    it("Should add a valid dataset with different id", async () => {
        const id: string = "courses_sameID";
        let response: string[];

        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(["courses", id]);
        }
    });

    // remove data set
    it("Should remove a courses_sameID dataset", async () => {
        let response;
        try {
            response = await insightFacade.removeDataset("courses_sameID");
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal("courses_sameID");
        }
    });

    // SUCCESS !!!test add many folders
    it("Should add a valid dataset with many folders", async () => {
        const id: string = "courses_many_folders";
        let response: string[];

        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(["courses", id]);
        }
    });

    // remove dataset
    it("Should remove many folders", async () => {
        let response;
        try {
            response = await insightFacade.removeDataset("courses_many_folders");
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal("courses_many_folders");
        }
    });

    // -------------------------Successful add--------------------------------
    // SUCCESS !!! test add courses_copy
    it("Should add courses_copy", async () => {
        const id: string = "courses_copy";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(["courses", id]);
        }
    });

    // SUCCESS !!! Test add courses_many_folders_valid
    it("Should add courses_many_folders_valid", async () => {
        const id: string = "courses_many_folders_valid";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(["courses", "courses_copy", id]);
        }
    });

    // SUCCESS !!! test add courses_oneValid_with_JSONInvalid
    it("Should add courses_oneValid_with_JSONInvalid", async () => {
        const id: string = "courses_oneValid_with_JSONInvalid";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(["courses", "courses_copy",
                "courses_many_folders_valid", id]);
        }
    });

    // SUCCESS !!! test add courses_oneValid_with_JSONandnonJSON
    it("Should add courses_oneValid_with_JSONandnonJSON", async () => {
        const id: string = "courses_oneValid_with_JSONandnonJSON";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(["courses", "courses_copy",
                "courses_many_folders_valid", "courses_oneValid_with_JSONInvalid", id]);
        }
    });

    // SUCCESS !!! Test add courses_oneValid_with_JSONnoJSON
    it("Should add courses_oneValid_with_JSONnoJSON", async () => {
        const id: string = "courses_oneValid_with_JSONnoJSON";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(["courses", "courses_copy",
                "courses_many_folders_valid", "courses_oneValid_with_JSONInvalid",
                "courses_oneValid_with_JSONandnonJSON", id]);
        }
    });

    // SUCCESS !!! Test add courses_oneValid_with_noJSON
    it("Should add courses_oneValid_with_noJSON", async () => {
        const id: string = "courses_oneValid_with_noJSON";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(["courses", "courses_copy",
                "courses_many_folders_valid", "courses_oneValid_with_JSONInvalid",
                "courses_oneValid_with_JSONandnonJSON", "courses_oneValid_with_JSONnoJSON", id]);
        }
    });

    // SUCCESS !!! test add courses_oneValid_with_nonJSONInvalid
    it("Should add courses_oneValid_with_nonJSONInvalid", async () => {
        const id: string = "courses_oneValid_with_nonJSONInvalid";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(["courses", "courses_copy",
                "courses_many_folders_valid", "courses_oneValid_with_JSONInvalid",
                "courses_oneValid_with_JSONandnonJSON", "courses_oneValid_with_JSONnoJSON",
                "courses_oneValid_with_noJSON", id]);
        }
    });

    // SUCCESS !!! Test add courses_one_section
    it("Should add courses_one_section", async () => {
        const id: string = "courses_one_section";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(["courses", "courses_copy",
                "courses_many_folders_valid", "courses_oneValid_with_JSONInvalid",
                "courses_oneValid_with_JSONandnonJSON", "courses_oneValid_with_JSONnoJSON",
                "courses_oneValid_with_noJSON", "courses_oneValid_with_nonJSONInvalid", id]);
        }
    });

    // SUCCESS !!! test add courses_someValid_with_JSONandNonJSONInvalid
    it("Should add courses_someValid_with_JSONandNonJSONInvalid", async () => {
        const id: string = "courses_someValid_with_JSONandNonJSONInvalid";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(["courses", "courses_copy",
                "courses_many_folders_valid", "courses_oneValid_with_JSONInvalid",
                "courses_oneValid_with_JSONandnonJSON", "courses_oneValid_with_JSONnoJSON",
                "courses_oneValid_with_noJSON", "courses_oneValid_with_nonJSONInvalid",
                "courses_one_section", id]);
        }
    });

    // SUCCESS !!! test add courses_someValid_with_JSONInvalid
    it("Should add courses_someValid_with_JSONInvalid", async () => {
        const id: string = "courses_someValid_with_JSONInvalid";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(["courses", "courses_copy",
                "courses_many_folders_valid", "courses_oneValid_with_JSONInvalid",
                "courses_oneValid_with_JSONandnonJSON", "courses_oneValid_with_JSONnoJSON",
                "courses_oneValid_with_noJSON", "courses_oneValid_with_nonJSONInvalid",
                "courses_one_section", "courses_someValid_with_JSONandNonJSONInvalid", id]);
        }
    });

    // SUCCESS !!! test add courses_someValid_with_NonJSONInvalid
    it("Should add courses_someValid_with_NonJSONInvalid", async () => {
        const id: string = "courses_someValid_with_NonJSONInvalid";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(["courses", "courses_copy",
                "courses_many_folders_valid", "courses_oneValid_with_JSONInvalid",
                "courses_oneValid_with_JSONandnonJSON", "courses_oneValid_with_JSONnoJSON",
                "courses_oneValid_with_noJSON", "courses_oneValid_with_nonJSONInvalid",
                "courses_one_section", "courses_someValid_with_JSONandNonJSONInvalid",
                "courses_someValid_with_JSONInvalid", id]);
        }
    });

    // SUCCESS !!! Test add courses_valid_with_NoJSON
    it("Should add courses_valid_with_NoJSON", async () => {
        const id: string = "courses_valid_with_NoJSON";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(["courses", "courses_copy",
                "courses_many_folders_valid", "courses_oneValid_with_JSONInvalid",
                "courses_oneValid_with_JSONandnonJSON", "courses_oneValid_with_JSONnoJSON",
                "courses_oneValid_with_noJSON", "courses_oneValid_with_nonJSONInvalid",
                "courses_one_section", "courses_someValid_with_JSONandNonJSONInvalid",
                "courses_someValid_with_JSONInvalid", "courses_someValid_with_NonJSONInvalid", id]);
        }
    });

    // SUCCESS !!! Test add courses_with_folders
    it("Should add courses_with_folders", async () => {
        const id: string = "courses_with_folders";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(["courses", "courses_copy",
                "courses_many_folders_valid", "courses_oneValid_with_JSONInvalid",
                "courses_oneValid_with_JSONandnonJSON", "courses_oneValid_with_JSONnoJSON",
                "courses_oneValid_with_noJSON", "courses_oneValid_with_nonJSONInvalid",
                "courses_one_section", "courses_someValid_with_JSONandNonJSONInvalid",
                "courses_someValid_with_JSONInvalid", "courses_someValid_with_NonJSONInvalid",
                "courses_valid_with_NoJSON", id]);
        }
    });

    // ------------------------REMOVEALL-----------------------------------

    // remove all the previously added dataset except courses
    it("Should remove courses_copy", async () => {
        const id: string = "courses_copy";
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(id);
        }
    });

    it("Should remove courses_copy", async () => {
        const id: string = "courses_copy";
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(NotFoundError);
        }
    });

    // remove courses_many_folders_valid
    it("Should remove the courses_many_folders_valid dataset", async () => {
        const id: string = "courses_many_folders_valid";
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(id);
        }
    });

    // remove courses_oneValid_with_JSONInvalid
    it("Should remove courses_oneValid_with_JSONInvalid", async () => {
        const id: string = "courses_oneValid_with_JSONInvalid";
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(id);
        }
    });

    // remove courses_oneValid_with_noJSON
    it("Should remove courses_oneValid_with_noJSON dataset", async () => {
        const id: string = "courses_oneValid_with_noJSON";
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(id);
        }
    });

    // remove courses_oneValid_with_nonJSONInvalid
    it("Should remove courses_oneValid_with_nonJSONInvalid", async () => {
        const id: string = "courses_oneValid_with_nonJSONInvalid";
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(id);
        }
    });

    // remove courses_oneValid_with_JSONandnonJSON
    it("Should remove courses_oneValid_with_JSONandnonJSON", async () => {
        const id: string = "courses_oneValid_with_JSONandnonJSON";
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(id);
        }
    });

    // remove courses_oneValid_with_JSONnoJSON
    it("Should remove courses_oneValid_with_JSONnoJSON dataset", async () => {
        const id: string = "courses_oneValid_with_JSONnoJSON";
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(id);
        }
    });

    // remove courses_one_section
    it("Should remove courses_one_section dataset", async () => {
        const id: string = "courses_one_section";
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(id);
        }
    });

    // remove courses_someValid_with_JSONandNonJSONInvalid
    it("Should remove courses_someValid_with_JSONandNonJSONInvalid", async () => {
        const id: string = "courses_someValid_with_JSONandNonJSONInvalid";
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(id);
        }
    });

    // remove courses_someValid_with_JSONInvalid
    it("Should remove courses_someValid_with_JSONInvalid", async () => {
        const id: string = "courses_someValid_with_JSONInvalid";
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(id);
        }
    });

    // remove courses_someValid_with_NonJSONInvalid
    it("Should remove courses_someValid_with_NonJSONInvalid", async () => {
        const id: string = "courses_someValid_with_NonJSONInvalid";
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(id);
        }
    });

    // remove courses_valid_with_NoJSON
    it("Should remove the courses_valid_with_NoJSON dataset", async () => {
        const id: string = "courses_valid_with_NoJSON";
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(id);
        }
    });

    // remove courses_with_folders
    it("Should remove the courses_with_folders dataset", async () => {
        const id: string = "courses_with_folders";
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(id);
        }
    });

    // ---------------------------Random tests------------------------------------

    // list data set with courses only
    it("Should have 1 elemnets", async () => {
        let response;
        let expected: InsightDataset = {id: "courses", kind: InsightDatasetKind.Courses, numRows: 64612};
        try {
            response = await insightFacade.listDatasets();
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal([expected]);
        }
    });

    // SUCCESS!!! Test when there is one valid course in course
    it("Should add a dataset with one valid course", async () => {
        const id: string = "courses_oneValid";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(["courses", id]);
        }
    });

    it("Should lists 1 elemnets", async () => {
        let response;
        let expected: InsightDataset = {id: "courses", kind: InsightDatasetKind.Courses, numRows: 64612};
        let expected2: InsightDataset = {id: "courses_oneValid", kind: InsightDatasetKind.Courses, numRows: 8};
        try {
            response = await insightFacade.listDatasets();
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal([expected, expected2]);
        }
    });

    // SUCCESS !!! Test when there is invalid and valid JSon file mixed in courses
    it("Should add a dataset with valid and invalid courses", async () => {
        const id: string = "courses_validAndInvalidJSon";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(["courses", "courses_oneValid", id]);
        }
    });

    // SUCCESS !!!! Test when the dataset contains multiple JSon files
    it("Should add a dataset with multiple valid JSon ", async () => {
        const id: string = "courses_multiValidCourses";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(["courses", "courses_oneValid", "courses_validAndInvalidJSon", id]);
        }
    });

    it("Should remove the courses_multiValidCourses dataset", async () => {
        const id: string = "courses_multiValidCourses";
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(id);
        }
    });

    it("Should remove the courses_oneValid dataset", async () => {
        const id: string = "courses_oneValid";
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(id);
        }
    });

    it("Should remove the courses_validAndInvalidJSon dataset", async () => {
        const id: string = "courses_validAndInvalidJSon";
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(id);
        }
    });

    // SUCCESS !!! Test when add the same dataset with different ID
    it("Should add a dataset with multiple valid JSon ", async () => {
        const id: string = "courses_duplicateID";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(["courses", id]);
        }
    });

    // remove duplicate id
    it("Should remove the courses dataset", async () => {
        const id: string = "courses_duplicateID";
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(id);
        }
    });

    // ------------------ add Invalid dataset-------------

    // Test when test file contains only a zip file
    /*it("Should add a file that doesn't exist", async () => {
        const id: string = "courses_zip_inside";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(InsightError);
        }
    });*/

    // Test when test file is not found
    /*it("Should add a file that doesn't exist", async () => {
        const id: string = "does_not_exist";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(InsightError);
        }
    });*/

    // Test when courses.zip is empty
    it("Should add an invalid dataset", async () => {
        const id: string = "courses_empty";  // ?????? should I add .txt?
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when the file is not JSon formatted
    it("Should not add an invalid dataset", async () => {
        const id: string = "courses_notJSon";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);

        }
    });

    // Test when input is not a zip file
    it("Should add an invalid dataset", async () => {
        const id: string = "text";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when input file is not called course
    it("Should add a dataset called spam", async () => {
        const id: string = "spam";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // test add courses_no_json_file
    it("Should add courses_no_json_file", async () => {
        const id: string = "courses_no_json_file";
        let response: string[];

        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // test add courses_onlyInvalid
    it("Should add courses_onlyInvalid", async () => {
        const id: string = "courses_onlyInvalid";
        let response: string[];

        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // test many folder no course
    /*it("Should add a valid dataset with many folders with no course", async () => {
        const id: string = "courses_many_folders_no_course";
        let response: string[];

        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });*/

    // test json with non jason
    it("Should add invalid json courses", async () => {
        const id: string = "courses_json_nonjson_invalid";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when there is invalid JSon and invalid non JSon format
    it("Should add a dataset with invalid JSon and invalid JSOn format", async () => {
        const id: string = "courses_invalidJSonNonJSon";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test for courses_not_courses
    /* it("Should add a dataset courses_not_courses", async () => {
        const id: string = "courses_not_courses";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    }); */

    // test many non courses
    /* it("Should add a valid dataset with many folders with no course", async () => {
        const id: string = "courses_many_folders_no_course";
        let response: string[];

        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });*/

    // test corrupted file
    it("Should add a corrupted file", async () => {
        const id: string = "corrupted";
        let response: string[];

        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when the dataset contains only invalid JSon
    it("Should add a dataset with invalid JSon ", async () => {
        const id: string = "courses_invalidJSon";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when the JSON file does not contain a course
    it("Should add a dataset with multiple valid JSon ", async () => {
        const id: string = "courses_notJSon_course";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when the dataset is null
    it("Should add a NULL dataset", async () => {
        const id: string = null;
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when the dataset is undefined
    it("Should add an undefined object", async () => {
        const id: string = undefined;
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when it contains 0 sections
    it("Should add a dataset with multiple valid JSon ", async () => {
        const id: string = "courses_zero_section";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test for courses_multi_file
    it("Should add a dataset with courses_multi_file", async () => {
        const id: string = "courses_multi_file";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // test add same "courses" folder but with invalid name
    it("Should add an wrong courses", async () => {
        const id: string = "courses_wrong_courses";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // test json invalid
    it("Should add invalid json courses", async () => {
        const id: string = "courses_only_JSON_invalid";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when the dataset if is empty
    it("Should add an undefined object", async () => {
        const id: string = "";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when add the same dataset twice
    it("Should add an duplicate object", async () => {
        const id: string = "courses";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // -------------------- REMOVE DATASET ----------------------------
    // This is an example of a pending test. Add a callback function to make the test run.
    it("Should remove the courses dataset");

    // Test removing a courses data set
    // Test to remove a non-exisitng data set
    it("Should remove a non-existing dataset", async () => {
        const id: string = "does_not_exist";
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(NotFoundError);
        }
    });

    // Test to remove a null id
    it("Should remove a dataset whose id is null", async () => {
        const id: string = null;
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test to remove an undefined id undefined
    it("Should remove a non-existing dataset", async () => {
        const id: string = undefined;
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test to remove a undefined dataset empty string
    it("Should remove an exmpty string", async () => {
        const id: string = "";
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // test add a data set with zip and valid file
    it("Should add a dataset with zip and valid JSON format", async () => {
        const id: string = "courses_zip_with_valid";
        let response: string[];
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(["courses", id]);
        }
    });

    // test remove the above data set
    it("Should remove a courses_zip_with_valid dataset", async () => {
        const id: string = "courses_zip_with_valid";
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(id);
        }
    });

    it("Should remove the courses dataset", async () => {
        const id: string = "courses";
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal(id);
        }
    });

    // Test remove courses twice
    it("Should remove courses again", async () => {
        const id: string = "courses";
        let response: string;

        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(NotFoundError);
        }
    });

    // ---------------- error permutation test ---------------

    // Test when add Dataset parameter is null null
    it("add Dataset parameter is null null", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset(null, null, InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is courses undefined
    it("add Dataset parameter is null undefined", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset("courses", undefined, InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is courses empty
    it("addDataset parameter is null", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset("courses", "", InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is undefined null
    it("addDataset parameter is undefined null", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset(undefined, null, InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is empty null
    it("addDataset parameter is empty null", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset("", null, InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is courses null
    it("addDataset parameter is courses null", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset("courses", null, InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // ------------------------- ROOM ---------------------
    // Test when addDataset parameter is null null
    it("addDataset parameter is null null", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset(null, null, InsightDatasetKind.Rooms);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is courses undefined
    it("addDataset parameter is courses undefined", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset("courses", undefined, InsightDatasetKind.Rooms);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is courses ""
    it("addDataset parameter is courses", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset("courses", "", InsightDatasetKind.Rooms);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is undefined null
    it("addDataset parameter is undefined null", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset(undefined, null, InsightDatasetKind.Rooms);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is courses null
    it("addDataset parameter is courses null", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset("courses", null, InsightDatasetKind.Rooms);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is empty null
    it("addDataset parameter is empty null", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset("", null, InsightDatasetKind.Rooms);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is courses undefined
    it("add Dataset parameter is null undefined", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset("courses", datasets["courses"], null);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is courses empty
    it("addDataset parameter is null", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset("courses", datasets["courses"], undefined);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // ------------------------- Test for Dataset Kind ------------------------
    // Test when add Dataset parameter is null null
    it("add Dataset parameter is null null", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset(null, null, null);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is null undefined
    it("add Dataset parameter is null undefined", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset(null, undefined, null);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is null ""
    it("addDataset parameter is null", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset(null, "", null);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is undefined null
    it("addDataset parameter is undefined null", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset(undefined, null, null);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is undefined " "
    it("addDataset parameter is undefined empty", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset(undefined, "", null);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is undefined undefined
    it("addDataset parameter is undefined undefined", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset(undefined, undefined, null);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is empty null
    it("addDataset parameter is empty null", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset("", null, null);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is empty undefined
    it("addDataset parameter is empty undefined", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset("", undefined, null);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is empty empty
    it("addDataset parameter is empty empty", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset("", "", null);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // ------------------------- ROOM ---------------------
    // Test when addDataset parameter is null null
    it("addDataset parameter is null null", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset(null, null, undefined);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is null undefined
    it("addDataset parameter is null undefined", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset(null, undefined, undefined);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is null ""
    it("addDataset parameter is null", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset(null, "", undefined);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is undefined null
    it("addDataset parameter is undefined null", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset(undefined, null, undefined);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is undefined " "
    it("addDataset parameter is undefined empty", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset(undefined, "", undefined);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is undefined undefined
    it("addDataset parameter is undefined undefined", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset(undefined, undefined, undefined);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is empty null
    it("addDataset parameter is empty null", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset("", null, undefined);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is empty undefined
    it("addDataset parameter is empty undefined", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset("", undefined, undefined);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    // Test when addDataset parameter is empty empty
    it("addDataset parameter is empty empty", async () => {
        let response: string[];
        try {
            response = await insightFacade.addDataset("", "", undefined);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.be.instanceOf(InsightError);
        }
    });

    it("Should have empty dataset", async () => {
        let response;
        try {
            response = await insightFacade.listDatasets();
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal([]);
        }
    });

    it("addDataset room", async () => {
        let response: string[];
        let id = "rooms";
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal([id]);
        }
    });

    it("get lat", async () => {
        let response: string[];
        let id = "rooms";
        let x = new ParseZipBuilding();
        try {
            response = await x.getCoordinates(
                "6245 Agronomy Road V6T 1Z4");
            let stub = response;
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal({lat: 49.26125, lon: -123.24807});
        }
    });

    it("should list rooms", async () => {
        let response;
        let expected: InsightDataset = {id: "rooms", kind: InsightDatasetKind.Rooms, numRows: 364};
        try {
            response = await insightFacade.listDatasets();
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.deep.equal([expected]);
        }
    });
});

// This test suite dynamically generates tests from the JSON files in test/queries.
// You should not need to modify it; instead, add additional files to the queries directory.
describe("InsightFacade PerformQuery", () => {
    const datasetsToQuery: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        rooms: "./test/data/rooms.zip",
    };
    let insightFacade: InsightFacade;
    let testQueries: ITestQuery[] = [];

    // Create a new instance of InsightFacade, read in the test queries from test/queries and
    // add the datasets specified in datasetsToQuery.
    before(async function () {
        Log.test(`Before: ${this.test.parent.title}`);

        // Load the query JSON files under test/queries.
        // Fail if there is a problem reading ANY query.
        try {
            testQueries = await TestUtil.readTestQueries();
            expect(testQueries).to.have.length.greaterThan(0);
        } catch (err) {
            expect.fail("", "", `Failed to read one or more test queries. ${JSON.stringify(err)}`);
        }

        try {
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        } finally {
            expect(insightFacade).to.be.instanceOf(InsightFacade);
        }

        // Load the datasets specified in datasetsToQuery and add them to InsightFacade.
        // Fail if there is a problem reading ANY dataset.
        try {
            const loadDatasetPromises: Array<Promise<Buffer>> = [];
            for (const [id, path] of Object.entries(datasetsToQuery)) {
                loadDatasetPromises.push(TestUtil.readFileAsync(path));
            }
            const loadedDatasets = (await Promise.all(loadDatasetPromises)).map((buf, i) => {
                return { [Object.keys(datasetsToQuery)[i]]: buf.toString("base64") };
            });
            expect(loadedDatasets).to.have.length.greaterThan(0);

            const responsePromises: Array<Promise<string[]>> = [];
            const datasets: { [id: string]: string } = Object.assign({}, ...loadedDatasets);
            for (const [id, content] of Object.entries(datasets)) {
                if (id === "rooms") {
                    responsePromises.push(insightFacade.addDataset(id, content, InsightDatasetKind.Rooms));
                } else {
                    responsePromises.push(insightFacade.addDataset(id, content, InsightDatasetKind.Courses));
                }
            }

            // This try/catch is a hack to let your dynamic tests execute even if the addDataset method fails.
            // In D1, you should remove this try/catch to ensure your datasets load successfully before trying
            // to run you queries.
            try {
                const responses: string[][] = await Promise.all(responsePromises);
                responses.forEach((response) => expect(response).to.be.an("array"));
            } catch (err) {
                Log.warn(`Ignoring addDataset errors. For D1, you should allow errors to fail the Before All hook.`);
            }
        } catch (err) {
            expect.fail("", "", `Failed to read one or more datasets. ${JSON.stringify(err)}`);
        }
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // Dynamically create and run a test for each query in testQueries
    it("Should run test queries", () => {
        describe("Dynamic InsightFacade PerformQuery tests", () => {
            for (const test of testQueries) {
                it(`[${test.filename}] ${test.title}`, async () => {
                    let response: any[];

                    try {
                        response = await insightFacade.performQuery(test.query);
                    } catch (err) {
                        response = err;
                    } finally {
                        if (test.isQueryValid) {
                            expect(response).to.deep.equal(test.result);
                        } else {
                            expect(response).to.be.instanceOf(InsightError);
                        }
                    }
                });
            }
        });
    });
});
