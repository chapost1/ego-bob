const KG_TO_POUND = 2.204622621847;

function kgToPound(kg) {
    return kg * KG_TO_POUND;
}

function poundToKg(pound) {
    return pound / KG_TO_POUND;
}

const KG_BARBELLS_OPTIONS = [
    { weight: 10, on: true },
    { weight: 15, on: true },
    { weight: 20, on: true },
];

const POUND_PLATES_OPTIONS = [
    { weight: 5, on: true, max: 4 },
    { weight: 10, on: true, max: 4 },
    { weight: 20, on: true, max: 6 },
    { weight: 25, on: true, max: 6 },
    { weight: 35, on: true, max: 6 },
    { weight: 45, on: true, max: 6 }
];

const POUND_BARBELLS_OPTIONS = KG_BARBELLS_OPTIONS.map(function (option) {
    return { weight: kgToPound(option.weight), on: true }
}
);

const KG_PLATES_OPTIONS = [
    { weight: 1.25, on: true, max: 4 },
    { weight: 2.5, on: true, max: 4 },
    { weight: 5, on: true, max: 6 },
    { weight: 10, on: true, max: 6 },
    { weight: 15, on: true, max: 6 },
    { weight: 20, on: true, max: 6 },
];

const BASES = {
    KG: {
        NAME: "KG",
        PLATES_OPTIONS: KG_PLATES_OPTIONS,
        BARBELLS_OPTIONS: KG_BARBELLS_OPTIONS
    },
    POUND: {
        NAME: "POUND",
        PLATES_OPTIONS: POUND_PLATES_OPTIONS,
        BARBELLS_OPTIONS: POUND_BARBELLS_OPTIONS
    }
}

const state = {
    viewUnit: BASES.KG.NAME,
    gymPlatesUnit: BASES.KG.NAME
};

const BASE_BY_NAME = {
    [BASES.KG.NAME]: BASES.KG,
    [BASES.POUND.NAME]: BASES.POUND
}

function getBaseByName(name) {
    return BASE_BY_NAME[name];
}

const getViewUnit = () => getBaseByName(state.viewUnit);
const getGymUnit = () => getBaseByName(state.gymPlatesUnit);

function targetWeightViewUnitToGymUnit(weight, targetBase, gymBase) {
    if (targetBase.NAME == gymBase.NAME) return weight;
    if (targetBase.NAME == BASES.KG.NAME && gymBase.NAME == BASES.POUND.NAME) {
        return kgToPound(weight);
    }
    return poundToKg(weight);
}

function sortWeightOptionsDesc(options) {
    return options.sort(function (a, b) {
        return b.weight - a.weight;
    });
}

function getPlatesCombinationsOptions(gymPlatesOptions, targetWeight, maxDelta) {
    const plates = [];
    let weight = 0;

    for (const plate of gymPlatesOptions) {
        if (!plate.on) continue;
        let platesUsed = 0;
        let pairWeight = plate.weight * 2;
        for (let i = 0; i < plate.max; i++) {
            if (weight == targetWeight || weight == targetWeight + maxDelta) break;
            if (pairWeight + weight <= targetWeight + maxDelta && platesUsed <= plate.max) {
                weight += pairWeight;
                platesUsed++;
                plates.push(plate.weight);
                plates.push(plate.weight);
            }
        }
    }

    return {
        plates: plates,
        weight: weight,
        delta: weight - targetWeight
    }
}

function aggregatePlatesCombosIntoArray(plates) {
    const platesByType = new Map();

    const platesArr = [];

    for (let weight of plates) {
        if (platesByType.has(weight)) {
            platesByType.set(weight, platesByType.get(weight) + 1);
        } else {
            platesByType.set(weight, 1);
        }
    }

    platesByType.forEach((quantity, weight) => {
        platesArr.push({ weight: weight, quantity: quantity });
    });

    return platesArr;
}

function getMaxDelta(targetWeight) {
    return targetWeight * 0.075;
}

function toFixedNumber(num, fixed) {
    if (num === null || num === undefined || (typeof num == "string" && num.length == 0) || !num) return 0;
    const re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return Number(num.toString().match(re)[0]);
}

function createWeightOption(barbell, plateCombo, targetBase, gymBase) {
    let totalWeight = barbell.weight + plateCombo.weight;
    let barbellWeight = barbell.weight;
    let delta = plateCombo.delta;

    if (targetBase.NAME == BASES.KG.NAME && gymBase.NAME == BASES.POUND.NAME) {
        totalWeight = poundToKg(totalWeight);
        barbellWeight = poundToKg(barbellWeight);
        delta = poundToKg(delta);
    }

    return {
        weight: toFixedNumber(totalWeight, 3),
        barbellWeight: toFixedNumber(barbellWeight, 3),
        plates: aggregatePlatesCombosIntoArray(plateCombo.plates),
        deltaInviewUnit: toFixedNumber(delta, 3)
    }
}

function deepArrayPremitivesCopy(arr) {
    return JSON.parse(JSON.stringify(arr));
}

function copyAllowedPlates(base) {
    return deepArrayPremitivesCopy(base.PLATES_OPTIONS).filter(option => option.on);
}

function findSmallestWeight(options) {
    return Math.min(...options.map(option => option.weight));
}

function filterTooHighDeltaSuggestions(options, maxDelta) {
    return options.filter(option => Math.abs(option.deltaInviewUnit) < maxDelta);
}

function getBestSuggetions(weightOptions, maxDelta) {
    return sortWeightOptionsByDeltaAsc(
        filterTooHighDeltaSuggestions(weightOptions, maxDelta)
    )
        .slice(0, 26);
}

function getSelectedBarbell(gymUnitBase) {
    for (const barbell of gymUnitBase.BARBELLS_OPTIONS) {
        if (barbell.on) return barbell;
    }
}

function calcGymPlatesSuggestionsByTargetWeight(targetWeight) {
    const results = {suggestions: null, error: null};
    const viewUnit = getViewUnit();
    const gymUnit = getGymUnit();
    targetWeight = targetWeightViewUnitToGymUnit(targetWeight, viewUnit, gymUnit);

    const barbell = getSelectedBarbell(gymUnit);
    if (!barbell) {
        results.error = Error("No Barbell Selected.");
        return results;
    }
    if (targetWeight < barbell.weight) {
        results.error = Error("Please select lighter barbell.");
        return results;
    }

    const maxDelta = getMaxDelta(targetWeight);

    const weightOptions = [];

    const gymPlatesOptions = sortWeightOptionsDesc(copyAllowedPlates(gymUnit));

    const smallestPlateWeight = findSmallestWeight(gymPlatesOptions);

    const platesCombos = new Set();
    for (const plate of gymPlatesOptions) {
        for (let delta = 0; delta <= maxDelta; delta += smallestPlateWeight) {
            const plateCombo = getPlatesCombinationsOptions(gymPlatesOptions, targetWeight - barbell.weight, delta);
            const key = JSON.stringify(plateCombo.plates);
            if (platesCombos.has(key)) continue;
            platesCombos.add(key);
            weightOptions.push(createWeightOption(barbell, plateCombo, viewUnit, gymUnit));
        }
        plate.on = false;
    }

    results.suggestions = getBestSuggetions(weightOptions, maxDelta);

    return results;
}

function sortWeightOptionsByDeltaAsc(weightOptions) {
    return weightOptions.sort(function (a, b) {
        return Math.abs(a.deltaInviewUnit) - Math.abs(b.deltaInviewUnit);
    });
}

function updateTargetWeightInputPlaceholder() {
    const weightInput = document.getElementById("target-weight");
    if (!weightInput) return;
    weightInput.placeholder = `Target Weight (${getViewUnit().NAME})`;
}

function getTargetWeight() {
    const weightInput = document.getElementById("target-weight");
    const inputValue = weightInput.value;
    if (inputValue && inputValue.length > 0) {
        return Number(inputValue);
    }
    return null;
}

function calc() {
    const targetWeight = getTargetWeight();
    if (!targetWeight) return notify("No target weight.");

    const {suggestions, error} = calcGymPlatesSuggestionsByTargetWeight(targetWeight);
    if (error) return notify(error.message);

    drawPlatesSuggestionResults(suggestions);
}

function convert(id) {
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

function notify(message) {
    const toastEl = $("#toast-id");
    const toastMessageBody = $("#toast-message");
    if (!toastEl || !toastMessageBody) return;
    toastMessageBody.html(message);
    toastEl.toast('show');
}

$(document).ready(function () {
    (function assignBarbellSelect() {
        function barbellSelect(event) {
            for (let i = 0; i < BASES.KG.BARBELLS_OPTIONS.length; i++) {
                BASES.KG.BARBELLS_OPTIONS[i].on = false;
                BASES.POUND.BARBELLS_OPTIONS[i].on = false;
                if (Number(event.target.value) == BASES.KG.BARBELLS_OPTIONS[i].weight) {
                    BASES.KG.BARBELLS_OPTIONS[i].on = true;
                    BASES.POUND.BARBELLS_OPTIONS[i].on = true;
                }
            }
        }
        let lastBarbellName;
        for (const barbell of BASES.KG.BARBELLS_OPTIONS) {
            lastBarbellName = '#barbell-weight-' + barbell.weight;
            $(lastBarbellName).on('change', barbellSelect);
        }
        $(lastBarbellName).click();
    })();

    function assignUnitSelect(unitProperty, calcType, next) {
        function viewUnitSelect(event) {
            state[unitProperty] = event.target.value.toUpperCase();
        }
        let firstUnitName, lastUnitName;
        for (const unit in BASES) {
            lastUnitName = '#' + calcType + '-calc-base-' + BASES[unit].NAME.toLowerCase();
            $(lastUnitName).on('change', viewUnitSelect);
            if (!firstUnitName) {
                firstUnitName = lastUnitName;
            }
        }
        $(firstUnitName).click();

        if (next) next();
    }

    (function assignViewUnitSelect() {
        assignUnitSelect("viewUnit", "target", function () {
            updateTargetWeightInputPlaceholder();
        });
    })();

    (function assignGymUnitSelect() {
        assignUnitSelect("gymPlatesUnit", "gym");
    })();
});

function createSuggestionPlatesCardHTML(plates) {
    const createPlateListItem = (plate) => {
        return `<div class="card-footer bg-light-blue">
                    Weight: ${plate.weight} x ${plate.quantity / 2} <small>(${plate.quantity})</small>
                </div>`;
    }

    let platesData =
        `<div class="card-footer bg-dark-blue">
        Plates On Each Side (${getGymUnit().NAME}):
    </div>`;
    const sortedPlates = plates.sort((a, b) => b.weight - a.weight);
    for (const plate of sortedPlates) {
        platesData += createPlateListItem(plate);
    }

    if (sortedPlates.length < 1) {
        platesData = `<div class="card-footer bg-light-blue">No Plates Needed</div>`;
    }

    return platesData;
}

function createWeightSuggestionDeltaHTML(suggestion) {
    let deltaColor = "";
    if (suggestion.deltaInviewUnit < 0) {
        deltaColor = "text-danger";
    } else if (suggestion.deltaInviewUnit > 0) {
        deltaColor = "text-primary";
    }
    return `<small class="${deltaColor}">Delta: ${suggestion.deltaInviewUnit}</small>`;
}

function createSuggestionCardHTML(suggestion, idx) {
    return `<div class="card mx-auto my-2 shadow-sm" style="width: 18rem;">
        <div class="card-body pb-1">
            <h5 class="card-title">Option ${String.fromCharCode(idx + 65)}:</h5>
            <h6 class="card-title mb-0">
                Total Weight: ${suggestion.weight} ${getViewUnit().NAME}
            </h6>
            ${createWeightSuggestionDeltaHTML(suggestion)}
        </div>
        <div class="card-footer bg-dark-c">
            Barbell: ${suggestion.barbellWeight} ${getViewUnit().NAME}
        </div>
        ${createSuggestionPlatesCardHTML(suggestion.plates)}
    </div>`;
}

function drawPlatesSuggestionResults(suggestions) {
    const resultsDiv = document.getElementById("results");
    if (!resultsDiv) return notify("internal error, please try again later");

    let html = "";
    for (let i = 0; i < suggestions.length; i++) {
        html += createSuggestionCardHTML(suggestions[i], i);
    }
    resultsDiv.innerHTML = html;
}
