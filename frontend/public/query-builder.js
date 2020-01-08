/**
 * Builds a query object using the current document object model (DOM).
 * Must use the browser's global document object {@link https://developer.mozilla.org/en-US/docs/Web/API/Document}
 * to read DOM information.
 *
 * @returns query object adhering to the query EBNF
 */
CampusExplorer.buildQuery = function() {
    return createEBNFQuery();
};

function createEBNFQuery() {
    let tempQuery = {};
    let OPTIONS = {};

    // Initialization
    let findRightStuff = document.getElementsByClassName("nav-item tab active")[0];
    let type = findRightStuff.getAttribute("data-type");
    let body;

    // mark form[0] is plain text
    if (type === "courses") {
        body = document.getElementsByTagName("form")[1];
    } else if (type === "rooms") {
        body = document.getElementsByTagName("form")[2];
    }
    // at this point, we have the page we need to edit

    // Condition part, actually WHERE part
    // find conditions: All/ Any/ None
    let input;
    let condition;
    let plainJson = [];
    if (type === "courses") {
        input = "courses-conditiontype-all";
    } else {
        input = "rooms-conditiontype-all";
    }

    if (document.getElementById(input).checked) {
        condition = "AND";
    } else {
        if (type === "courses") {
            input = "courses-conditiontype-any";
        } else {
            input = "rooms-conditiontype-any";
        }

        if (document.getElementById(input).checked) {
            condition = "OR";
        } else {
            condition = "NOT";
        }
    }
    // at this point, we update the logic part

    // added part
    let addedConditions = body.getElementsByClassName("control-group condition");
    for (let i = 0; i < addedConditions.length; i++) {
        let oneAdded = addedConditions[i];

        // get chosen control field type, actually the key
        let controlFields = oneAdded.getElementsByClassName("control fields")[0];
        let controlField = controlFields.children[0];
        let controlFieldChosen;
        let controlFieldTrace = controlField.getElementsByTagName("option");
        for (let j = 0; j < controlFieldTrace.length; j++) {
            let oneField = controlFieldTrace[j];
            if (oneField.selected) {
                controlFieldChosen = oneField.value;
            }
        }

        let controlFieldKey;
        if (type === "courses") {
            controlFieldKey = "courses_" + controlFieldChosen;
        } else {
            controlFieldKey = "rooms_" + controlFieldChosen;
        }

        // get chosen control operator
        let controlOperators = oneAdded.getElementsByClassName("control operators")[0];
        let controlOperator = controlOperators.children[0];
        let controlOperatorChosen;
        let controlOperatorTrace = controlOperator.getElementsByTagName("option");
        for (let j = 0; j < controlOperatorTrace.length; j++) {
            let oneOperator = controlOperatorTrace[j];
            if (oneOperator.selected) {
                controlOperatorChosen = oneOperator.value;
            }
        }

        // make sure control term is valid
        let controlTermDiv = oneAdded.getElementsByClassName("control term")[0];
        let controlTerm = controlTermDiv.getElementsByTagName("input")[0].value;

        // make sure it's number for EQ, GT, LT
        if (controlTerm) {
            if (!isNaN(controlTerm)) {
                if (controlOperatorChosen === "EQ" ||
                    controlOperatorChosen === "GT" ||
                    controlOperatorChosen === "LT") {
                    controlTerm = Number(controlTerm);
                }
            }
        }

        // check if NOT
        let controlNot = oneAdded.getElementsByTagName("input")[0];
        if (controlNot.checked) {
            let object;
            let tempObject;
            let controlFieldBody = {[controlFieldKey]: controlTerm};
            tempObject = {[controlOperatorChosen]: controlFieldBody};
            object = {NOT: tempObject};
            // console.log(object);
            plainJson.push(object);
        } else {
            let object;
            let controlFieldBody = {[controlFieldKey]: controlTerm};
            object = {[controlOperatorChosen]: controlFieldBody};
            // console.log(object);
            plainJson.push(object);
        }
    }
    // at this point, successfully got the added part

    // update WHERE
    if (plainJson.length === 0) {
        tempQuery.WHERE = {};
    } else if (plainJson.length === 1) {
        if (condition === "NOT") {
            tempQuery.WHERE = {NOT: plainJson[0]};
        } else {
            tempQuery.WHERE = plainJson[0];
        }
    } else {
        if (condition === "NOT") {
            let body = {OR: plainJson};
            tempQuery.WHERE = {NOT: body};
        } else {
            tempQuery.WHERE = {[condition]: plainJson};
        }
    }
    // at this point, WHERE updated

    // connection between Columns, Order and Transformation
    let checkerForTransformation;

    // Columns part
    let columnsDiv = body.getElementsByClassName("form-group columns")[0];
    let columnsGroups = columnsDiv.getElementsByClassName("control-group")[0];
    let columnsFields = columnsGroups.getElementsByClassName("control field");
    let addedColumns = [];
    for (let i = 0; i < columnsFields.length; i++) {
        let oneField = columnsFields[i];
        let value = oneField.getElementsByTagName("input")[0];

        // check if it's added from transformation part
        if (oneField.className === "control transformation") {
            checkerForTransformation = 1;
        } else {
            checkerForTransformation = 0;
        }

        if (value.checked) {
            if (checkerForTransformation === 1) {
                addedColumns.push(value.value);
            } else {
                let finalValue;
                finalValue = type + "_" + value.value;
                addedColumns.push(finalValue);
            }
        }
    }

    // update COLUMNS
    OPTIONS.COLUMNS = addedColumns;

    // Order part
    let orderDiv = body.getElementsByClassName("control order fields")[0];
    let orderSelected = orderDiv.getElementsByTagName("select")[0];
    let orderOptions = orderSelected.getElementsByTagName("option");
    let addedOrder = [];
    for (let i = 0; i < orderOptions.length; i++) {
        let oneOrder = orderOptions[i];

        // check if it's added from transformation part
        if (oneOrder.className === "transformation") {
            checkerForTransformation = 1;
        } else {
            checkerForTransformation = 0;
        }

        if (oneOrder.selected) {
            if (checkerForTransformation === 1) {
                addedOrder.push(oneOrder.value);
            } else {
                let finalValue;
                finalValue = type + "_" + oneOrder.value;
                addedOrder.push(finalValue);
            }
        }
    }

    // check descending element
    let dEle;
    if (type === "courses") {
        dEle = document.getElementById("courses-order");
    } else {
        dEle = document.getElementById("rooms-order");
    }

    // update ORDER
    if (addedOrder.length !== 0) {
        if (dEle.checked) {
            OPTIONS.ORDER = {dir: "DOWN", keys: addedOrder};
        } else {
            OPTIONS.ORDER = {dir: "UP", keys: addedOrder};
        }
    } else {
        if (dEle.checked) {
            OPTIONS.ORDER = {dir: "DOWN", keys: []};
        }
    }

    // update query's options
    tempQuery.OPTIONS = OPTIONS;
    // at this point, OPTIONS updated

    // Group part
    let groupDiv = body.getElementsByClassName("form-group groups")[0];
    let groups = groupDiv.getElementsByClassName("control-group")[0];
    let groupOptions = groups.getElementsByClassName("control field");
    let addedGroups = [];
    for (let i  = 0; i < groupOptions.length; i++) {
        let oneGroup = groupOptions[i];
        let value = oneGroup.getElementsByTagName("input")[0];

        if (value.checked) {
            let finalValue;
            finalValue = type + "_" + value.value;
            addedGroups.push(finalValue);
        }
    }

    // Transformation part
    let checkerForApply;
    let applyContainer = body.getElementsByClassName("transformations-container")[0];
    let applyOptions = applyContainer.getElementsByClassName("control-group transformation");
    console.log(applyContainer.getElementsByClassName("control-group transformation"));
    if (applyOptions.length === 0) {
        checkerForApply = 0;
    } else {
        checkerForApply = 1;
    }

    let applyBody = [];
    if (checkerForApply === 1) {
        for (let i = 0; i < applyOptions.length; i++) {
            let oneApply = applyOptions[i];

            let controlFields = oneApply.getElementsByClassName("control fields")[0];
            let controlField = controlFields.children[0];
            let controlFieldTrace = controlField.getElementsByTagName("option");
            let controlFieldValue;
            for (let j = 0; j < controlFieldTrace.length; j++) {
                let oneField = controlFieldTrace[j];
                if (oneField.selected) {
                    controlFieldValue = oneField.value;
                }
            }
            let controlFieldKey;
            if (type === "courses") {
                controlFieldKey = "courses_" + controlFieldValue;
            } else {
                controlFieldKey = "rooms_" + controlFieldValue;
            }

            let applyTermDiv = oneApply.getElementsByClassName("control term")[0];
            let applyTerm = applyTermDiv.children[0].value;
            let controlOperatorDiv = oneApply.getElementsByClassName("control operators")[0];
            let controlOperator = controlOperatorDiv.children[0];
            let controlOperatorChosen;
            let controlOperatorTrace = controlOperator.getElementsByTagName("option");
            for (let j = 0; j < controlOperatorTrace.length; j++) {
                let oneOperator = controlOperatorTrace[j];
                if (oneOperator.selected) {
                    controlOperatorChosen = oneOperator.value;
                }
            }

            // update APPLY part
            let finalApply = {};
            let finalApplyRule = {};
            finalApplyRule = {[controlOperatorChosen]: controlFieldKey};
            finalApply = {[applyTerm]: finalApplyRule};
            applyBody.push(finalApply);
        }
    }

    // update Transformation
    if (addedGroups.length !== 0) {
        if (applyBody.length !== 0) {
            tempQuery.TRANSFORMATIONS = {GROUP: addedGroups, APPLY: applyBody};
        } else {
            tempQuery.TRANSFORMATIONS = {GROUP: addedGroups, APPLY: []};
        }
    } else {
        if (applyBody.length !== 0) {
            tempQuery.TRANSFORMATIONS = {GROUP: [], APPLY: applyBody};
        }
    }
    // at this point, TRANSFORMATIONS updated

    return tempQuery;
}
