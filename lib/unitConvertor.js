function UnitConvertor() {
    /* props */
    // private
    const _oz = 35.27396195, _kg = 1, _g = 1000, _us_ton = 0.00110231,
        _ton = 0.000999998810749399896, _mg = 1e+6, _mcg = 1e+9,
        _lb = 2.204622621847, _stone = 0.15747304442,
        _imp_ton = 0.000984205357142857104;
    const UNITS_RATIOS_TO_STANDARD_UNIT = {
        KILOGRAM: _kg,
        KG: _kg,
        GRAM: _g,
        G: _g,
        MILLIGRAM: _mg,
        MG: _mg,
        OUNCE: _oz,
        OZ: _oz,
        POUND: _lb,
        LB: _lb,
        MICROGRAM: _mcg,
        MCG: _mcg,
        STONE: _stone,
        ST: _stone,
        TONNE: _ton,
        TON: _ton,
        "US TON": _us_ton,
        "IMPERIAL TON": _imp_ton,
    }

    /* methods */

    // private
    const toStandardUnit = (currentUnit, weight) => {
        return weight / UNITS_RATIOS_TO_STANDARD_UNIT[currentUnit.toUpperCase()];
    }

    const standardToTargetUnit = (targetUnit, weight) => {
        return weight * UNITS_RATIOS_TO_STANDARD_UNIT[targetUnit.toUpperCase()];
    }

    // public
    this.convert = (originalUnit, targetUnit, weight) => {
        return standardToTargetUnit(targetUnit, toStandardUnit(originalUnit, weight));
    }

    // init requirements
    (function init() {
        (function initUnitsRatios() {
            for (const unit in UNITS_RATIOS_TO_STANDARD_UNIT) {
                UNITS_RATIOS_TO_STANDARD_UNIT[`${unit}S`] = UNITS_RATIOS_TO_STANDARD_UNIT[unit];
            }
        })();
    })();
}

// static
UnitConvertor.convert = (new UnitConvertor()).convert;