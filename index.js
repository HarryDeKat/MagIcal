require('./scripts/functions.js')();
require('./scripts/dynamicpages.js')();
require('./scripts/magister.js')();
const express = require('express')
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

//Load main config page.
app.get('/', (req, res) => {res.sendFile(path.join(__dirname, 'web/homepage.html'))})

//Load EULA
app.get('/eula', (req, res) => {res.sendFile(path.join(__dirname, 'web/eula.html'))})

//Load EULA
app.get('/publickey.js', (req, res) => {res.send(encrypt())})

//Load favicon.
app.use(express.static(path.join(__dirname, 'web/assets')));

app.get('/ical', async (req, res) => {
  try {
    if (!req.query || !req.query.auth || !req.query.extrawekenvooruit || !req.query.extrawekenterug)
      return res.send(ErrorMessage("incorrect query's"))

    //Getting Data 
    const auth = JSON.parse(decrypt(atob(req.query.auth)));
    const Bearer = await GetBearer(auth.username, auth.password, auth.tenant).catch((e) => { res.status(401).send(ErrorMessage("Inloggen mislukt. Controleer of je de juiste inloggegevens hebt ingevuld.", e)) });
    const AccountRes = await GetUserDetails(Bearer, auth.tenant);
    const Afspraken = await GetAfspraken(AccountRes, Bearer, req.query, auth.tenant);
    const waitformail = await CheckandSendMail(req.query.auth, auth.getemail).catch((e) => { })

    //Sending Data
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/calendar");
    res.setHeader("Content-Disposition", "attachment; filename=" + AccountRes.data.Persoon.Roepnaam + "'s Magister Kalender.ics");
    await waitformail;
    res.send(CreateICal(Afspraken, AccountRes.data, req.query, auth.AfrondenLink));
  } catch (e) {
    console.log(e)
    if (!res.headersSent) { res.status(500).send(ErrorMessage("An error occurred", e)) };
  }
})

app.get('/Aanpassen', async (req, res) => {
  try {
    if (req.query && req.query.auth && !req.query.frontend && (JSON.parse(decrypt(atob(req.query.auth)))).ShowAanpassing == true) {
      var auth = JSON.parse(decrypt(atob(req.query.auth)))
      const Bearer = await GetBearer(auth.username, auth.password, auth.tenant).catch((e) => { res.status(401).send(ErrorMessage("An error occurred"), e) });
      if (req.query.date) {
        var AccountRes = await GetUserDetails(Bearer, auth.tenant);
        res.send((await AanpassingGetToday(AccountRes, Bearer, auth.tenant, req.query.date)).data);
      } else if (req.query.Aanpasing && req.query.evId) {
        var AccountRes = await GetUserDetails(Bearer, auth.tenant);
        await Aanpassen(Bearer, AccountRes, req.query.evId, auth.tenant, req.query).then(function () { res.sendFile(path.join(__dirname, 'web/confirmation.html')) });
      } else {
        res.sendFile(path.join(__dirname, 'web/personal-changes.html'));
      }
    } else {
      res.sendFile(path.join(__dirname, 'web/personal-changes.html'));
    }
  } catch (e) { res.send(ErrorMessage("An error occurred"), e) }
});

app.get('/Afronden', async (req, res) => {
  try {
    if (req.query && req.query.auth && !req.query.frontend && req.query.evId) {
      var auth = JSON.parse(decrypt(atob(req.query.auth)))
      const Bearer = await GetBearer(auth.username, auth.password, auth.tenant).catch((e) => { res.status(401).send(ErrorMessage("An error occurred"), e) });
      var AccountRes = await GetUserDetails(Bearer, auth.tenant);
      await Afronden(Bearer, AccountRes, req.query.evId, auth.tenant);
      res.sendFile(path.join(__dirname, 'web/confirmation.html'));
    } else if (req.query && req.query.auth && req.query.evId) {
      res.send(AfrondenHTML(req.query));
    } else {
      res.status(500).send(ErrorMessage("incorrect query's"))
    }
  } catch (e) { res.status(500).send(ErrorMessage("An error occurred"), e) }
});

app.use(function(req,res){
  res.status(404).send(ErrorMessage('404: Page not found. <a href="/">Go home?</a>'));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}\nhttp://localhost:${port}/`)
})