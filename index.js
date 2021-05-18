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
        if (weight == targetWeight || weight == targetWeight + maxDelta) break;
        if (pairWeight + weight <= targetWeight + maxDelta && platesUsed <= plate.max) {
            weight += pairWeight;
            platesUsed++;
            plates.push(plate.weight);
            plates.push(plate.weight);
        }
    }

    return {
        plates: plates,
        weight: weight,
        delta: weight - targetWeight
    }
}

function platesCombosToArr(plates) {
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

function getMaxDelta() {
    const maxDeltaInKg = 10;
    if (state.viewUnit == BASES.POUND.NAME) {
        return kgToPound(maxDeltaInKg);
    }
    return maxDeltaInKg;
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
        plates: platesCombosToArr(plateCombo.plates),
        deltaInviewUnit: toFixedNumber(delta, 3)
    }
}

function calcGymPlatesSuggestionsByTargetWeight(targetWeight) {
    const maxDelta = getMaxDelta();
    const viewUnit = getViewUnit();
    const gymUnit = getGymUnit();
    targetWeight = targetWeightViewUnitToGymUnit(targetWeight, viewUnit, gymUnit);

    const gymPlatesOptions = sortWeightOptionsDesc(gymUnit.PLATES_OPTIONS.filter(option => option.on));

    const weightOptions = [];

    const smallestPlateWeight = Math.min(...gymPlatesOptions.map(option => option.weight));

    for (const barbell of gymUnit.BARBELLS_OPTIONS) {
        if (!barbell.on) continue;
        const platesCombos = new Set();
        for (let delta = 0; delta <= maxDelta; delta += smallestPlateWeight) {
            const plateCombo = getPlatesCombinationsOptions(gymPlatesOptions, targetWeight - barbell.weight, delta);
            const key = JSON.stringify(plateCombo.plates);
            if (platesCombos.has(key)) continue;
            platesCombos.add(key);
            weightOptions.push(createWeightOption(barbell, plateCombo, viewUnit, gymUnit));
        }
    }

    return sortWeightOptionsByDeltaAsc(weightOptions).slice(0, 4);
}

function sortWeightOptionsByDeltaAsc(weightOptions) {
    return weightOptions.sort(function (a, b) {
        return Math.abs(a.deltaInviewUnit) - Math.abs(b.deltaInviewUnit);
    });
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
    if (!targetWeight) return showMessage("No target weight.");
    const suggestions = calcGymPlatesSuggestionsByTargetWeight(targetWeight);

    appendPlatesSuggestionResults(suggestions);
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

function showMessage(message) {
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

    function assignUnitSelect(unitProperty, calcType) {
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
    }

    (function assignViewUnitSelect() {
        assignUnitSelect("viewUnit", "target");
    })();

    (function assignGymUnitSelect() {
        assignUnitSelect("gymPlatesUnit", "gym");
    })();
});

function appendPlatesSuggestionResults(suggestions) {
    const resultsDiv = document.getElementById("results");
    if (!resultsDiv) return showMessage("internal error, please try again later");

    const cardHTML = (suggestion, idx) => {
        const createPlateListItem = (plate) => {
            return `<div class="card-footer bg-light-blue">
                        Weight: ${plate.weight} x ${plate.quantity / 2} <small>(${plate.quantity})</small>
                    </div>`;
        }

        let platesData = 
        `<div class="card-footer bg-dark-blue">
            Plates On Each Side:
        </div>`;
        const plates = suggestion.plates.sort((a, b) => b.weight - a.weight);
        for (const plate of plates) {
            platesData += createPlateListItem(plate);
        }

        if (plates.length < 1) {
            platesData = `<div class="card-footer bg-light-blue">No Plates Needed</div>`;
        }

        let deltaColor = "";
        if (suggestion.deltaInviewUnit < 0) {
            deltaColor = "text-danger";
        } else if (suggestion.deltaInviewUnit > 0){
            deltaColor = "text-primary";
        }

        return `<div class="card mx-auto my-2 shadow-sm" style="width: 18rem;">
            <div class="card-body pb-1">
                <h5 class="card-title">Option ${String.fromCharCode(idx + 65)}:</h5>
                <h6 class="card-title mb-0">
                    Total Weight: ${suggestion.weight}
                </h6>
                <small class="${deltaColor}">Delta: ${suggestion.deltaInviewUnit}</small>
            </div>
            <div class="card-footer bg-dark-c">
                Barbell: ${suggestion.barbellWeight} ${getGymUnit().NAME}
            </div>
            ${platesData}
        </div>`;
    }

    let html = "";
    for (let i = 0; i < suggestions.length; i++) {
        html += cardHTML(suggestions[i], i);
    }
    resultsDiv.innerHTML = html;
}

