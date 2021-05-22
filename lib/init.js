// init html
$(document).ready(function () {
    (function assignBarbellSelect() {
        function barbellSelect(event) {
            for (let i = 0; i < state.BASES.KG.BARBELLS_OPTIONS.length; i++) {
                state.BASES.KG.BARBELLS_OPTIONS[i].on = false;
                state.BASES.POUND.BARBELLS_OPTIONS[i].on = false;
                if (Number(event.target.value) == state.BASES.KG.BARBELLS_OPTIONS[i].weight) {
                    state.BASES.KG.BARBELLS_OPTIONS[i].on = true;
                    state.BASES.POUND.BARBELLS_OPTIONS[i].on = true;
                }
            }
        }
        const selectEl = $("#workout-wizard-panel-settings-barbell-select");
        let selectOptions = "";
        for (const barbell of state.BASES.KG.BARBELLS_OPTIONS) {
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
        for (const unit in state.BASES) {
            lastUnitName = '#' + "workout-wizard-panel-settings-" + calcType + "-unit-select-" + state.BASES[unit].NAME.toLowerCase();
            $(lastUnitName).on('change', viewUnitSelect);
            if (!firstUnitName) {
                firstUnitName = lastUnitName;
            }
        }
        $(firstUnitName).click();
    }

    (function assignViewUnitSelect() {
        function viewUnitSelect(event) {
            state.viewUnit = event.target.value;
            updateTargetWeightInputPlaceholder();
        }
        let firstUnitName, lastUnitName;
        for (const unit in state.BASES) {
            lastUnitName = '#' + "workout-wizard-panel-settings-view-unit-select-" + state.BASES[unit].NAME.toLowerCase();
            $(lastUnitName).on('change', viewUnitSelect);
            if (!firstUnitName) {
                firstUnitName = lastUnitName;
            }
        }
        $(firstUnitName).click();
    })();

    (function assignGymUnitSelect() {
        var tabEls = document.querySelectorAll('#workout-wizard-plates-settings-modal-tab button[data-bs-toggle="tab"]')
        for (const el of tabEls) {
            el.addEventListener('show.bs.tab', function (event) {
                let changed = event.target.innerText != state.gymPlatesUnit;
                if (!changed) return;
                state.gymPlatesUnit = event.target.innerText;
                notify(`${state.gymPlatesUnit} Selected as gym plates unit.`);
            });
            if (state.gymPlatesUnit == el.innerText) {
                el.click();
            }
        }
    })();

    (function assignAllowPlatesCalcDeltaOnChange() {
        function allowDeltaOnChange(event) {
            state.allowPlatesCalcDelta = event.target.checked;
        }
        const checkbox = $("#workout-wizard-panel-settings-allow-calc-delta");
        checkbox.on('change', allowDeltaOnChange);
        checkbox.click();
        checkbox.next("label").html(`Allow Delta <small>(~${MAX_DELTA_RATIO * 100}%)</small>&nbsp;<small class="text-sm-end fw-light text-danger" style="font-size: 0.6em;">*Recommended</small>`);
    })();

    (function initConvertionInputValues() {
        $("#kg-to-pound").val(1);
        convertWeightUnit("kg-to-pound");
        $("#pound-to-kg").val(1);
        convertWeightUnit("pound-to-kg");
    })();

    (function assignPlatesSettingsModalEvents() {
        $("#workout-wizard-plates-settings-modal").on("show.bs.modal", function (event) {
            const modalBodyTabsContent = $(event.target).find("#workout-wizard-plates-settings-modal-content");
            if (!modalBodyTabsContent[0]) return notifyInternalError();
            draw();
            function draw() {
                let index = 0;
                for (const baseKey in state.BASES) {
                    const base = state.BASES[baseKey];
                    const contentConainer = $(`#workout-wizard-plates-settings-modal-${base.NAME.toLowerCase()}-tab-content`);
                    let baseHTML = "";

                    for (const plate of base.PLATES_OPTIONS) {
                        const countID = `ww-plates-settings-modal-plate-count-${index}`;
                        const switchID = `ww-plates-settings-modal-plate-switch-${index}`;
                        const checked = plate.on ? "checked" : "";
                        const onChangeMethodCall = `updateBasePlatesSettings('${base.NAME}', ${plate.weight}, '${countID}', '${switchID}')`;
                        baseHTML +=
                            `<tr data-weight="${plate.weight}">
                                <td>
                                    <form>
                                        <input disabled type="number" class="form-control w-50" placeholder="0" value="${plate.weight}">
                                    </form>
                                </td>
                                <td>
                                    <form>
                                        <input id="${countID}" onkeyup="${onChangeMethodCall}"
                                         type="number" class="form-control w-50" placeholder="0" value="${plate.max}">
                                    </form>
                                </td>
                            <td scope="col">
                                <div class="form-check form-switch">
                                    <input onchange="${onChangeMethodCall}"
                                     class="form-check-input" type="checkbox" id="${switchID}" ${checked}>
                                </div>
                            </td>
                        </tr>`;
                        index++;
                    }
                    
                    $(contentConainer).html(
                        `<table class="table table-sm table-borderless hey">
                        <thead>
                          <tr>
                            <th scope="col">Weight</th>
                            <th scope="col">Count</th>
                            <th scope="col">Enabled</th>
                          </tr>
                        </thead>
                        <tbody>
                        ${baseHTML}
                        </tbody>
                      </table>`
                    );
                }
            }
        });
    })();
});

function updateBasePlatesSettings(baseName, weight, countElID, switchElID) {
    if (!state.BASES[baseName]) {
        return notifyInternalError();
    }
    const base = state.BASES[baseName];
    for (const plate of base.PLATES_OPTIONS) {
        if (plate.weight != weight) {
            continue;
        }
        const count = $(`#${countElID}`).val();
        if (count < 0 || count > 20) return notify("Plates Count must be in range of 0-20");
        plate.max = count;
        plate.on = document.getElementById(switchElID).checked;
    }
}
