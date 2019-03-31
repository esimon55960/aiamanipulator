function displayAnyMessage(msgInfo) {
    if (msgInfo.message) {
        _showOverlay(msgInfo.icon, msgInfo.message);
        document.getElementById('overlayButtonSection').style.display = 'table-row';
    }
}
function closeMessage() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('overlayButtonSection').style.display = 'none';
    document.getElementById('overlayIcon').src = '/public/waiting.gif';
}

function showWaiting(msg) {
    _showOverlay('waiting.gif', msg)
}

function _showOverlay(icon, msg) {
    document.getElementById('overlayIcon').src = '/public/' + icon;
    document.getElementById('overlayMessage').innerText = msg;
    document.getElementById('overlay').style.display = 'block';
}
