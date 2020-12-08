const first = $("#firstI");
const last = $("#lastI");
const email = $("#emailI");

first.on("input", () => {
    lsSetItem(first, "first");
});

lsGetItem(first, "first");

last.on("input", () => {
    lsSetItem(last, "last");
});

lsGetItem(last, "last");

email.on("input", () => {
    lsSetItem(email, "email");
});

lsGetItem(email, "email");

function lsSetItem(inputField, inputFieldString) {
    let userInput = inputField.val();
    try {
        localStorage.setItem(inputFieldString, userInput);
    } catch (err) {
        console.error(
            `error on setting local storage item ${inputFieldString}: `,
            err
        );
    }
}

function lsGetItem(inputField, inputFieldString) {
    try {
        const toRetrieve = localStorage.getItem(inputFieldString);
        inputField.val(toRetrieve);
    } catch (err) {
        console.error(
            `error on getting local storage item ${inputFieldString}: `,
            err
        );
    }
}
