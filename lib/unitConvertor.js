function UnitConvertor() {
    /* props */
    // private
    const _oz = 35.27396195, _kg = 1, _g = 1000, _us_ton = 0.00110231,
        _ton = 0.001, _mg = 1e+6, _mcg = 1e+9, _lb = 2.204622621847,
        _st = 0.15747304442, _imp_ton = 0.000984205357,
        _hg = 10, _dag = 100, _dg = 10000, _cg = 100000;
    // standard: kg
    const STANDARD_TO_OTHER_UNITS_RATIOS = {
        KILOGRAM: _kg, KG: _kg,
        GRAM: _g, G: _g,
        MILLIGRAM: _mg, MG: _mg,
        OUNCE: _oz, OZ: _oz,
        POUND: _lb, LB: _lb,
        MICROGRAM: _mcg, MCG: _mcg,
        HECTOGRAM: _hg, HG: _hg,
        DECAGRAM: _dag, DAG: _dag,
        DECIGRAM: _dg, DG: _dg,
        CENTIGRAM: _cg, CG: _cg,
        STONE: _st, ST: _st,
        TONNE: _ton,
        US_TON: _us_ton, SHORT_TON: _us_ton, TON: _us_ton,
        IMPERIAL_TON: _imp_ton, LONG_TON: _imp_ton,
    }

    /* methods */

    // private
    const currToStandardUnitRatio = currUnit => {
        return 1 / STANDARD_TO_OTHER_UNITS_RATIOS[currUnit.toUpperCase()];
    }

    const standardToTargetUnitRatio = targetUnit => {
        return STANDARD_TO_OTHER_UNITS_RATIOS[targetUnit.toUpperCase()];
    }

    const getConversionRatio = (currUnit, targetUnit) => {
        if (currUnit.toUpperCase() == targetUnit.toUpperCase()) return 1;
        return currToStandardUnitRatio(currUnit) * standardToTargetUnitRatio(targetUnit);
    }

    // public
    this.convert = (currUnit, targetUnit, weight) => {
        return weight * getConversionRatio(currUnit, targetUnit);
    }

    this.getSupportedUnits = () => {
        return Object.keys(STANDARD_TO_OTHER_UNITS_RATIOS).sort((a, b) => a.localeCompare(b));
    }

    // init requirements
    (init = () => {
        (initUnitsRatios = () => {
            for (const unit in STANDARD_TO_OTHER_UNITS_RATIOS) {
                if (unit.includes('_')) {
                    STANDARD_TO_OTHER_UNITS_RATIOS[`${unit.replace('_', ' ')}`] = STANDARD_TO_OTHER_UNITS_RATIOS[unit];
                }
            }
        })();
    })();
}

(function initStaticMethods() {
    const instance = new UnitConvertor();
    UnitConvertor.convert = instance.convert;
    UnitConvertor.getSupportedUnits = instance.getSupportedUnits;
})();
