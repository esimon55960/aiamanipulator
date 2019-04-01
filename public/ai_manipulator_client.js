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
    return true;
}

function _showOverlay(icon, msg) {
    document.getElementById('overlayIcon').src = '/public/' + icon;
    document.getElementById('overlayMessage').innerText = msg;
    document.getElementById('overlay').style.display = 'block';
}

function validScreenName(form) {
    const newName = form.newName.value;
    const isValidPattern = new RegExp('^[a-zA-Z0-9_]+$');
    if (!isValidPattern.test(newName)) {
        displayAnyMessage({icon: 'icons8-error-30.png', message: 'Screen name must be a-z, A-Z, 0-9 or _ characters.'})
        return false;
    } else {
        return true;
    }
}

function primaryFileChange(name) {
    console.info('Original primary=' + name);
}

function toggleFileLoadButtons(name, selectId, formId) {
    
}