const KG_TO_POUND = 2.204622621847;

const MAX_DELTA_RATIO = 0.05;

const DEFAULT_KG_BARBELLS_OPTIONS = [
    { weight: 10, on: false },
    { weight: 15, on: false },
    { weight: 17.5, on: false },
    { weight: 20, on: true },
    { weight: 23.5, on: false },
];

const DEFAULT_POUND_PLATES_OPTIONS = [
    { weight: 5, on: true, max: 10 },
    { weight: 10, on: true, max: 12 },
    { weight: 20, on: true, max: 8 },
    { weight: 25, on: true, max: 8 },
    { weight: 35, on: true, max: 12 },
    { weight: 45, on: true, max: 10 }
];

const DEFAULT_POUND_BARBELLS_OPTIONS = DEFAULT_KG_BARBELLS_OPTIONS.map(function (option) {
    return { weight: toFixedNumber(kgToPound(option.weight), 2), on: option.on }
}
);

const DEFAULT_KG_PLATES_OPTIONS = [
    { weight: 1.25, on: true, max: 8 },
    { weight: 2.5, on: true, max: 6 },
    { weight: 5, on: true, max: 12 },
    { weight: 10, on: true, max: 8 },
    { weight: 15, on: true, max: 12 },
    { weight: 20, on: true, max: 10 },
    { weight: 25, on: true, max: 8 },
];

const BASES = {
    KG: {
        NAME: "KG",
        PLATES_OPTIONS: deepObjectPremitivesCopy(DEFAULT_KG_PLATES_OPTIONS),
        BARBELLS_OPTIONS: deepObjectPremitivesCopy(DEFAULT_KG_BARBELLS_OPTIONS),
    },
    POUND: {
        NAME: "POUND",
        PLATES_OPTIONS: deepObjectPremitivesCopy(DEFAULT_POUND_PLATES_OPTIONS),
        BARBELLS_OPTIONS: deepObjectPremitivesCopy(DEFAULT_POUND_BARBELLS_OPTIONS),
    }
}

function kgToPound(kg) {
    return kg * KG_TO_POUND;
}

function poundToKg(pound) {
    return pound / KG_TO_POUND;
}
