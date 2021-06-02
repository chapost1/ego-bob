class UnitConvertor {
    static STANDARD_BASE_UNITS_RATIOS = {};

    static #getStandardUnitRatio = unitName => this.STANDARD_BASE_UNITS_RATIOS[this.#maskUnitName(unitName)];

    static #currToStandardUnitRatio = currUnit => 1 / this.#getStandardUnitRatio(currUnit);

    static #standardToTargetUnitRatio = targetUnit => this.#getStandardUnitRatio(targetUnit);

    static #maskUnitName = unitName => unitName.toUpperCase();

    static getConversionRatio = (currUnit, targetUnit) => this.#currToStandardUnitRatio(currUnit) * this.#standardToTargetUnitRatio(targetUnit);

    static convert = (currUnit, targetUnit, weight) => weight * this.getConversionRatio(currUnit, targetUnit);

    static getSupportedUnits = () => Object.keys(this.STANDARD_BASE_UNITS_RATIOS).sort((a, b) => a.localeCompare(b));
}

(function initSupportedUnitsDictionary() {// standard base unit: kg
    const _oz = 35.27396195, _kg = 1, _g = 1000, _us_ton = 0.00110231,
        _ton = 0.001, _mg = 1e+6, _mcg = 1e+9, _lb = 2.204622621847,
        _st = 0.15747304442, _imp_ton = 0.000984205357,
        _hg = 10, _dag = 100, _dg = 10000, _cg = 100000;

    const dict = {
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

    for (const unit in dict) {
        dict[`${unit.replaceAll('_', ' ')}`] = dict[unit];
    }

    UnitConvertor.STANDARD_BASE_UNITS_RATIOS = dict;
})();
