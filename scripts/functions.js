const axios = require('axios');
const NodeRSA = require('node-rsa');
var icalToolkit = require('ical-toolkit');
var addWeeks = require('date-fns/addWeeks');
var addDays = require('date-fns/addDays');
const { convert } = require('html-to-text');

const mydomain = process.env.VERCEL_URL

module.exports = async function () {
    //Gets all the events of the user.
    this.GetAfspraken = async function (AccountRes, tokenSet, querys, tenant) {
        //Set correct dates and headers + check for 'ShowUitval' option
        const first = new Date().getDate() - new Date().getDay() + (new Date().getDay() == 0 ? -6 : 1);
        const last = (first + 6);
        const extraaantalwekenterug = querys.extrawekenterug;
        const extraaantalwekenvooruit = querys.extrawekenvooruit;
        var lastday = new Date(addWeeks(new Date().setDate(last), extraaantalwekenvooruit)).toISOString().slice(0, 10);
        const unmodlastday = lastday; var lastday = new Date(addWeeks(new Date().setDate(last), extraaantalwekenvooruit + 4)).toISOString().slice(0, 10);
        const firstday = new Date(addWeeks(new Date().setDate(first), extraaantalwekenterug * -1)).toISOString().slice(0, 10);
        var opdrachten = ''
        var absenties = ''
        if (querys.ShowUitval == 'true') { var ShowUitval = '' } else { var ShowUitval = '&status=1' }
        //Get data from Magister
        var unfilteredcaldata = await this.FetchFromMagister('/api/personen/' + AccountRes.data.Persoon.Id + '/afspraken?tot=' + lastday + ShowUitval + '&van=' + firstday, tokenSet, tenant, null, null, 'get');

        if (querys.ShowOpdrachten == 'true') {
            opdrachten = await this.FetchFromMagister('/api/personen/' + AccountRes.data.Persoon.Id + '/opdrachten?skip=0&top=250&einddatum=' + lastday + '&startdatum=' + firstday, tokenSet, tenant, null, null, 'get');
        }

        if (querys.ShowAbsenties == 'true') {
            absenties = await this.FetchFromMagister('/api/personen/' + AccountRes.data.Persoon.Id + '/absenties?tot='+ lastday +'&van=' + firstday, tokenSet, tenant, null, null, 'get');
        }

        if (querys.SkipEmpty == 'true') {
            //Look at all the extra weeks and skip empty weeks
            var weeklength = []
            for (let index = 0; index < 10; index++) {
                var filtereddata = unfilteredcaldata.data.Items.filter(cal => new Date(addWeeks(new Date(firstday), index)) < new Date(cal.Start) && new Date(cal.Start) < new Date(addWeeks(addDays(new Date(firstday), 6), index)));
                weeklength.push({
                    start: new Date(addWeeks(new Date(firstday), index)),
                    end: new Date(addWeeks(addDays(new Date(firstday), 6), index)),
                    length: filtereddata.length
                })
            }
            //Search the array for empty weeks
            for (let index = 0; index < weeklength.length; index++) {
                if (weeklength[index].start >= new Date(firstday) && weeklength[index].end <= new Date(unmodlastday) && weeklength[index].length == 0) {
                    //Found an empty week, so starting the search for the next non-empty week.
                    for (let subindex = index; subindex < weeklength.length; subindex++) {
                        //Get next week that is not empty.
                        if (weeklength[subindex].length != 0) {
                            //Add number of empty weeks as extra after the first week that is not empty. 
                            unmodlastday = new Date(addWeeks(new Date(weeklength[subindex].end), subindex));
                            break;
                        }
                    }
                }
            }
        }

        for (let index = 0; index < unfilteredcaldata.data.Items.length; index++) {
            if (typeof unfilteredcaldata.data.Items[index].Aantekening != 'undefinded' && unfilteredcaldata.data.Items[index].Aantekening != "" && unfilteredcaldata.data.Items[index].Aantekening != null) {
                try {
                    var aanpassingdata = JSON.parse(atob(decodeURIComponent(unfilteredcaldata.data.Items[index].Aantekening)));
                    var calevent = unfilteredcaldata.data.Items[index];
                    var changedmessage = ''
                    if (aanpassingdata.InfoType == '') { aanpassingdata.InfoType = null }
                    if (aanpassingdata.Status == '') { aanpassingdata.Status = null }
                    if (aanpassingdata.Lokatie == '') { aanpassingdata.Lokatie = null }
                    if (aanpassingdata.Inhoud == '') { aanpassingdata.Inhoud = null }

                    //Check if the event data has not changed since the last edit.
                    if (parseInt(aanpassingdata.originalInfoType) == calevent.InfoType || aanpassingdata.InfoType == null) {calevent.InfoType = isNaN(parseInt(aanpassingdata.InfoType)) ? calevent.InfoType : parseInt(aanpassingdata.InfoType)} else {changedmessage += 'InfoType: ' + this.MagisterinfoTypeToString(aanpassingdata.InfoType) + ' --> ' + this.MagisterinfoTypeToString(calevent.InfoType) + '\n'}
                    if (parseInt(aanpassingdata.originalStatus) == calevent.Status || aanpassingdata.Status == null) {calevent.Status = isNaN(parseInt(aanpassingdata.Status)) ? calevent.Status : parseInt(aanpassingdata.Status)} else {changedmessage += 'Status: ' + this.MagisterStatusToString(aanpassingdata.Status) + ' --> ' + this.MagisterStatusToString(calevent.Status) + '\n'}
                    if (aanpassingdata.originalLokatie == calevent.Lokatie || aanpassingdata.Lokatie == null) {calevent.Lokatie = aanpassingdata.Lokatie ?? calevent.Lokatie} else {changedmessage += 'Lokatie: ' + aanpassingdata.Lokatie + ' --> ' + calevent.Lokatie + '\n'}
                    if (aanpassingdata.originalInhoud == calevent.Inhoud || aanpassingdata.Inhoud == null) {calevent.Inhoud = aanpassingdata.Inhoud ?? calevent.Inhoud ?? ''} else {changedmessage += 'Inhoud:\n' + aanpassingdata.Inhoud}
                    if (changedmessage != '') {calevent.Inhoud = calevent.Inhoud + '\nOude aangepaste informatie:\n\n' + changedmessage }  

                } catch (error) {

                }
            }
        }

        //Check if the user has the 'Toetsvooruitblik' option enabled.
        if (querys.Toetsvooruitblik == 'true') {
            var filtereddata = unfilteredcaldata.data.Items.filter(cal => cal.InfoType >= 2 && cal.InfoType <= 5 && new Date(cal.Start) > new Date(unmodlastday) || new Date(unmodlastday) > new Date(cal.Start));
            return [{ Items: filtereddata, }, opdrachten.data, absenties.data]
        } else {
            var filtereddata = unfilteredcaldata.data.Items.filter(cal => new Date(unmodlastday) > new Date(cal.Start));
            return [{ Items: filtereddata, }, opdrachten.data, absenties.data]
        }
    };

    //Creates iCal
    this.CreateICal = function (caldata, userinfo, querys, AfrondenLink) {
        //Settings for iCalendar builder.
        var builder = icalToolkit.createIcsFileBuilder();
        builder.spacers = (querys.ReadalbeCal == 'true') ? true : false; //Add space in ICS file, better human reading. Default: true
        builder.NEWLINE_CHAR = '\r\n'; //Newline char to use.
        builder.throwError = false; //If true throws errors, else returns error when you do .toString() to generate the file contents.
        builder.ignoreTZIDMismatch = true; //If TZID is invalid, ignore or not to ignore!
        builder.calname = userinfo.Persoon.Roepnaam + '\'s School Rooster';
        builder.timezone = 'europe/amsterdam';
        builder.tzid = 'europe/amsterdam';
        builder.method = 'PUBLISH';
        builder.additionalTags = { 'REFRESH-INTERVAL': 'PT10M' };

        //Add every event from Magister to an iCalendar file.
        caldata[0].Items.forEach(calevent => {
            //Used functions
            function GetAb(id) {return caldata[2].Items.filter(function(data) {return data.AfspraakId == id})}
            function inRange(x, min, max) {return ((x-min)*(x-max) <= 0);}

            //Checking for querys
            if (querys.ShowAfgerond == 'false' && calevent.Afgerond == true) {return;}
            if (querys.ShowEvents == 'false' && !inRange(calevent.InfoType, 1 ,5)) {return;}
            if (querys.ShowToetsen == 'false' && inRange(calevent.InfoType, 2 ,5)) {return;}
            if (querys.ShowHuiswerk == 'false' && calevent.InfoType == 1) {return;}
            if (calevent.Vakken.length == 0) { calevent.Vakken.push({"Naam": calevent.Omschrijving.split(" - ")[0]}); }
            
            //Settings default var's 
            var Status = 'CONFIRMED';
            var impinfo = '';
            var locatie = 'in ' + calevent.Lokatie + '.'
            var kortlocatie = calevent.Lokatie
            var informatie = '';
            var aanpassinglink = ''
            var algemaakteaanpassing = ''
            var reminders = [30]

            //Checking if event has custom set var's 
            if (typeof calevent.Aantekening != 'undefinded' && calevent.Aantekening != "" && calevent.Aantekening != null) {
                var algemaakteaanpassing = (calevent.Aantekening.length > 3500) ? "&toolonggetdataonload=true" : '&Aanpasing=' + calevent.Aantekening;
            } else if (querys.ShowPersonalChanges == 'true') {
                //if no Custom has been set preset the original ones for the frontend.
                var algemaakteaanpassing = '&Aanpasing=' + 
                encodeURIComponent(Buffer.from(JSON.stringify({
                    Status: calevent.Status,
                    InfoType: calevent.InfoType,  
                    Lokatie: calevent.Lokatie, 
                    Inhoud: calevent.Inhoud
                })).toString('base64'));
                if (algemaakteaanpassing.length > 3500) {algemaakteaanpassing = "&toolonggetdataonload=true"}
            }

            //Verious diffrent checks for title and description
            if (querys.ShowAbsenties == 'true' && caldata[2] != '' && GetAb(calevent.Id).length > 0) {try{impinfo += GetAb(calevent.Id)[0].Code + ' - ' + GetAb(calevent.Id)[0].Omschrijving + '\n'}catch {}}
            if (!querys.summaryname) { var titleorder = '${Vaknaam}' } else { var titleorder = atob(querys.summaryname) }
            if (typeof atob(querys.Herinneringen) !== 'undefined' && atob(querys.Herinneringen).split(',').length > 0 && !isNaN(atob(querys.Herinneringen).split(',')[0])) { if (atob(querys.Herinneringen).split(',')[0] != '') {reminders = atob(querys.Herinneringen).split(',')} else {reminders = []} }
            if (calevent.IsOnlineDeelname == true) { kortlocatie = 'Online'; locatie = 'op het internet.' } else if (calevent.Lokatie == "") { kortlocatie = '???'; var locatie = "in ???." } else if (calevent.Lokalen.length > 0) {locatie = "in " + calevent.Lokalen.map(u => u.Naam).join(', ').replace(/, ([^,]*)$/, ' en $1') + "."}
            if (calevent.Docenten.length == 0) { calevent.Docenten.push({ "Naam": '???', "Docentcode": '???' }) }
            if (calevent.Status == 4 || calevent.Status == 5) { if (querys.ShowUitvalMetcancelled == 'true') { Status = 'CANCELLED' } impinfo += 'Vervallen - '; }
            if (AfrondenLink == true) { var link = 'https://'+mydomain+'/Afronden?auth=' + querys.auth + '&frontend=true&evId=' + calevent.Id } else { var link = '' }
            if (querys.ShowPersonalChanges == 'true') {aanpassinglink = '<a href="https://'+mydomain+'/Aanpassen?datum='+ new Date(calevent.Start).toISOString().slice(0, 10) +'&auth='+ querys.auth + '&frontend=true&evId=' + calevent.Id + algemaakteaanpassing + '">Aanpassen</a> - '}
            switch (calevent.InfoType) {
                case 2: impinfo += 'Proefwerk - '; break;
                case 3: impinfo += 'Tentamen - '; break;
                case 4: impinfo += 'SO - '; break;
                case 5: impinfo += 'MO - '; break;
            }

            //Replacing event title with custom one if configured
            var title = titleorder.replaceAll('${Vaknaam}', calevent.Vakken[0].Naam.charAt(0).toUpperCase() + calevent.Vakken[0].Naam.slice(1))
                .replaceAll('${Locatie}', kortlocatie)
                .replaceAll('${Docent}', calevent.Docenten.map(u => u.Naam).join(', ').replace(/, ([^,]*)$/, ' and $1'))
                .replaceAll('${DocentKort}', calevent.Docenten[0].Docentcode)
                .replaceAll('${LesNummer}', calevent.LesuurVan)
                .replaceAll('${RoepNaam}', userinfo.Persoon.Roepnaam)
                .replaceAll('${Informatie}', impinfo.replace(/\n/g, " - ").replace(/ - ([^ - ]*)$/, '$1'))
                .replaceAll('${KlasNaam}', calevent.Omschrijving.split(" - ")[calevent.Omschrijving.split(" - ").length -1])
                .replaceAll('${isAfgerond}', calevent.Afgerond);

            //Checking if desc whoud be in HTML format or in plain text
            if (querys.InHTMLFormaat == 'true') {
                if (calevent.Inhoud != null && AfrondenLink == true) {
                    var AfrondenButtontext = (calevent.Afgerond == false) ? 'Afronden' : 'Ongedaan maken'
                    informatie = '<a href="' + link + '">' + AfrondenButtontext + '</a> - '+aanpassinglink+'<b>Informatie:</b><br><br>' + calevent.Inhoud.replaceAll(/\n/g, "<br>");
                } else if (calevent.Inhoud != null) {
                    informatie = aanpassinglink + '<b>Informatie:</b><br><br>' + calevent.Inhoud.replaceAll(/\n/g, "<br>");
                } else {informatie = aanpassinglink.slice(0, -3);}
                var desc = impinfo.replaceAll(/\n/g, '<br>') + calevent.Vakken.map(u => u.Naam.charAt(0).toUpperCase() + u.Naam.slice(1)).join(', ').replace(/, ([^,]*)$/, ' and $1') + ' van ' + calevent.Docenten.map(u => u.Naam + " (" + u.Docentcode + ")").join(', ').replace(/, ([^,]*)$/, ' en $1')+ " " + locatie + '<br>' + informatie;
            } else {
                if (calevent.Inhoud != null) { informatie = "\nInformatie:\n\n" + convert(calevent.Inhoud, { hideLinkHrefIfSameAsText: true, singleNewLineParagraphs: [{ selector: 'p', options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } }]}) } else { informatie = '' };
                var desc = impinfo + calevent.Vakken.map(u => u.Naam.charAt(0).toUpperCase() + u.Naam.slice(1)).join(', ').replace(/, ([^,]*)$/, ' and $1') + ' van ' + calevent.Docenten.map(u => u.Naam + " (" + u.Docentcode + ")").join(', ').replace(/, ([^,]*)$/, ' en $1')+ " " + locatie + informatie;
            }

            //Creating iCalendar file
            builder.events.push({
                start: new Date(calevent.Start),
                end: new Date(calevent.Einde),
                transp: 'OPAQUE',
                summary: title,
                alarms: reminders,

                //Optional: If you need to add some of your own tags
                additionalTags: {
                    'ORGANIZER': '',
                    'X-COLOR': 'red',
                    'X-MGSTATUS': calevent.Status,
                    'X-MGINFOTYPE': calevent.InfoType,
                    'X-MGDONE': calevent.Afgerond,
                    'X-MGLESUURNUMMER': calevent.LesuurVan,
                    'X-MGONLINE': calevent.IsOnlineDeelname
                },
                uid: calevent.Id + "@mg",
                allDay: calevent.DuurtHeleDag,
                location: calevent.Lokatie,
                description: desc,
                method: 'PUBLISH',
                status: Status,
                url: 'https://'+mydomain+'/'
            });
        });

        //Add Oprachten to iCalendar file.
        if (querys.ShowOpdrachten == 'true' && caldata[1] != '') {
                caldata[1].Items.forEach(opdracht => {
                    var extradesc = ''
                    //Check if extra information has been given for the assignment
                    if (opdracht.Omschrijving != '') {
                        extradesc = (querys.InHTMLFormaat == 'true') ? '<b>Informatie:</b><br><br>' + opdracht.Omschrijving : '\nInformatie:\n\n' + convert(opdracht.Omschrijving, { hideLinkHrefIfSameAsText: true, singleNewLineParagraphs: [{ selector: 'p', options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } }]})
                    }
                    //Check if user has finished the assignment
                    var desc = (opdracht.IngeleverdOp != null) ? 'Opdracht \'' + opdracht.Titel + '\' is ingeleverd op ' + (new Date(opdracht.IngeleverdOp).toLocaleString('en-NL', { timeZone: 'Europe/Amsterdam' })) + '.' + extradesc : 'Opdracht \'' + opdracht.Titel + '\' moet worden ingeleverd voor ' + (new Date(opdracht.InleverenVoor).toLocaleString('en-NL', { timeZone: 'Europe/Amsterdam' })) + '.' + extradesc
                    //Add Opdrachten
                    builder.events.push({
                        start: new Date(opdracht.InleverenVoor),
                        end: new Date(new Date(opdracht.InleverenVoor) + (1000 * 60 * 60)),
                        transp: 'OPAQUE',
                        summary: 'Inleverdatum opdracht \'' + opdracht.Titel + '\'',
                        alarms: [],
                        additionalTags: {
                            'ORGANIZER': '',
                            'X-MGDONE': opdracht.Afgesloten,
                            'X-MGOPDRACHT': true
                        },
                        uid: opdracht.Id + "@mgo",
                        allDay: true,
                        description: desc,
                        method: 'PUBLISH',
                        status: 'CONFIRMED',
                        url: 'https://'+mydomain+'/'
                    });
            })
        }
        var icsFileContent = builder.toString().replaceAll('END:VALARM', 'DESCRIPTION:\nEND:VALARM').replace(/([^\r\n]{70})/g, '$1\r\n ').replaceAll(/(\r\n|\r|\n)/g, "\r\n")

        if (icsFileContent instanceof Error) { console.log('Returned Error'); }
        return icsFileContent;
    };

    this.Afronden = async function (tokenSet, AccountRes, iD, tenant) {
        var changeevent = await this.FetchFromMagister('/api/personen/' + AccountRes.data.Persoon.Id + '/afspraken/' + iD, tokenSet, tenant, null, null, 'get');
        changeevent.data.Afgerond = !changeevent.data.Afgerond;
        
        return await this.FetchFromMagister('/api/personen/' + AccountRes.data.Persoon.Id + '/afspraken/' + iD, tokenSet, tenant, JSON.stringify(changeevent.data), null, 'put');
    };

    this.Aanpassen = async function (tokenSet, AccountRes, iD, tenant, querys) {
        var changeevent = await this.FetchFromMagister('/api/personen/' + AccountRes.data.Persoon.Id + '/afspraken/' + iD, tokenSet, tenant, null, null, 'get');
        var aanpassingdata = await JSON.parse(atob(decodeURIComponent(querys.Aanpasing)));
        if (aanpassingdata.Status == changeevent.data.Status) {aanpassingdata.Status = null}
        if (aanpassingdata.InfoType == changeevent.data.InfoType) {aanpassingdata.InfoType = null}
        if (aanpassingdata.Lokatie == changeevent.data.Lokatie) {aanpassingdata.Lokatie = null}
        if (aanpassingdata.Inhoud == changeevent.data.Inhoud) {aanpassingdata.Inhoud = null}
        aanpassingdata.originalInfoType = changeevent.data.InfoType;
        aanpassingdata.originalStatus = changeevent.data.Status;
        aanpassingdata.originalLokatie = changeevent.data.Lokatie;
        aanpassingdata.originalInhoud = changeevent.data.Inhoud;
        return await this.FetchFromMagister('/api/personen/' + AccountRes.data.Persoon.Id + '/afspraken/' + iD, tokenSet, tenant, JSON.stringify({ "Id": iD, "Aantekening": encodeURIComponent(Buffer.from(JSON.stringify(aanpassingdata)).toString('base64')) }), null, 'put');
    };

    this.CheckandSendMail = async function (authtoken, getemail) {
        return new Promise(async resolve => {
        if (getemail != true) {resolve(); return;}
        var reqstatus = await axios('https://magisterasync.fly.dev?auth=' + authtoken);
        if (reqstatus.data = 'Working on it!') {resolve()}
        })
    };

    this.AanpassingGetToday = async function (AccountRes, tokenSet, tenant, date) {
        var date1 = new Date(date).toISOString().slice(0, 10);
        return await this.FetchFromMagister(`/api/personen/${AccountRes.data.Persoon.Id}/afspraken?tot=${date1}&van=${date1}`, tokenSet, tenant, null, null, 'get');
    };

    this.decrypt = function (message) {
        const privateKey = process.env.privateKey;

        const key = new NodeRSA(privateKey, { b: 4096 });
        key.setOptions({ encryptionScheme: 'pkcs1' })
        return key.decrypt(message, 'utf8');
    };
    this.encrypt = function () {
        return `async function encrypt(message) {
            var encrypt = new JSEncrypt();
            encrypt.setPublicKey(\`${process.env.publicKey}\`);
            return btoa(encrypt.encrypt(message));
        }`
    }
}