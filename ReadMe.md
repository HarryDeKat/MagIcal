[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FHarryDeKat%2FMagIcal&env=privateKey,publicKey&envDescription=Deze%20zijn%20keys%20zijn%20nodig%20om%20je%20Magister%20inlog%20gegevens%20veilig%20op%20te%20slaan%20zonder%20dat%20iemand%20anders%20kan%20zien%20wat%20je%20wachtwoord%20is.%20Meer%20informatie%20over%20hoe%20je%20deze%20kan%20genereren%20is%20hiernaast%20of%20in%20de%20readme%20te%20vinden.&envLink=https%3A%2F%2Fgithub.com%2FHarryDeKat%2FMagIcal%23readme&project-name=magical&repository-name=MagIcal&demo-title=Magister%20%E2%86%92%20iCalendar&demo-description=Zet%20je%20Magister%20rooster%20om%20in%20een%20iCalender&demo-url=https%3A%2F%2Fmagister-naar-icalendar.vercel.app&demo-image=https%3A%2F%2Fi.imgur.com%2FcdQPHSx.png)

Dit was een van mijn eerste projecten, dus de code is niet bepaald een toonbeeld van organisatie. 😅

Belangrijke opmerkingen:

- Dit systeem werkt mogelijk niet met alle Magister accounts.
- Accounts die **niet** het standaard Magister inlogsysteem gebruiken (dus geen OAuth) worden **niet** ondersteund.
- Accounts met **tweefactorauthenticatie (2FA)** worden **niet** ondersteund.

Hoewel de code wat rommelig is, functioneert het systeem naar mijn ervaring prima. Ik heb het zelf jarenlang zonder problemen gebruikt.

## Waar haal ik die RSA-keys vandaan?
Gebruik voor de private en public key een **4096bit** RSA key. Deze keys zijn [hier](https://cryptotools.net/rsagen) te genereren.



Wat is dit?
-----------

Dit is een tool om het rooster van Magister op te halen en op te zetten in een iCalendar. Magister heeft hier ook [zelf ondersteuning voor](https://www.magister.nl/help/agenda-delen/), maar deze integratie mist veel functies en is soms niet eens beschikbaar. Met deze tool is het mogelijk om je Magister agenda net als de integratie van Magister te exporteren naar andere kalenders, maar dan met extra functies.

Welke functies kan je allemaal instellen?
-----------------------------------------

### Zichtbaarheid van verschillende evenementen

*   Laat evenementen met huiswerk zien
*   Laat evenementen met toetsen zien
*   Laat afgeronde evenementen zien
*   Laat vervallen evenementen zien
*   Laat gewone evenementen zien
*   Laat de inleverdatum van opdrachten zien
*   Laat absenties zien

### Vooruit plannen

Het is mogelijk om nog vier weken verder in het rooster te kijken, om geplande toetsen te vinden en in te plannen.

### Persoonlijke aanpassingen Beta

Het is mogelijk om persoonlijke aanpassingen te maken aan het rooster die alleen zichtbaar voor jou zijn. Dit betekent dat als een leraar huiswerk niet in Magister zet, je het zelf kan toevoegen, zodat je het niet vergeet. Dit is een functie die Magister niet uit zichzelf ondersteund, dus om aanpassingen te maken moeten de opties ‘Aanpassen link’ en ‘HTML descriptie’ aan staan. De aanpassingen worden opgeslagen als aantekening onder het aangepaste Magister evenement. Mocht het evenement later door Magister nog worden aangepast, zullen die veranderingen leiden en zal jouw persoonlijke aanpassing alleen nog maar zichtbaar zijn in de descriptie onder ‘Oude aangepaste informatie’. Uiteraard is het mogelijk om daarna jouw persoonlijke aanpassing opnieuw in te voeren.

### Afronden van huiswerk/toetsen

Het is mogelijk om huiswerk/toetsen af te ronden zodat je met een oogopslag kan zien of je klaar bent of dat je nog ergens aan moet werken. Dit is een functie die Magister uit zichzelf ondersteund, dus zal het huiswerk ook als ‘afgerond’ in magister worden genoteerd. De link om het huiswerk af te ronden zonder de Magister app te gebruiken is alleen zichtbaar wanneer de optie ‘HTML descriptie’ wordt gebruikt.

### Gepersonaliseerde evenement titel

Het is mogelijk om de titel van je evenementen te personaliseren van gewoon de naam van het vak tot een combinatie van het lesuur, locatie, lesnummer en de naam van docent. Het is ook mogelijk om de roepnaam erachter te zetten, hierdoor is het mogelijk om je eigen rooster en die van een ander uit elkaar te houden. Informatie over hoe dit is aan te passen is te vinden in ‘Gepersonaliseerde evenement titel’.

### Aangepast Google script

Hoewel gebruik hiervan niet nodig is wordt het wel aangeraden. Met [dit aangepaste script](https://script.google.com/d/1WkbpHQxsMbbFqYjrL1xKkhfaRf3gs8nsCoRewj_GEn9rTdoPc0H7xHxi/edit?usp=sharing) is het mogelijk om je Magister Agenda op te halen om een zelf gezette periode, daardoor is de kans kleiner dat je rooster wijzigingen mist. Ook voegt dit script de juiste kleuren toe voor verschillende evenementen. Blauw voor huiswerk, donkerblauw voor een toets, rood voor uitval en uiteraard groen voor een afgerond evenement.

### Magister berichten doorsturen Beta

Het is mogelijk om Magister berichten door te sturen naar je eigen email adres. Magister had hier ooit ondersteuning voor, maar heeft deze optie vervangen door een dommere versie die je alleen vertelt dat je een bericht hebt. Deze optie wordt niet aangeraden, omdat de doorgestuurde berichten worden verzonden door middel van ‘Naver’, een Koreaanse email service. Hoewel de instellingen zijn aangepast om berichten niet op te slaan op de servers van Naver is dat niet te controleren. Het is dus mogelijk dat privé berichten worden opgeslagen op servers die niet van Magister zijn. Het is niet mogelijk om hier een emailadres in te vullen om misbruik van deze functionaliteit te voorkomen, in de plaats daarvan wordt het ingevulde emailadres uit Magister gebruikt. Ook wordt het Magister bericht als 'Gelezen' gemarkeerd in Magister, zodat er geen dubbele e-mails worden verzonden.

### Herinneringen

Het is mogelijk om een of meer herinneringen in te stellen zodat je geen lessen mist. Herinneringen kunnen worden aangepast onder ‘Geavanceerde opties’.

FAQ
---

### Wat is een ‘auth token’?

De ‘auth token’ wordt gemaakt door deze website en bevat jouw school Magister inlog gegevens. Deze informatie word met een ‘[public key](https://nl.wikipedia.org/wiki/Publieke_sleutel)’ versleuteld en kan alleen worden gelezen door middel van een ‘[private key](https://nl.wikipedia.org/wiki/Geheime_sleutel)’ die niet zichtbaar is. Hierdoor kunnen jouw Magister inloggegevens nooit uitlekken, als de link wordt uitgelekt.

### Mijn link is uitgelekt!

Geen paniek je Magister inlog gegevens zijn niet leesbaar, maar het is wel mogelijk om je rooster op te halen en als je dat had ingesteld huiswerk af te ronden of persoonlijke aanpassingen te maken. Als je liever niet hebt dat anderen dit kunnen doen, kan je er voor kiezen om je [Magister wachtwoord te veranderen.](https://www.magister.nl/wp-content/uploads/2022/06/Gebruiker-wachtwoord-zelf-herstellen.pdf)

### De link werkt niet in Google/Apple Calendar

De gegeneerde link zal hoogstwaarschijnlijk over 255 karakters zijn, dit betekent dat Google of Apple hem niet accepteert. Dit is op te lossen door of [het aangepaste Google script](https://script.google.com/d/1WkbpHQxsMbbFqYjrL1xKkhfaRf3gs8nsCoRewj_GEn9rTdoPc0H7xHxi/edit?usp=sharing) te gebruiken of door de link korter te maken met een ‘link shortening service’ zoals [Bit.ly](https://bit.ly)

### Wordt er data opgeslagen buiten de servers van Magister?

Nee, deze applicatie slaat bij normale instellingen geen gegevens op buiten de servers van Magister. Echter als de optie ‘berichten doorsturen’ aanstaat kan het zijn dat berichten buiten de servers van Magister worden opgeslagen, daardoor staat deze optie standaard uit en wordt het aangeraden deze niet aan te gebruiken. Voor meer informatie hierover zie ‘Magister berichten doorsturen’.

---

Magister naar iCalendar is niet verbonden met, of onderdeel van Iddink Group.
