// create var to initialise db
let db;

const request = indexedDB.open('budgetTracker', 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;

    db.createObjectStore("tally", { autoIncrement: true });
};

// when the request is successful
request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadInfo();
    }
};

// when the request results in an error
request.onerror = function (event) {
    console.log(event.target.errorCode);
};

function saveUserData (data) {
    const transaction = db.transaction(["tally"], "readwrite");

    const tallyTransaction = transaction.objectStore("tally");

    tallyTransaction.add(data);
};

function uploadInfo() {
    const transaction = db.transaction(["tally"], "readwrite");

    const tallyTransaction = transaction.objectStore("tally");

    const getAll = tallyTransaction.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                },
            })
            .then((response) => response.json())
            .then((serverResponse) => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }

                const transaction = db.transaction(["tally"], "readwrite");

                const tallyTransaction = transaction.objectStore("tally");

                tallyTransaction.clear();

                alert("All offline transactions have been successfully uploaded!")
            })
            .catch((err) => {
                console.log(err);
            });
        }
    }
}

// add an event listener
window.addEventListener("online", uploadInfo);