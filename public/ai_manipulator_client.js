function showAlert(msg) {
    alert('msg=' + msg);
}

function displayAnyMessage(msg) {
    console.log('msg=' + msg)
    if (msg && msg != 'null' && msg != 'undefined') {
        alert(msg)
    }
}

function showOverlay(msg) {
    document.getElementById('overlayMessage').innerText = msg;
    document.getElementById('overlay').style.display = 'block';
}
