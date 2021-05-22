
const state = {
    viewUnit: BASES.KG.NAME,
    gymPlatesUnit: BASES.KG.NAME,
    allowPlatesCalcDelta: true,
    targetWeight: null,
    targetWeightPlatesLoadsOptions: [],
    selectedPlateLoadOptionId: null,
    selectedPlateLoadOption: null,
    userCalc: false,
};

const getViewUnit = () => getBaseByName(state.viewUnit);
const getGymUnit = () => getBaseByName(state.gymPlatesUnit);

function sortByDeltaAsc(weightOptions) {
    return weightOptions.sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta));
}

function sortByWeightDESC(arr) {
    return arr.sort((a, b) => b.weight - a.weight);
}

function sortByWeightASC(arr) {
    return arr.sort((a, b) => a.weight - b.weight);
}

function convertWeightUnit(id) {
    const input = document.getElementById(id);
    if (!input) return;
    const inputResult = document.getElementById(id + "-result");
    if (!inputResult) return;
    if (id == 'pound-to-kg') {
        inputResult.value = String(toFixedNumber(poundToKg(Number(input.value)), 3));
    } else {
        inputResult.value = String(toFixedNumber(kgToPound(Number(input.value)), 3));
    }
}

function targetWeightViewUnitToGymUnit(weight, targetBase, gymBase) {
    if (targetBase.NAME == gymBase.NAME) return weight;
    if (targetBase.NAME == BASES.KG.NAME && gymBase.NAME == BASES.POUND.NAME) {
        return kgToPound(weight);
    }
    return poundToKg(weight);
}

function getPlatesLoadCombinationsOptions(gymPlatesOptions, targetWeight, maxDelta) {
    const plates = [];
    let weight = 0;

    for (const plate of gymPlatesOptions) {
        if (!plate.on) continue;
        let pairWeight = plate.weight * 2;
        for (let platesUsed = 0; platesUsed + 2 <= plate.max; platesUsed += 2) {
            if (weight == targetWeight || weight == targetWeight + maxDelta) break;
            if (pairWeight + weight <= targetWeight + maxDelta) {
                plates.push(plate.weight);
                plates.push(plate.weight);
                weight += pairWeight;
            }
        }
    }

    return {
        plates: plates,
        weight: weight,
        delta: weight - targetWeight,
        key: JSON.stringify(plates)
    }
}

function aggregatePlatesLoadCombo(platesLoadCombo) {
    const platesAggByWeight = new Map();

    for (let weight of platesLoadCombo) {
        if (platesAggByWeight.has(weight)) {
            platesAggByWeight.set(weight, platesAggByWeight.get(weight) + 1);
        } else {
            platesAggByWeight.set(weight, 1);
        }
    }

    const plates = [];

    platesAggByWeight.forEach((quantity, weight) => {
        plates.push({ weight: weight, quantity: quantity });
    });

    return plates;
}

function getMaxDelta(targetWeight) {
    // we want a higher delta as long as the weight is smaller and vice versa
    // because we won't find all the small suggestions with light weights otherwise
    const smallestPlateWeight = findSmallestWeight(getGymUnit().PLATES_OPTIONS);
    const deltaRatio = MAX_DELTA_RATIO * smallestPlateWeight / 2 / (targetWeight * 0.01);
    return targetWeight * deltaRatio;
}

function newPlatesLoadOption(barbell, plateCombo, targetBase, gymBase) {
    let totalWeight = barbell.weight + plateCombo.weight;
    let barbellWeight = barbell.weight;
    let delta = plateCombo.delta;
    let deltaInViewUnit = delta;

    if (targetBase.NAME == BASES.KG.NAME && gymBase.NAME == BASES.POUND.NAME) {
        totalWeight = poundToKg(totalWeight);
        barbellWeight = poundToKg(barbellWeight);
        deltaInViewUnit = poundToKg(delta);
    } else if (targetBase.NAME == BASES.POUND.NAME && gymBase.NAME == BASES.KG.NAME) {
        totalWeight = kgToPound(totalWeight);
        barbellWeight = kgToPound(barbellWeight);
        deltaInViewUnit = kgToPound(delta);
    }

    return {
        weight: toFixedNumber(totalWeight, 3),
        barbellWeight: toFixedNumber(barbellWeight, 3),
        plates: aggregatePlatesLoadCombo(plateCombo.plates),
        deltaInViewUnit: toFixedNumber(deltaInViewUnit, 3),
        delta: toFixedNumber(delta, 3)
    }
}

function copySupportedPlates(base) {
    return deepObjectPremitivesCopy(base.PLATES_OPTIONS).filter(option => option.on);
}

function findSmallestWeight(options) {
    return Math.min(...options.map(option => option.weight));
}

function filterTooHighDeltaSuggestions(options, maxDelta) {
    return options.filter(option => Math.abs(option.delta) <= maxDelta);
}

function filterOptimalPlatesLoadOptions(weightOptions, maxDelta) {
    if (!state.allowPlatesCalcDelta && state.userCalc) {
        maxDelta = 0;
    }
    return sortByDeltaAsc(
        filterTooHighDeltaSuggestions(weightOptions, maxDelta)
    )
        .slice(0, 26);
}

function getSelectedBarbell(gymUnitBase) {
    for (const barbell of gymUnitBase.BARBELLS_OPTIONS) {
        if (barbell.on) return barbell;
    }
}

function calcGymPlatesLoadOptionsByTargetWeight(targetWeight) {
    const results = { data: null, error: null };
    const viewUnit = getViewUnit();
    const gymUnit = getGymUnit();
    targetWeight = targetWeightViewUnitToGymUnit(targetWeight, viewUnit, gymUnit);
    const maxDelta = getMaxDelta(targetWeight);

    const barbell = getSelectedBarbell(gymUnit);
    if (!barbell) {
        results.error = Error("No Barbell Selected.");
        return results;
    }
    if (targetWeight + Math.abs(maxDelta) < barbell.weight) {
        results.error = Error("Please select lighter barbell.");
        return results;
    }

    const platesLoadOptions = [];

    const gymPlatesOptions = sortByWeightDESC(copySupportedPlates(gymUnit));

    const smallestPlateWeight = findSmallestWeight(gymPlatesOptions);

    const platesCombos = new Set();
    for (let delta = 0; delta <= maxDelta; delta += smallestPlateWeight) {
        for (const plate of gymPlatesOptions) {
            plate.on = true;
        }
        for (const plate of gymPlatesOptions) {
            plateMax = plate.max;
            for (; plate.max >= 2; plate.max -= 2) {
                for (let deltaSign = -1; deltaSign <= 1; deltaSign += 2) {
                    const platesCombo = getPlatesLoadCombinationsOptions(gymPlatesOptions, targetWeight - barbell.weight, delta * deltaSign);
                    if (platesCombos.has(platesCombo.key)) continue;
                    platesCombos.add(platesCombo.key);
                    platesLoadOptions.push(newPlatesLoadOption(barbell, platesCombo, viewUnit, gymUnit));
                }
            }
            plate.max = plateMax;
            plate.on = false;
        }
    }

    results.data = filterOptimalPlatesLoadOptions(platesLoadOptions, maxDelta);

    return results;
}

function updateTargetWeightInputPlaceholder() {
    const weightInput = document.getElementById("workout-wizard-panel-plates-calc-target-weight");
    if (!weightInput) return;
    weightInput.placeholder = `Target Weight (${getViewUnit().NAME})`;
}

function getUserTargetWeight() {
    const weightInput = document.getElementById("workout-wizard-panel-plates-calc-target-weight");
    const inputValue = weightInput.value;
    if (inputValue && inputValue.length > 0) {
        return Number(inputValue);
    }
    return null;
}

function calcUserTargetWeightPlatesLoadOptions() {
    const targetWeight = getUserTargetWeight();
    if (!targetWeight) return notify("No target weight.");

    state.userCalc = true;
    const { data, error } = calcGymPlatesLoadOptionsByTargetWeight(targetWeight);
    state.userCalc = false;
    if (error) return notify(error.message);

    state.targetWeight = targetWeight;

    state.targetWeightPlatesLoadsOptions = data;

    if (state.targetWeightPlatesLoadsOptions.length == 0) {
        notify("No suggestions");
    }

    drawTargetWeightPlatesLoadOptions();
}

function createPlatesLoadOptionCardHTML(option, idx, select = false, title) {
    select = false;// todo-remove when select is valuable
    let selectButton = "";
    if (select) {
        selectButton = `<button class="pull-right btn btn-secondary shadow-sm btn-sm" onclick="selectPlatesLoadOption(${idx})">Select</button>`;
    }
    let cardTitle = `Option ${numberToUpperCaseLetter(idx)}: ${selectButton}`;
    if (title) {
        cardTitle = title;
    }
    return `<div class="card mx-auto my-2 mb-3 shadow-sm" style="width: 18rem;">
        <div class="card-body pb-1">
            <h5 class="card-title">${cardTitle}</h5>
            <h6 class="card-title mb-0">
                Total Weight: ${option.weight} ${getViewUnit().NAME}
            </h6>
            ${createDeltaHTML()}
        </div>
        <div class="card-footer bg-dark-c">
            Barbell: ${option.barbellWeight} ${getViewUnit().NAME}
        </div>
        ${createPlatesLoadHTML()}
    </div>`;

    function createDeltaHTML() {
        let deltaColor = "";
        if (option.deltaInViewUnit < 0) {
            deltaColor = "text-danger";
        } else if (option.deltaInViewUnit > 0) {
            deltaColor = "text-primary";
        }
        return `<small class="${deltaColor}">Delta: ${option.deltaInViewUnit} ${getViewUnit().NAME}</small>`;
    }

    function createPlatesLoadHTML() {
        const createPlateListItem = (plate) => {
            return `<div class="card-footer bg-light-blue">
                        Weight: ${plate.weight} x ${plate.quantity / 2} <small class="pull-right">(${plate.quantity})</small>
                    </div>`;
        };

        const plates = option.plates;
    
        let platesData =
            `<div class="card-footer bg-dark-blue">
            Plates On Each Side (${getGymUnit().NAME}):
        </div>`;
        const sortedPlates = sortByWeightDESC(plates);
        for (const plate of sortedPlates) {
            platesData += createPlateListItem(plate);
        }
    
        if (sortedPlates.length < 1) {
            platesData = `<div class="card-footer bg-light-blue">No Plates Needed</div>`;
        }
    
        return platesData;
    }
}

function drawTargetWeightPlatesLoadOptions() {
    const options = state.targetWeightPlatesLoadsOptions;
    const resultsDiv = document.getElementById("workout-wizard-panel-plates-calc-target-weight-results");
    if (!resultsDiv) return notify("internal error, please try again later");

    let html = "";
    for (let i = 0; i < options.length; i++) {
        html += createPlatesLoadOptionCardHTML(options[i], i, true);
    }
    resultsDiv.innerHTML = html;
}

function selectPlatesLoadOption(idx) {
    if (!idx && idx != 0) {
        return notify("internal error, please try again later");
    }
    idx = Number(idx);
    const selectedPlateLoadOption = deepObjectPremitivesCopy(state.targetWeightPlatesLoadsOptions[idx]);
    if (!selectedPlateLoadOption) {
        return notify("internal error, please try again later");
    }
    state.selectedPlateLoadOptionId = Number(idx);
    state.selectedPlateLoadOption = selectedPlateLoadOption;

    const continueContainer = document.getElementById("ww-plate-load-selected-option-panel-container");
    if (!continueContainer) return notify("internal error, please try again later");

    const optionHeader = document.getElementById("ww-plate-load-selected-option-panel-header");
    if (!optionHeader) return notify("internal error, please try again later");
    optionHeader.innerHTML = "Option " + numberToUpperCaseLetter(idx);

    const selectedOptionBase = document.getElementById("ww-plate-load-selected-option-based-option-container");
    if (!selectedOptionBase) return notify("internal error, please try again later");
    selectedOptionBase.innerHTML = createPlatesLoadOptionCardHTML(selectedPlateLoadOption, idx, false, "Target Set Base Plate Load");

    // draw and etc

    openSelectedPlatesLoadOption();
}

function openSelectedPlatesLoadOption() {
    $("#ww-plate-load-selected-option-panel-container").show();
    $("#ww-plates-load-options-calc-container").hide();
}

function closeSelectedPlatesLoadOption() {
    $("#ww-plates-load-options-calc-container").show();
    $("#ww-plate-load-selected-option-panel-container").hide();
}


/** The Idea behid this algorithm is to look at the plates of the prev set and next set 
 * each plate has power which is related to it's weight. the heavier it gets it equal more scores.
 * each time we find a difference between a suggestion to the prev and next (quantity of plate)
 * it downgrade the scores which is 100 at start.
 * because the user actually has to lift and change plates, it's not very convinient.
 * so that's why heavier plates equals more.
 * the suggestion with the highest scores (least weight and heavy plates changes is the winner).
 * targetWeight is in view unit
 */
function findLeastExhaustingTargetPlatesLoadOptionByGivenOptionLimits(targetWeight, prev, next, ascendingSets) {
    const result = { data: null, error: null };
    const { data: options, error } = calcGymPlatesLoadOptionsByTargetWeight(targetWeight);
    if (error) {
        result.error = error;
        return result;
    }

    if (options.length < 1) return result;

    const optionsScores = [];
    const prevPlates = deepObjectPremitivesCopy(Boolean(prev) ? prev.plates : []);
    const nextPlates = deepObjectPremitivesCopy(Boolean(next) ? next.plates : []);
    const platesByWeight = new Map();
    const limitsPlatesASC = [];
    for (const plate of prevPlates.concat(nextPlates)) {
        if (platesByWeight.has(plate.weight)) {
            platesByWeight.set(plate.weight, platesByWeight.get(plate.weight) + plate.quantity / 2);
        } else {
            platesByWeight.set(plate.weight, plate.quantity / 2);
        }
    }
    platesByWeight.forEach((quantity, weight) => {
        limitsPlatesASC.push({ weight: weight, quantity: quantity });
    });
    sortByWeightASC(limitsPlatesASC);

    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        const optionPlatesByWeight = new Map();
        for (const plate of option.plates) {
            optionPlatesByWeight.set(plate.weight, plate.quantity / 2);
        }
        const sortedOptionPlatesASC = sortByWeightASC(deepObjectPremitivesCopy(option.plates));
        const sortedOptionPlates = sortedOptionPlatesASC;
        if (ascendingSets) {// we would want as much of heavier plates when it's ascending sets routine and lighter when desc set
            sortedOptionPlates.reverse();// the reason is if that's ascending we would want as much of heavier plates instead of lighter ones
        }

        let score = 1000;

        const reduceScoreOnPlatesDiff = (sortedPlates, quantityByWegight, dominantRatio) => {
            for (let platePower = 0; platePower < sortedPlates.length; platePower++) {
                const plate = sortedPlates[platePower];
                let quantity = 0;
                if (quantityByWegight.has(plate.weight)) {
                    quantity = quantityByWegight.get(plate.weight);
                }
                score -= Math.abs(plate.quantity - quantity) * quantityByWegight.size * (platePower + 1) * dominantRatio;
            }
        }
        // 1 ratio because the plates are matter are important to make the right choice.
        reduceScoreOnPlatesDiff(limitsPlatesASC, optionPlatesByWeight, 1);
        // 0.5 ratio because the suggesion is lease important but yet we do not want to change much plates and do take care of it.
        reduceScoreOnPlatesDiff(sortedOptionPlates, platesByWeight, 0.5);

        optionsScores.push({ idx: i, score: score });
    }

    if (optionsScores.length < 1) return result;

    let highestScore = optionsScores[0];
    result.data = options[0];
    for (let i = 1; i < optionsScores.length; i++) {
        if (optionsScores[i].score > highestScore) {
            result.data = options[i];
        }
    }
    return result;
}

function testfindLeastExhaustingTargetPlatesLoadOptionByGivenOptionLimits() {
    const targetWeight = 100;
    const { data: options, error } = calcGymPlatesLoadOptionsByTargetWeight(targetWeight);
    if (error) return notify(error.message);

    const { data: suggestionA } = findLeastExhaustingTargetPlatesLoadOptionByGivenOptionLimits(targetWeight * 0.3, null, options[0], true);
    console.log(JSON.stringify(suggestionA.plates));
    const { data: suggestionAB } = findLeastExhaustingTargetPlatesLoadOptionByGivenOptionLimits(targetWeight * 0.5, suggestionA, options[0], true);
    console.log(JSON.stringify(suggestionAB.plates));
    const { data: suggestionB } = findLeastExhaustingTargetPlatesLoadOptionByGivenOptionLimits(targetWeight * 0.75, suggestionAB, options[0], true);
    console.log(JSON.stringify(suggestionB.plates));
    const { data: suggestionC } = findLeastExhaustingTargetPlatesLoadOptionByGivenOptionLimits(targetWeight * 0.9, suggestionB, options[0], true);
    console.log(JSON.stringify(suggestionC.plates));
    console.log(JSON.stringify(options[0].plates));
    // const { data: suggestionD } = findLeastExhaustingTargetPlatesLoadOptionByGivenOptionLimits(targetWeight * 0.5, suggestionC, options[0], false);
    // console.log(JSON.stringify(suggestionD.plates));
}