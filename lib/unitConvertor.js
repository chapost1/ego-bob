// class UnitConvertor {
//     static STANDARD_BASE_UNITS_RATIOS = {};

//     static #getStandardUnitRatio = unitName => this.STANDARD_BASE_UNITS_RATIOS[unitName.toUpperCase()];

//     static #currToStandardUnitRatio = currUnit => 1 / this.#getStandardUnitRatio(currUnit);

//     static #standardToTargetUnitRatio = targetUnit => this.#getStandardUnitRatio(targetUnit);

//     static convert = (currUnit, targetUnit, weight) => this.getConversionRatio(currUnit, targetUnit) * weight;

//     static getConversionRatio = (currUnit, targetUnit) => {
//         return this.#currToStandardUnitRatio(currUnit) * this.#standardToTargetUnitRatio(targetUnit);
//     }

//     static getSupportedUnits = () => {
//         return Object.keys(this.STANDARD_BASE_UNITS_RATIOS).sort((a, b) => a.localeCompare(b));
//     }
// }

// (function initSupportedUnitsDictionary() {// standard base unit: kg
//     const _oz = 35.27396195, _kg = 1, _g = 1000, _us_ton = 0.00110231,
//         _ton = 0.001, _mg = 1e+6, _mcg = 1e+9, _lb = 2.204622621847,
//         _st = 0.15747304442, _imp_ton = 0.000984205357,
//         _hg = 10, _dag = 100, _dg = 10000, _cg = 100000;

//     const dict = {
//         KILOGRAM: _kg, KG: _kg,
//         GRAM: _g, G: _g,
//         MILLIGRAM: _mg, MG: _mg,
//         OUNCE: _oz, OZ: _oz,
//         POUND: _lb, LB: _lb,
//         MICROGRAM: _mcg, MCG: _mcg,
//         HECTOGRAM: _hg, HG: _hg,
//         DECAGRAM: _dag, DAG: _dag,
//         DECIGRAM: _dg, DG: _dg,
//         CENTIGRAM: _cg, CG: _cg,
//         STONE: _st, ST: _st,
//         TONNE: _ton,
//         US_TON: _us_ton, SHORT_TON: _us_ton, TON: _us_ton,
//         IMPERIAL_TON: _imp_ton, LONG_TON: _imp_ton,
//     }

//     for (const unit in dict) {
//         dict[`${unit.replaceAll('_', ' ')}`] = dict[unit];
//     }

//     UnitConvertor.STANDARD_BASE_UNITS_RATIOS = dict;
// })();

function _defineProperty(t, e, r) { return e in t ? Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = r, t } function _classStaticPrivateFieldSpecGet(t, e, r) { return _classCheckPrivateStaticAccess(t, e), _classCheckPrivateStaticFieldDescriptor(r, "get"), _classApplyDescriptorGet(t, r) } function _classCheckPrivateStaticFieldDescriptor(t, e) { if (void 0 === t) throw new TypeError("attempted to " + e + " private static field before its declaration") } function _classCheckPrivateStaticAccess(t, e) { if (t !== e) throw new TypeError("Private static access of wrong provenance") } function _classApplyDescriptorGet(t, e) { return e.get ? e.get.call(t) : e.value } class UnitConvertor { } _defineProperty(UnitConvertor, "STANDARD_BASE_UNITS_RATIOS", {}); var _getStandardUnitRatio = { writable: !0, value: t => UnitConvertor.STANDARD_BASE_UNITS_RATIOS[t.toUpperCase()] }, _currToStandardUnitRatio = { writable: !0, value: t => 1 / _classStaticPrivateFieldSpecGet(UnitConvertor, UnitConvertor, _getStandardUnitRatio).call(UnitConvertor, t) }, _standardToTargetUnitRatio = { writable: !0, value: t => _classStaticPrivateFieldSpecGet(UnitConvertor, UnitConvertor, _getStandardUnitRatio).call(UnitConvertor, t) }; _defineProperty(UnitConvertor, "convert", (t, e, r) => UnitConvertor.getConversionRatio(t, e) * r), _defineProperty(UnitConvertor, "getConversionRatio", (t, e) => _classStaticPrivateFieldSpecGet(UnitConvertor, UnitConvertor, _currToStandardUnitRatio).call(UnitConvertor, t) * _classStaticPrivateFieldSpecGet(UnitConvertor, UnitConvertor, _standardToTargetUnitRatio).call(UnitConvertor, e)), _defineProperty(UnitConvertor, "getSupportedUnits", () => Object.keys(UnitConvertor.STANDARD_BASE_UNITS_RATIOS).sort((t, e) => t.localeCompare(e))), function () { const t = 2.204622621847, e = .15747304442, r = { KILOGRAM: 1, KG: 1, GRAM: 1e3, G: 1e3, MILLIGRAM: 1e6, MG: 1e6, OUNCE: 35.27396195, OZ: 35.27396195, POUND: t, LB: t, MICROGRAM: 1e9, MCG: 1e9, HECTOGRAM: 10, HG: 10, DECAGRAM: 100, DAG: 100, DECIGRAM: 1e4, DG: 1e4, CENTIGRAM: 1e5, CG: 1e5, STONE: e, ST: e, TONNE: .001, US_TON: .00110231, SHORT_TON: .00110231, TON: .00110231, IMPERIAL_TON: .000984205357, LONG_TON: .000984205357 }; for (const t in r) r[`${t.replaceAll("_", " ")}`] = r[t]; UnitConvertor.STANDARD_BASE_UNITS_RATIOS = r }();