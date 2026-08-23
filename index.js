require('./scripts/functions.js')();
require('./scripts/dynamicpages.js')();
require('./scripts/magister.js')();
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3005;

// Helper to resolve authentication from API Key or legacy credentials
async function resolveAuth(req) {
  let Bearer = null;
  let auth = {};
  let tenant = req.query.tenant || '';
  const defaultGateway = process.env.GATEWAY_URL || 'https://discipulus.harrydekat.dev';
  const gatewayUrl = req.query.gateway || defaultGateway;

  // 1. Direct query parameter (?key=mag_sk_... or ?apiKey=mag_sk_...)
  const directKey = req.query.key || req.query.apiKey;
  if (directKey && typeof directKey === 'string' && directKey.startsWith('mag_sk_')) {
    Bearer = GetBearerFromKey(directKey, gatewayUrl);
    return { Bearer, auth: { key: directKey, gateway: gatewayUrl }, tenant };
  }

  // 2. Auth query parameter (RSA encrypted or base64 JSON)
  if (req.query.auth) {
    try {
      const decrypted = decrypt(atob(req.query.auth));
      auth = JSON.parse(decrypted);
    } catch (e) {
      try {
        auth = JSON.parse(atob(req.query.auth));
      } catch (err) {
        auth = {};
      }
    }

    if (auth.key || auth.apiKey) {
      const key = auth.key || auth.apiKey;
      Bearer = GetBearerFromKey(key, auth.gateway || gatewayUrl);
      return { Bearer, auth, tenant: auth.tenant || tenant };
    }

    if (auth.username && auth.password) {
      tenant = auth.tenant || tenant;
      Bearer = await GetBearer(auth.username, auth.password, tenant);
      return { Bearer, auth, tenant };
    }
  }

  return { Bearer: null, auth: {}, tenant };
}

// Load main config page.
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'web/homepage.html')); });

// Load EULA
app.get('/eula', (req, res) => { res.sendFile(path.join(__dirname, 'web/eula.html')); });

// Load public key for RSA encryption
app.get('/publickey.js', (req, res) => { res.send(encrypt()); });

// Load favicon and static assets.
app.use(express.static(path.join(__dirname, 'web/assets')));

app.get('/ical', async (req, res) => {
  try {
    if (!req.query || (!req.query.auth && !req.query.key && !req.query.apiKey) || !req.query.extrawekenvooruit || !req.query.extrawekenterug) {
      return res.send(ErrorMessage("incorrect query's"));
    }

    const { Bearer, auth, tenant } = await resolveAuth(req).catch((e) => {
      res.status(401).send(ErrorMessage('Inloggen mislukt. Controleer of je de juiste API key of inloggegevens hebt ingevuld.', e));
      return { Bearer: null, auth: {}, tenant: '' };
    });

    if (!Bearer) {
      if (!res.headersSent) {
        res.status(401).send(ErrorMessage('Geen geldige Magister API Key of inloggegevens opgegeven.'));
      }
      return;
    }

    const AccountRes = await GetUserDetails(Bearer, tenant);
    const Afspraken = await GetAfspraken(AccountRes, Bearer, req.query, tenant);
    const waitformail = (auth && auth.getemail) ? CheckandSendMail(req.query.auth, auth.getemail).catch(() => {}) : Promise.resolve();

    // Sending Data
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/calendar');
    const studentName = AccountRes?.data?.Persoon?.Roepnaam || 'Magister';
    res.setHeader('Content-Disposition', "attachment; filename=" + encodeURIComponent(studentName) + "'s Magister Kalender.ics");
    await waitformail;
    res.send(CreateICal(Afspraken, AccountRes.data, req.query, auth.AfrondenLink));
  } catch (e) {
    console.log(e);
    if (!res.headersSent) {
      res.status(500).send(ErrorMessage('An error occurred', e));
    }
  }
});

app.get('/Aanpassen', async (req, res) => {
  try {
    const { Bearer, auth, tenant } = await resolveAuth(req).catch((e) => {
      res.status(401).send(ErrorMessage('An error occurred', e));
      return { Bearer: null, auth: {}, tenant: '' };
    });

    if (Bearer && !req.query.frontend && auth.ShowAanpassing == true) {
      if (req.query.date) {
        const AccountRes = await GetUserDetails(Bearer, tenant);
        res.send((await AanpassingGetToday(AccountRes, Bearer, tenant, req.query.date)).data);
      } else if (req.query.Aanpasing && req.query.evId) {
        const AccountRes = await GetUserDetails(Bearer, tenant);
        await Aanpassen(Bearer, AccountRes, req.query.evId, tenant, req.query).then(() => {
          res.sendFile(path.join(__dirname, 'web/confirmation.html'));
        });
      } else {
        res.sendFile(path.join(__dirname, 'web/personal-changes.html'));
      }
    } else {
      res.sendFile(path.join(__dirname, 'web/personal-changes.html'));
    }
  } catch (e) {
    res.send(ErrorMessage('An error occurred', e));
  }
});

app.get('/Afronden', async (req, res) => {
  try {
    const { Bearer, auth, tenant } = await resolveAuth(req).catch((e) => {
      res.status(401).send(ErrorMessage('An error occurred', e));
      return { Bearer: null, auth: {}, tenant: '' };
    });

    if (Bearer && !req.query.frontend && req.query.evId) {
      const AccountRes = await GetUserDetails(Bearer, tenant);
      await Afronden(Bearer, AccountRes, req.query.evId, tenant);
      res.sendFile(path.join(__dirname, 'web/confirmation.html'));
    } else if (req.query && req.query.evId) {
      res.send(AfrondenHTML(req.query));
    } else {
      res.status(500).send(ErrorMessage("incorrect query's"));
    }
  } catch (e) {
    res.status(500).send(ErrorMessage('An error occurred', e));
  }
});

app.use(function (req, res) {
  res.status(404).send(ErrorMessage('404: Page not found. <a href="/">Go home?</a>'));
});

app.listen(port, () => {
  console.log(`MagIcal app listening on port ${port}\nhttp://localhost:${port}/`);
});
