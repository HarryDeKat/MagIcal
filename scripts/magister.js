const { AuthManager } = require('magister-openid');
const axios = require('axios');

module.exports = async function () {

    this.GetBearer = async function (username, password, tenant) {
        return new Promise(async function (resolve, reject) {
            const manager = new AuthManager(tenant);
            const authcode = await this.GetAuthCode().catch((e) => { reject(Error("An error occurred while getting authcode.")); }); //500
            const tokens = await manager.login(username, password, authcode).catch((e) => { reject(Error("An error occurred while logging in.")); }); //401
            resolve(tokens);
          });
    };

    this.GetAuthCode = async function () {
        //Thanks Netfloex! https://github.com/Argo-Client/Web-Archived/blob/d5fb44d8b526963ea2b54c1f603986f4323e6994/src/magister/getAuthCode.ts
        var accountJsUrl;
        var authcode;
        const jsURL = async () => {
            var returnUrl = encodeURIComponent("/connect/authorize/callback?client_id=iam-profile&redirect_uri=https://accounts.magister.net/&response_type=id_token token&scope=openid profile email magister.iam.profile&state=a&nonce=a");
            var url = `https://accounts.magister.net/account/login?returnUrl=${returnUrl}`;
            var res = await axios(url);

            var html = await res.data;
            return "https://accounts.magister.net/" + html.match(/js\/account-.*\.js/)[0];
        };
        const authCodeFromUrl = async (url) => {
            var res = await axios(url);
            if (res.status === 200) {
                var js = await res.data;
                var tokens = JSON.parse(js.match(/\["[\d\w]*","[\d\w]*","[\d\w]*","[\d\w]*"\]/gm).reverse()[0]);
                var which = JSON.parse(js.match(/\["\d","\d"\]/));
                return which.map(g => tokens[parseInt(g)]).join("");
            }
            throw new Error(`res.status != 200, status: ${res.status}`);
        };
        var newUrl = await jsURL();
        if (authcode && newUrl == accountJsUrl) {
            return authcode;
        }
        accountJsUrl = newUrl;
        authcode = await authCodeFromUrl(newUrl);
        return authcode;
    };

    //Used to get information about the user
    this.GetUserDetails = async function (tokenSet, tenant) {
        return await this.FetchFromMagister('/api/account', tokenSet, tenant, null, null, 'get');
    };

    //Gets data from Magister API
    this.FetchFromMagister = async function (path, MagisterTokens, tenant, data, body, method) {
        var headers = {
            "authorization": "Bearer " + MagisterTokens.access_token,
        }
        if (method == 'put') {
            headers["content-type"] = "application/json;charset=UTF-8"
        }
        return await axios({
            method: method,
            url: 'https://' + tenant + path,
            headers: headers,
            referrer: "https://" + tenant + "/magister",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: body,
            data: data,
            mode: 'cors',
            withCredentials: true,
        })
    };

    this.MagisterinfoTypeToString = function (InfoType) {
        switch (parseInt(InfoType)) {
            case 0:  return 'Geen'
            case 1:  return 'Huiswerk'
            case 2:  return 'Proefwerk'
            case 3:  return 'Tentamen'
            case 4:  return 'Schriftelijke overhoring'
            case 5:  return 'Mondelinge overhoring'
            case 6:  return 'Informatie'
            case 7:  return 'Aantekening'
            default: return 'Geen'
        }
    };

    this.MagisterStatusToString = function (Status) {
        switch (parseInt(Status)) {
            case 0:  return 'Geen status'
            case 1:  return 'Geroosterd automatisch' 
            case 2:  return 'Geroosterd handmatig'
            case 3:  return 'Gewijzigd'
            case 4:  return 'Vervallen handmatig'
            case 5:  return 'Vervallen automatisch'
            case 6:  return 'In gebruik' 
            case 7:  return 'Afgesloten'
            case 8:  return 'Ingezet'
            case 9:  return 'Verplaatst'
            case 10: return 'Gewijzigd en verplaatst'
            default: return 'Geen status'
        }
    };
}