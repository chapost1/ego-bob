
function toFixedNumber(num, fixed) {
    if (num === null || num === undefined || (typeof num == "string" && num.length == 0) || !num) return 0;
    const re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return Number(num.toString().match(re)[0]);
}

function deepObjectPremitivesCopy(object) {
    return JSON.parse(JSON.stringify(object));
}

function notify(message) {
    const toastEl = $("#toast-id");
    const toastMessageBody = $("#toast-message");
    if (!toastEl || !toastMessageBody) return;
    toastMessageBody.html(message);
    toastEl.toast('show');
}

function notifyInternalError() {
    notify("internal error");
}

function numberToUpperCaseLetter(number) {
    return String.fromCharCode(number + 65);
}

function copyToClipboard(element) {
    const $temp = $("<input>");
    $("body").append($temp);
    let textToCopy = $(element).text();
    if (textToCopy == "") {
        textToCopy = $(element).val();
    }
    $temp.val(textToCopy).select();
    document.execCommand("copy");
    $temp.remove();
    notify("Text Copied To Clipboard.");
}

function zoomOutMobile() {
    var viewport = document.querySelector('meta[name="viewport"]');

    if (viewport) {
        viewport.content = "initial-scale=0.1";
        viewport.content = "width=device-width";
    }
}
