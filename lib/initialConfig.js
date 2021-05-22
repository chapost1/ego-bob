const KG_TO_POUND = 2.204622621847;

const MAX_DELTA_RATIO = 0.05;

const KG_BARBELLS_OPTIONS = [
    { weight: 10, on: false },
    { weight: 15, on: false },
    { weight: 17.5, on: false },
    { weight: 20, on: true },
    { weight: 23.5, on: false },
];

const POUND_PLATES_OPTIONS = [
    { weight: 5, on: true, max: 10 },
    { weight: 10, on: true, max: 12 },
    { weight: 20, on: true, max: 8 },
    { weight: 25, on: true, max: 8 },
    { weight: 35, on: true, max: 12 },
    { weight: 45, on: true, max: 10 }
];

const POUND_BARBELLS_OPTIONS = KG_BARBELLS_OPTIONS.map(function (option) {
    return { weight: kgToPound(option.weight), on: option.on }
}
);

const KG_PLATES_OPTIONS = [
    { weight: 1.25, on: true, max: 8 },
    { weight: 2.5, on: true, max: 6 },
    { weight: 5, on: true, max: 12 },
    { weight: 10, on: true, max: 8 },
    { weight: 15, on: true, max: 12 },
    { weight: 20, on: true, max: 10 },
];

const BASES = {
    KG: {
        NAME: "KG",
        PLATES_OPTIONS: KG_PLATES_OPTIONS,
        BARBELLS_OPTIONS: KG_BARBELLS_OPTIONS,
    },
    POUND: {
        NAME: "POUND",
        PLATES_OPTIONS: POUND_PLATES_OPTIONS,
        BARBELLS_OPTIONS: POUND_BARBELLS_OPTIONS,
    }
}

const BASE_BY_NAME = {
    [BASES.KG.NAME]: BASES.KG,
    [BASES.POUND.NAME]: BASES.POUND
}

function getBaseByName(name) {
    return BASE_BY_NAME[name];
}

function kgToPound(kg) {
    return kg * KG_TO_POUND;
}

function poundToKg(pound) {
    return pound / KG_TO_POUND;
}


// init html
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
        const selectEl = $("#workout-wizard-panel-settings-barbell-select");
        let selectOptions = "";
        for (const barbell of BASES.KG.BARBELLS_OPTIONS) {
            const selected = barbell.on ? "selected" : "";
            selectOptions += `<option value="${barbell.weight}" ${selected}>${barbell.weight}</option>`;
        }
        selectEl.html(selectOptions);
        selectEl.on("change", barbellSelect);
    })();

    function assignUnitSelect(unitProperty, calcType, next) {
        function viewUnitSelect(event) {
            state[unitProperty] = event.target.value;
            if (next) next();
        }
        let firstUnitName, lastUnitName;
        for (const unit in BASES) {
            lastUnitName = '#' + "workout-wizard-panel-settings-" + calcType + "-unit-select-" + BASES[unit].NAME.toLowerCase();
            $(lastUnitName).on('change', viewUnitSelect);
            if (!firstUnitName) {
                firstUnitName = lastUnitName;
            }
        }
        $(firstUnitName).click();
    }

    (function assignViewUnitSelect() {
        assignUnitSelect("viewUnit", "view", function () {
            updateTargetWeightInputPlaceholder();
        });
    })();

    (function assignGymUnitSelect() {
        assignUnitSelect("gymPlatesUnit", "gym");
    })();

    (function assignAllowPlatesCalcDeltaOnChange() {
        function allowDeltaOnChange(event) {
            state.allowPlatesCalcDelta = event.target.checked;
        }
        const checkbox = $("#workout-wizard-panel-settings-allow-calc-delta");
        checkbox.on('change', allowDeltaOnChange);
        checkbox.click();
        checkbox.next("label").html(`Allow Delta <small>(~${MAX_DELTA_RATIO * 100}%)</small>&nbsp;<small class="text-sm-end fw-light text-danger">*Recommended</small>`);
    })();

    (function initConvertionInputValues() {
        $("#kg-to-pound").val(1);
        convertWeightUnit("kg-to-pound");
        $("#pound-to-kg").val(1);
        convertWeightUnit("pound-to-kg");
    })();
});