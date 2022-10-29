module.exports = async function () {
    this.AfrondenHTML = function (querys) {return`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
        <title>Magister naar iCalender</title>
    </head>
    <body>
    <div style="position: absolute;top:50%;left:50%;transform:translate(-50%, -50%);" id="lottieplayerparent"><lottie-player src="https://assets1.lottiefiles.com/packages/lf20_b88nh30c.json"  background="transparent"  speed="1"  style="width: 300px; height: 300px;" loop autoplay></lottie-player></div>
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
    fetch(document.location.origin + '/Afronden?auth=`+querys.auth+`&evId=`+querys.evId+`', {
        credentials: 'same-origin'
      }).then(function (data) {
        document.getElementById('lottieplayerparent').innerHTML = '<lottie-player src="https://assets2.lottiefiles.com/packages/lf20_f9e9tqcx.json"  background="transparent"  speed="1"  style="width: 300px; height: 300px;" autoplay></lottie-player>'
        console.log(data.status);
      });
    </script>`;
    };

    this.ErrorMessage = function (message) {return`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
        <title>Magister naar iCalender - `+message+`</title>
    </head>
    <body>
    <div style="text-align: -webkit-center;position: absolute;top:50%;left:50%;transform:translate(-50%, -50%);" id="lottieplayerparent"><lottie-player src="https://assets2.lottiefiles.com/packages/lf20_e1pmabgl.json"  background="transparent"  speed="1"  style="width: 300px; height: 300px;" loop autoplay></lottie-player><h2>`+message+`</h2></div>
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