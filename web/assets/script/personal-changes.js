if (new URLSearchParams(window.location.search).has('auth')) { document.getElementById('authtoken').value = new URLSearchParams(window.location.search).get('auth'); document.getElementById('authtoken').disabled = true; }
if (new URLSearchParams(window.location.search).has('evId')) { document.getElementById('EvenementID').value = new URLSearchParams(window.location.search).get('evId'); document.getElementById('EvenementID').disabled = true; }
if (new URLSearchParams(window.location.search).has('datum') && new URLSearchParams(window.location.search).get('datum') != '') {
    document.getElementById('datepicker').value = new URLSearchParams(window.location.search).get('datum');
    if (new URLSearchParams(window.location.search).has('toolonggetdataonload') && new URLSearchParams(window.location.search).get('toolonggetdataonload') == 'true') {
        GetAndListEvents(new URLSearchParams(window.location.search).get('datum'), new URLSearchParams(window.location.search).get('evId')).then(function () {
            SelectDate(new URLSearchParams(window.location.search).get('evId'))
        })
    } else {
        GetAndListEvents(new URLSearchParams(window.location.search).get('datum'), new URLSearchParams(window.location.search).get('evId'))
    }
} else { document.getElementById('datepicker').value = new Date().toISOString().slice(0, 10);; GetAndListEvents(new Date(), null) }
if (new URLSearchParams(window.location.search).has('Aanpasing')) {
    var alsetdata = JSON.parse(atob(decodeURIComponent(new URLSearchParams(window.location.search).get('Aanpasing'))))
    document.getElementById('InfoType').value = alsetdata.InfoType ?? ''
    document.getElementById('Status').value = alsetdata.Status ?? ''
    document.getElementById('Lokatie').value = alsetdata.Lokatie ?? ''
    document.getElementById('Inhoud').innerHTML = alsetdata.Inhoud ?? ''
    document.getElementById('Inhoud').innerHTML = document.getElementById('Inhoud').innerHTML.replaceAll(/&nbsp;/g, ' ').replaceAll('\n', '<br/>').replace(/\n$/, '')
}
const editable = document.getElementById('Inhoud')
editable.addEventListener('keydown', e => {
    if (editable.innerText === '\n') editable.innerHTML = ''
})
document.getElementById('weeknumber').innerHTML = getNumberOfWeek(new Date(document.getElementById('datepicker').value))
document.getElementById('datepicker').addEventListener('change', e => { document.getElementById('weeknumber').innerHTML = getNumberOfWeek(new Date(document.getElementById('datepicker').value)) })
async function Verander() {
    if (document.getElementById('InfoType').value != '') { var setInfoType = document.getElementById('InfoType').value } else { setInfoType = null }
    if (document.getElementById('Status').value != '') { var setStatus = document.getElementById('Status').value } else { setStatus = null }
    if (document.getElementById('Lokatie').value != '') { var setLokatie = document.getElementById('Lokatie').value } else { setLokatie = null }
    if (document.getElementById('Inhoud').innerText.replace(/\n/g, "") != '') { var setInhoud = document.getElementById('Inhoud').innerHTML.replace(/style="[a-zA-Z0-9:;\.\s\(\)\-\,]*"/gi, "").replace(/\n/g, "<br/>") } else { setInhoud = null }
    var Aanpasing = encodeURIComponent(btoa(JSON.stringify({
        Status: setStatus,
        InfoType: setInfoType,
        Lokatie: setLokatie,
        Inhoud: setInhoud
    })))
    var authtoken = document.getElementById('authtoken').value
    var evid = document.getElementById('EvenementID').value
    if (evid == '' || authtoken == '') { return; }
    document.getElementById('submitbutton').innerHTML = `<span aria-hidden="true" role="status" class="spinner-border spinner-border-sm"></span> Verander`
    document.getElementById('datapickerbutton').disabled = true;
    await fetch(document.location.origin +
        '/Aanpassen?auth=' + authtoken +
        '&evId=' + evid +
        '&Aanpasing=' + Aanpasing,
        {
            credentials: 'same-origin'
        }).then(function (data) {
            if (data.status == 200) {
                document.getElementById('datapickerbutton').disabled = false;
                GetAndListEvents(document.getElementById('datepicker').value, evid);
                document.getElementById('submitbutton').style['transition'] = 'background-color 167ms ease 0s'
                document.getElementById('submitbutton').innerHTML = `Verander`
                document.getElementById('submitbutton').style['background-color'] = 'var(--bs-green)'
                setTimeout(function () {
                    document.getElementById('submitbutton').style['transition'] = 'background-color 3s ease 0s'
                    document.getElementById('submitbutton').style['background-color'] = 'var(--bs-blue)'
                }, 500);
            }
            else {
                document.getElementById('datapickerbutton').disabled = false;
                document.getElementById('submitbutton').innerHTML = `Verander`
                document.getElementById('info').innerHTML =
                    `<div id="alert${evid}" class="alert alert-warning alert-dismissible fade show" role="alert">Er is iets misgegaan met het maken van de aanpassing.
          <div class="grid-alert">
             <button type="button" class="btn" onclick="document.getElementById('alert${evid}').children[0].children[0].innerHTML = '<span aria-hidden=&#34;true&#34; role=&#34;status&#34; class=&#34;spinner-border spinner-border-sm&#34;></span>'; fetch('${data.url}', {credentials: 'same-origin'}).then(function (data) {document.getElementById('alert${evid}').children[0].children[0].innerHTML = '<span class=&#34;material-symbols-outlined&#34;>refresh</span>'; if (data.status == 200) {document.getElementById('alert${evid}').remove();} else {}})" aria-label="Retry">
                  <span class="material-symbols-outlined">refresh</span>
             </button>
                <button type="button" class="btn" data-bs-dismiss="alert" aria-label="Close">
                    <span class="material-symbols-outlined">remove</span>
                </button>
         </div>
       </div>`;
            }
        });
}
const myPromise = new Promise(function (resolve, reject) {
    resolve(10);
});

async function GetAndListEvents(date, id) {
    var end = await new Promise(async (resolve, reject) => {
        document.getElementById('datapickerbutton').disabled = true;
        document.getElementById('datapickerbutton').innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
        var authtoken = document.getElementById('authtoken').value
        if (authtoken == '') { return; }
        var data = await fetch(document.location.origin + '/Aanpassen?auth=' + authtoken + '&date=' + date, { credentials: 'same-origin' })
        document.getElementById('datapickerbutton').disabled = false;
        document.getElementById('datapickerbutton').innerHTML = 'Ophalen'
        if (data.status != 200) { return; }
        var json = await data.json();
        document.getElementById('datelist').style.display = 'block';
        document.getElementById('datelist').innerHTML = ''
        await json.Items.forEach(element => {
            //<button type="button" class="list-group-item list-group-item-action">A disabled button item</button>
            const button = document.createElement('button');
            button.id = 'magister@' + element.Id;
            button.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
            if (element.Id == id) { button.className += ' active' }
            button.innerHTML = `${element.LesuurVan ?? '?'}. ${element.Omschrijving}`
            try {
                var data = JSON.parse(atob(decodeURIComponent(element.Aantekening.replaceAll('%3D', '='))));
                if (data.InfoType == '') { data.InfoType = null }
                if (data.Status == '') { data.Status = null }
                if (data.Lokatie == '') { data.Lokatie = null }
                if (data.Inhoud == '') { data.Inhoud = null }
                element.InfoType = data.InfoType ?? element.InfoType
                element.Status = data.Status ?? element.Status
            } catch (e) { }
            button.setAttribute('magisterId', element.Id ?? null);
            button.setAttribute('magisterLokatie', element.Lokatie);
            if (element.Aantekening) button.setAttribute('magisterAantekening', element.Aantekening.replaceAll('%3D', '='));
            button.setAttribute('magisterInfoType', element.InfoType);
            button.setAttribute('magisterStatus', element.Status);
            button.setAttribute('magisterInhoud', element.Inhoud);
            button.setAttribute('onClick', `SelectDate(${element.Id})`);
            if (element.Status == 4 || element.Status == 5) { button.className += ' list-group-item-danger' }
            if (element.InfoType == 1 || element.InfoType == 7) { button.innerHTML += '<span class="badge bg-primary rounded-pill">Huiswerk</span>' }
            if (element.InfoType >= 2 && element.InfoType <= 5) { button.innerHTML += '<span class="badge bg-primary rounded-pill">Toets</span>' }
            document.getElementById('datelist').appendChild(button);
        });
        resolve(id)
    });
    return end;
}
function getNumberOfWeek(today) {
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
function SelectDate(id) {
    document.getElementById('EvenementID').disabled = false;
    var childerenofdatelist = document.getElementById('datelist').children
    for (let child of childerenofdatelist) { child.className = child.className.replaceAll(' active', '') }
    var element = document.getElementById('magister@' + id);
    document.getElementById('Inhoud').innerHTML = ''
    document.getElementById('EvenementID').value = id
    element.className += ' active'
    try {
        var data = JSON.parse(atob(decodeURIComponent(element.getAttribute('magisterAantekening'))));
        document.getElementById('InfoType').value = data.InfoType ?? ''
        document.getElementById('Status').value = data.Status ?? ''
        document.getElementById('Lokatie').value = data.Lokatie ?? ''
        document.getElementById('Inhoud').innerHTML = data.Inhoud.replaceAll(/&nbsp;/g, ' ').replace(/\n$/, '') ?? '';
    } catch (e) {
        document.getElementById('InfoType').value = element.getAttribute('magisterInfoType') ?? ''
        document.getElementById('Status').value = element.getAttribute('magisterStatus') ?? ''
        document.getElementById('Lokatie').value = element.getAttribute('magisterLokatie') ?? ''
        if (element.getAttribute('magisterInhoud') != 'null') document.getElementById('Inhoud').innerHTML = element.getAttribute('magisterInhoud').replaceAll(/&nbsp;/g, ' ').replace(/\n$/, '') ?? '';
    }
}