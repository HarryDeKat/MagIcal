module.exports = async function () {
    this.AfrondenHTML = function (querys) {return`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-dark-5@1.1.3/dist/css/bootstrap-dark.min.css" rel="stylesheet">
        <title>Magister naar iCalender</title>
    </head>
    <body id="body">
    <div style="position: absolute;top:50%;left:50%;transform:translate(-50%, -50%);display: flex;flex-direction: column;" id="lottieplayerparent"><lottie-player src="https://assets1.lottiefiles.com/packages/lf20_b88nh30c.json"  background="transparent"  speed="1"  style="width: 300px; height: 300px;" loop autoplay></lottie-player></div>
    </body>
    </html>
    <style>
        body {
          background-color: white;
        }
        @media (prefers-color-scheme: dark) {
          body {
          background-color: black;
        }
        }
    </style>
    <script>
    function Finish() {
      document.getElementById('lottieplayerparent').innerHTML = '<lottie-player src="https://assets1.lottiefiles.com/packages/lf20_b88nh30c.json"  background="transparent"  speed="1"  style="width: 300px; height: 300px;" loop autoplay></lottie-player>'
    fetch(document.location.origin + '/Afronden?auth=`+querys.auth+`&evId=`+querys.evId+`', {
      credentials: 'same-origin'
    }).then(function (data) {
      if (data.status == 200 || data.status == 202) {
        document.getElementById('lottieplayerparent').innerHTML = '<lottie-player src="https://assets2.lottiefiles.com/packages/lf20_f9e9tqcx.json"  background="transparent"  speed="1"  style="width: 300px; height: 300px;" autoplay></lottie-player>'
        console.log(data.status);
      } else {
        document.getElementById('lottieplayerparent').innerHTML = '<lottie-player src="https://assets2.lottiefiles.com/packages/lf20_e1pmabgl.json"  background="transparent"  speed="1"  style="width: 300px; height: 300px;" autoplay></lottie-player><button onclick="Finish()" class="btn btn-primary">Retry</button>'
        console.log(data.status);
      }
    });
    }
    Finish();
    </script>`;
    };

    this.ErrorMessage = function (message, detailedmessage = "") {return`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
        <title>Magister naar iCalender - `+message+`</title>
    </head>
    <body>
    <div style="text-align: -webkit-center;position: absolute;top:50%;left:50%;transform:translate(-50%, -50%);" id="lottieplayerparent">
      <lottie-player src="https://assets2.lottiefiles.com/packages/lf20_e1pmabgl.json"  background="transparent"  speed="1"  style="width: 300px; height: 300px;" loop autoplay></lottie-player>
      <h2>`+message+`</h2>
      ${detailedmessage != "" ? "<samp>" + detailedmessage + "</samp>" : ""}
      </div>
    </body>
    </html>
    <style>
        body {
          background-color: white;
        }
        h2 {
            text-align: center;
            font-family: 'system-ui';
            color: black;
        }
        @media (prefers-color-scheme: dark) {
          body {
          background-color: black;
          }
          h2 {
            color: white;
          }
        }
    </style>`;
    };
}