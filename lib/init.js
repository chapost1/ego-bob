
window.onload = () => requestAnimationFrame(init);
// init html and functionality
function init() {
    (function initToast() {
        $('#toast-id').toast({
            animation: true,
            autohide: true,
            delay: 1800
        });
    })();

    (function assignBarbellSelect() {
        function barbellSelect(event) {
            const gymBarbellUnitName = getViewUnitName();
            const barbellsState = state.BASES[gymBarbellUnitName].BARBELLS_OPTIONS;
            for (let i = 0; i < barbellsState.length; i++) {
                barbellsState[i].on = false;
                if (Number(event.target.value) == barbellsState[i].weight) {
                    barbellsState[i].on = true;
                }
            }
        }
        const selectEl = $("#workout-wizard-panel-settings-barbell-select");
        selectEl.on("change", barbellSelect);
        renderBarbellSelectOptions();
    })();

    function renderBarbellSelectOptions() {
        const gymBarbellUnit = getGymBarbellUnit();
        const selectEl = $("#workout-wizard-panel-settings-barbell-select");
        let selectOptions = "";
        for (const barbell of gymBarbellUnit.BARBELLS_OPTIONS) {
            const selected = barbell.on ? "selected" : "";
            selectOptions += `<option value="${barbell.weight}" ${selected}>${barbell.weight}</option>`;
        }
        selectEl.html(selectOptions);
    }

    (function assignBarbellUnitSelect() {
        function unitSelect(event) {
            state.gymBarbellUnit = event.target.value;
            renderBarbellSelectOptions();
        }
        const el = $("#workout-wizard-panel-settings-barbell-select-unit");
        el.on('change', unitSelect);
        let selectOptions = "";
        for (const unit in state.BASES) {
            const selected = state.gymBarbellUnit == unit ? "selected" : "";
            selectOptions += `<option ${selected} value="${state.BASES[unit].NAME}">${state.BASES[unit].NAME}</option>`;
        }
        el.html(selectOptions);
    })();

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
        var tabEls = document.querySelectorAll('#workout-wizard-plates-settings-modal-tab button[data-bs-toggle="tab"]');
        for (const el of tabEls) {
            el.addEventListener('show.bs.tab', function (event) {
                let changed = event.target.innerText != state.gymPlatesUnit;
                if (!changed) return;
                state.gymPlatesUnit = event.target.innerText;
                updateGymPlatesUnitBadgeText();
                notify(`${state.gymPlatesUnit} Selected as gym plates unit.`);
            });
            if (state.gymPlatesUnit == el.innerText) {
                el.click();
            }
            updateGymPlatesUnitBadgeText();
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
        $("#kg-to-lb").val(1);
        convertWeightUnit("kg-to-lb");
        $("#lb-to-kg").val(1);
        convertWeightUnit("lb-to-kg");
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
                                        <input disabled type="number" min="0" max="100" pattern="\d*" inputmode="decimal"
                                         class="form-control w-75" placeholder="0" value="${plate.weight}">
                                    </form>
                                </td>
                                <td>
                                    <form>
                                        <input id="${countID}" onkeyup="${onChangeMethodCall}" inputmode="decimal"
                                         type="number" min="0" max="20" pattern="\d*" class="form-control w-75" placeholder="0" value="${plate.max}">
                                    </form>
                                </td>
                            <td scope="col">
                                <div class="form-check form-switch form-switch-md">
                                    <input onchange="${onChangeMethodCall}"
                                     class="form-check-input noselect clickable clickable-darkening" type="checkbox" id="${switchID}" ${checked}>
                                </div>
                            </td>
                        </tr>`;
                        index++;
                    }

                    $(contentConainer).html(
                        `<table class="table table-sm table-borderless">
                        <thead>
                          <tr>
                            <th scope="col">Weight</th>
                            <th scope="col">Count</th>
                            <th scope="col">Enable</th>
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

    (function initRM1Section() {
        let repsOptions = "";
        let rpes = [];
        let initializedRPE = false;
        for (const rep in RPE_CHART) {
            repsOptions += `<option value="${rep}">${rep}</option>`;
            if (initializedRPE) continue;
            for (const rpe in RPE_CHART[rep]) {
                rpes.push(Number(rpe));
            }
            initializedRPE = true;
        }
        $("#rm1-last-reps").html(repsOptions);
        rpes.sort((a, b) => a - b);
        let rpeOptions = "";
        for (const rpe of rpes) {
            rpeOptions += `<option value="${rpe}">${rpe}</option>`;
        }
        $("#rm1-last-rpe").html(rpeOptions);
    })();

    forceInit();
}

function forceInit() {
    const preText = document.getElementById("workout-wizard-panel-plates-calc-target-weight-pre-text");
    if (!preText) return notifyInternalError();
    if (preText.innerHTML == "") location.reload();
}

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
