function showAlert(msg) {
    alert('msg=' + msg);
}

function displayAnyMessage(msg) {
    console.log('msg=' + msg)
    if (msg && msg != 'null' && msg != 'undefined') {
        alert(msg)
    }
}
