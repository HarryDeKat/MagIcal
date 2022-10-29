var reminders = [30];
$('#AfrondenLink').change(() => {
    if ($('#Laatparssonlijkeaanpassingsknopzien').prop('checked') || $('#AfrondenLink').prop('checked')) { var shouldcheck = true } else { var shouldcheck = false }
    $('#InHTMLFormaat').prop('checked', shouldcheck);
    $('#InHTMLFormaat').prop('disabled', shouldcheck);
});
$('#Laatparssonlijkeaanpassingsknopzien').change(() => {
    if ($('#Laatparssonlijkeaanpassingsknopzien').prop('checked') || $('#AfrondenLink').prop('checked')) { var shouldcheck = true } else { var shouldcheck = false }
    $('#InHTMLFormaat').prop('checked', shouldcheck);
    $('#InHTMLFormaat').prop('disabled', shouldcheck);
    $('#ShowAanpassing').prop('checked', shouldcheck);
    $('#ShowAanpassing').prop('disabled', shouldcheck);
});
$('#ShowUitval').change(() => {
    $('#ShowUitvalMetcancelled').prop('checked', false);
    $('#ShowUitvalMetcancelled').prop('disabled', !$('#ShowUitval').prop('checked'));
});
function removeItemOnce(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) { arr.splice(index, 1); }
    return arr;
}
AddToReminders();
function AddToReminders(remove) {
    if (document.getElementById('AddReminderTime').value != '' && parseInt(document.getElementById('AddReminderTime').value) > 0) {
        if (remove == true) {
            removeItemOnce(reminders, parseInt(document.getElementById('AddReminderTime').value))
        } else if (reminders.includes(parseInt(document.getElementById('AddReminderTime').value) && parseInt(document.getElementById('AddReminderTime').value) > 0) == false) {
            reminders.push(parseInt(document.getElementById('AddReminderTime').value))
        }
    }
    reminders.forEach(reminder => {
        if (document.getElementById('Reminder-' + reminder) != null) { return; }
        const reminderelement = document.createElement('li');
        reminderelement.className = 'list-group-item';
        reminderelement.id = 'Reminder-' + reminder
        reminderelement.innerHTML = `<button class="me-2" type="button" onclick="removeItemOnce(reminders, ` + reminder + `); document.getElementById('Reminder-` + reminder + `').remove();" name="listGroupRadio" id="firstRadio" style="background: transparent;border: none;padding: 0;"><span class="material-symbols-outlined">remove</span></button><label class="form-check-label" for="firstRadio">` + reminder + ` minuten van tevoren.</label></button>`;
        document.getElementById('RemindersList').prepend(reminderelement)
    });
    document.getElementById('AddReminderTime').value = '';
}
async function CreateLink() {
    document.getElementById('info').innerHTML = '';
    var authobj = {
        "username": null,
        "password": null,
        "tenant": null,
        "AfrondenLink": false,
        "ShowAanpassing": false,
        "getemail": false
    }
    authobj.username = document.getElementById('username').value;
    authobj.password = document.getElementById('password').value;
    authobj.tenant = document.getElementById('tenant').value + ".magister.net";
    authobj.AfrondenLink = document.getElementById('AfrondenLink').checked;
    authobj.ShowAanpassing = document.getElementById('ShowAanpassing').checked;
    authobj.getemail = document.getElementById('getemail').checked;
    var evtitel = ''
    if (document.getElementById('evenementtitel').value != "") { evtitel = '&summaryname=' + btoa(document.getElementById('evenementtitel').value) }
    var link = document.location.href + "ical?auth=" + await encrypt(JSON.stringify(authobj)) +
        "&extrawekenvooruit=" + document.getElementById('awv').value +
        "&extrawekenterug=" + document.getElementById('awa').value +
        "&InHTMLFormaat=" + document.getElementById('InHTMLFormaat').checked +
        "&ReadalbeCal=" + document.getElementById('ReadalbeCal').checked +
        "&ShowToetsen=" + document.getElementById('ShowToetsen').checked +
        "&ShowEvents=" + document.getElementById('ShowEvents').checked +
        "&ShowHuiswerk=" + document.getElementById('ShowHuiswerk').checked +
        "&ShowAfgerond=" + document.getElementById('ShowAfgerond').checked +
        "&ShowOpdrachten=" + document.getElementById('ShowOpdrachten').checked +
        "&ShowAbsenties=" + document.getElementById('ShowAbsenties').checked +
        "&SkipEmpty=" + document.getElementById('SkipEmpty').checked +
        "&ShowUitval=" + document.getElementById('ShowUitval').checked +
        "&ShowPersonalChanges=" + document.getElementById('Laatparssonlijkeaanpassingsknopzien').checked +
        "&ShowUitvalMetcancelled=" + document.getElementById('ShowUitvalMetcancelled').checked +
        "&Toetsvooruitblik=" + document.getElementById('Toetsvooruitblik').checked +
        "&Herinneringen=" + btoa(reminders) +
        evtitel
    document.getElementById('link').value = link
    if (authobj.ShowAanpassing == true) {
        document.getElementById('persoonlijkeaanpassingbutton').children[0].setAttribute('onClick', `window.open('${document.location.origin}/Aanpassen?auth=${await encrypt(JSON.stringify(authobj))}&frontend=true&date=${new Date().toISOString().slice(0, 10)}')`);
        document.getElementById('persoonlijkeaanpassingbutton').style.display = 'flex';
    }
    CheckIfValid(link);
    return link
}
function Copy() {
    var copyText = document.getElementById("link");
    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices
    navigator.clipboard.writeText(copyText.value);
}
$('#AddReminderTime').keypress(function (event) {
    var keycode = event.keyCode || event.which;
    if (keycode == '13') {
        AddToReminders();
    }
});
async function CheckIfValid(url) {
    var element = document.getElementById('checkicon')
    element.innerHTML = `<span style="border-width: 0.15rem;" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span><span class="visually-hidden">Loading...</span>`;
    request = await fetch(url);
    switch (request.status) {
        case 200 || 202: element.innerHTML = `done`; break; //All ok
        case 408 || 504: element.innerHTML = `hourglass_bottom`; break; //Took too long
        case 401: document.getElementById('info').innerHTML = `<div class="alert alert-warning" role="alert">Inloggen mislukt. Controleer of je de juiste inloggegevens hebt ingevuld.</div>`; element.innerHTML = `error`; document.getElementById('persoonlijkeaanpassingbutton').style.display = 'none'; break; //Login details wrong
        default: document.getElementById('persoonlijkeaanpassingbutton').style.display = 'none'; element.innerHTML = `error`; break; //Other errors
    }
}