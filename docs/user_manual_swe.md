## Introduktion

Detta är en användarhandledning för ordforskningsplattformen [Korp](https://spraakbanken.gu.se/korp/). Prova gärna att
besöka sidan och göra ett par testsökningar innan du läser vidare, så att du får en bild av hur gränssnittet ser ut.

Korp låter dig söka i stora mängder med textmaterial från olika källor, såsom skönlitteratur, dagstidningar,
sociala medier och myndighetstexter. Texterna har försetts med extra information, så kallad annotering. Detta har
för de flesta korpusar gjorts automatiskt, vilket betyder att annoteringen kan innehålla fel.

## Olika korpar

Materialet i Korp är uppdelat i ett antal olika "lägen". När man först kommer till Korp visas läget med nusvenskt
material, från 1900-talet och framåt.
Överst på sidan, ovanför logotypen, finns det länkar till de andra lägena, med bland annat 1800-talsmaterial och
parallella korpusar och material på andra språk. Funktionaliteten
mellan dessa olika lägen kan skilja något, och nedanstående beskrivning gäller främst det moderna materialet.

## Korpusväljaren

![Korpusväljaren i Korp](images/korpusval.png)

Till höger om Korp-logotypen finns _korpusväljaren_. Det är med hjälp av den man väljer vilka material man är intresserad
av att söka i. Korpusarna ligger sorterade i kategorier, och man väljer eller väljer bort korpusar genom att kryssa i
eller ur rutan framför varje korpusnamn.

När man klickar på den blå info-ikonen till höger om ett korpusnamnet får man även fram information om den, bland annat
dess storlek i antal token och antal meningar.

Ovanför korpusarna finns det en tidslinje med staplar, som ger en överblick över materialets fördelning över tid.
Markerade korpusar syns som blå staplar, medan ej markerade syns som grå. Allt material innehåller inte information
om tid, och därför finns det längst till höger även en röd stapel, som representerar allt odaterat material.

## Sökning

Gränssnittet i Korp är uppdelat i två huvudsakliga delar: en övre del i vilken sökningar utförs, samt en nedre del där
sökresultaten presenteras. Sökdelen är i sin tur uppdelad i tre olika versioner: _Enkel_, _Utökad_ och _Avancerad_, som
var och en låter en utföra sökningar men med olika grad av komplexitet.
Fliken _Enkel_ är den simplaste, där endast enkla sökningar på ord eller fraser går att utföra, medan _Utökad_
innehåller verktyg för att bygga ihop mer komplicerade frågor.
_Avancerad_ ger en ytterligare möjligheter men kräver att man är insatt i det frågespråk som Korp använder (CQP).

### Enkel sökning

![Enkel sökning på lemgram](images/lemgram.png)

I en enkel sökning kan man söka på antingen ett ord, flera ord, eller ett _lemgram_. Ett lemgram är ett ords eller ett flerordsuttrycks samtliga böjningsformer, och gör det
möjligt att i en och samma sökning söka efter både "katt", "katter", "katterna" och så vidare. Läs mer på [Vad är ett lemgram?](https://spraakbanken.gu.se/faq/vad-ar-ett-lemgram)

För att göra en vanlig ordsökning skriver man ordet eller orden i sökfältet och trycker på Sök-knappen eller Enter-tangenten på tangentbordet. Om man i stället för
att direkt trycka på Sök väntar lite efter att man har skrivit ett komplett ord, så kommer det upp en lista under sökfältet över lemgram i vilka det inmatade ordet är en ordform.
För att göra en lemgramsökning väljer man ett av dessa med piltangenterna samt Enter, och trycker därefter Enter igen för att utföra sökningen.

![Enkel sökning](images/enkel.png)

Under sökfältet finns ett antal kryssrutor med inställningsmöjligheter för ens sökning.

**Fri följd**

Vid sökning på fler än ett ord görs som standard en frassökning, vilket innebär att man enbart får träffar där sökorden
förekommer i exakt den ordning man angivit, och direkt efter varandra.
Genom att kryssa i rutan _i fri följd_ söks det i stället efter meningar som innehåller samtliga
sökord, i valfri ordning och inte nödvändigtvis intill varandra.

**Börjar/slutar med**

Kryssrutorna _börjar med_ och _slutar med_ utökar ens sökning till att även inkludera ord där det sökta ordet
eller orden förekommer som del av ett annat ord.

Vid vanlig ordsökning betyder detta helt enkelt att man söker på ord som innehåller den givna teckensekvensen i början eller i slutet.

Vid lemgramsökning används i stället en sammansättningsanalys som varje ord genomgått.

**Skiftlägesoberoende sökning**

Om kryssrutan _skiftlägesoberoende_ är ikryssad görs ingen skillnad mellan stora och små bokstäver. Om man söker på till exempel "katt", så kommer man alltså även att få träffar som "KATT" och "Katt". Detta har ingen effekt vid en lemgramsökning, eftersom de alltid är skiftlägesoberoende.

### Utökad sökning

Utökad-fliken låter en bygga ihop mer avancerade sökuttryck.
Varje blå låda motsvarar ett _token_
(vilket är ungefär samma sak som ett ord, men även inkluderar exempelvis skiljetecken),
och för varje token kan man uppge ett eller flera kriterier.

Du kan lägga till fler token, och för varje token kan du lägga till och ta bort _sökvillkor_.
Om du tar bort alla villkor från ett token, tas tokenet bort.
När det bara finns ett token med ett villkor – som i ursprungsläget –
går det inte att ta bort något.

Byt plats på ett token genom att klicka och dra i dess omgivande blå ruta.

![Utökad sökning](images/utokad.png)

För varje villkor väljer du ett attribut, en operator och ett värde.
Operatorlistan och värderutan kan variera beroende på vilket attribut som är valt.
Vilka attribut som är tillgängliga beror i sin tur på de korpusar du valt.

För vissa attribut tar värdeinmatningen formen av en lista eller en textruta med automatiska förslag.

Vid textinmatning finns ibland en knapp märkt "Aa".
Genom att klicka på den kan man stänga av eller sätta på skiftlägesberoende för just det fältet.
Som standard är sökningen skiftlägesberoende, det vill säga att det görs skillnad mellan
stora och små bokstäver.
En sak att tänka på är att skiftlägesoberoende sökning går betydligt långsammare.

Om värdet för ett villkor på attributet _ord_ lämnas tomt, matchar det samtliga token.
Därför finns en platshållartext i den textrutan som säger "vilket ord som helst".

Varje token kan ha ett eller flera villkor.
De kombineras i en övre _och_-nivå, och en undre _eller_-nivå.
(Denna struktur kallas _konjunktiv normalform_.)
Klicka på knapparna _eller..._ och _och..._ för att lägga till villkor på respektive nivå.

**Upprepning**

I botten av varje token finns valet _Upprepa_.
Om du aktiverar det får du ange en minsta och största tillåtna värde på antal upprepningar av de angivna tokenvillkoren.
Det betyder alltså inte nödvändigtvis att samma matchade token upprepas, utan det kan vara flera olika token som alla matchar samma uppsättning vilkor.
En användbar tillämpning av detta är att ange _ord + är + (vilket som helst)_ och ett upprepningsspann på exempelvis _0–3_.
Detta medger en "lucka" mellan ett token och ett annat.

![Upprepa token i utökad sökning](images/utokad-upprepa.png)

**Början eller slutet av en mening**

Med knappen _Lägg till gräns_ kan du ange att något token ska ligga intill en textenhetsgräns.
När du har klickat på knappen väljer du _början_ eller _slut_.
Ett _gränstoken_ skapas, och där kan du eventuellt välja en gränsenhet.
Vanligtvis finns alternativet _mening_, men ibland också _stycke_ – detta beror på valda korpusar.

Tänk på att skiljetecken också räknas som token, vilket innebär att att sista tokenet i en mening oftast är en punkt och inte ett ord.

**Sök över meningsgränser**

Som standard utförs alla sökningar _inom_ meningsgränserna, vilket betyder att man aldrig kommer att få en
träff som sträcker sig utanför en mening. För vissa korpusar finns det dock möjlighet att i stället tillåta träffar som spänner
över en större mängd text, till exempel ett stycke, vilket gör det möjligt att söka över meningsgränser.

Alternativet för att aktivera detta hittar man bredvid Sök-knappen vid Utökad sökning. Om den eller de korpusar man har valt inte stöder
utökad kontext, så kommer det här inte gå att välja något annat än "mening". Har man däremot valt minst en korpus som tillåter
utökad kontext så kommer man kunna välja det i listan.

**Parallellsökning**

Vissa av korpusarna i Korp är så kallade parallellkorpusar, som består av två versioner av samma text som är länkade sinsemellan
på meningsnivå. Oftast rör det sig om texter på två olika språk. Sökresultatet från en sådan korpus kommer bestå av
_par_ av meningar, en för varje version av texten. För att kunna utföra parallellsökningar måste man först växla till det
parallella läget i Korp, via länken "Parallella" högst upp på sidan.

Parallellsökning går enbart att utföra med Utökad sökning. Detta fungerar till största del som en vanlig sökning,
med skillnaden att man nu har möjlighet att välja vilken eller vilka av språkversionerna man vill söka i. Detta görs i en språkmeny ovanför
första tokenrutan. Det går även att söka parallellt i båda språken genom att trycka på knappen "Fler språk" nere vid Sök-knappen. Detta
lägger till en extra rad med token, i vilken man kan ange sökkriterier för det andra språket. En sökning gjord på detta vis
betyder att dina sökkriterier måste uppfyllas av båda språken i varje meningspar för att en träff ska hittas. Man kan till exempel
med en svensk-engelsk översättningskorpus söka efter länkade par där den svenska delen måste innehålla ordet "älg", medan den engelska
måste innehålla "elk". Man kan också genom att kryssa i rutan "Innehåller inte" säga att man bara vill ha de träffar där
ordet "elk" _inte_ förkommer i den engelska delen.

![Ordlänkning i parallella läget](images/ordlank.png)

För vissa korpusar finns det utöver meningslänkning även _ordlänkning_. Genom att markera ett ord på ena språket kan man då se vilket
eller vilka ord i andra språket som detta ord motsvarar. Observera att ordlänkningen i regel är automatiskt utförd och därför inte är helt
tillförlitlig.

### Avancerad sökning

Oavsett om man använder Enkel eller Utökad sökning så omvandlas ens fråga till ett uttryck i frågespråket CQP Query Language. På fliken
_Avancerad_ kan man både se hur de skapade uttrycken för Enkel och Utökad ser ut, samt konstuera en egen sökfråga om man vill
göra något som är mer avancerat än vad som för närvarande är möjligt i en Utökad sökning.

För att läsa mer om frågespråket, se:

- [Att söka i Korp med CQP och Regexp – en introduktion (pdf)](https://www.gu.se/sites/default/files/2021-03/Att%20so%CC%88ka%20i%20Korp%20med%20CQP%20och%20Regexp.pdf) (Klas Hjortstam, 2018)
- [CQP Interface and Query Language Manual (pdf)](https://cwb.sourceforge.io/files/CQP_Manual.pdf) (Stephanie Evert & The CWB Development Team, 2022)

## Sökresultat

Resultatvyn, som visas först efter att en sökning har utförts, är uppdelad i tre olika avdelningar: _KWIC_, _Statistik_ och _Ordbild_.

### KWIC

KWIC, som står för "keyword in context", visar det sökta ordet eller orden i sin kontext, vanligtvis en mening.
Listningen med sökträffar brukar vi kalla _kwic:en_.

Om det finns många sökträffar är de uppdelade på flera sidor.
Bland alternativen kan man välja antalet träffar per sida, samt sorteringsordning.
Sorteringen kan ske antingen efter höger- eller vänsterkontext, på själva träffen i sig, eller slumpvis.
Sorteringen sker enbart inom varje korpus.
Med standardvalet "förekomst" kommer träffarna visas i den ordning de förekommer i korpusen, vilket i många fall är en delvis slumpvis ordning av upphovsrättsliga skäl.

Om sökningen gäller flera korpusar, och resultatet ger flera sidor, finns det till höger ovanför sökresultaten en _fördelningsremsa_.
Det är en rad med knappar som visar storleksförhållandet mellan träffmängden i de olika korpusarna.
Genom dessa knappar kan du snabbt hitta till den träffsida där träffarna från en viss korpus börjar.

Sökträffarna är grupperade efter korpus, och vilken korpus de efterföljande träffarna kommer från står skrivet med rubrik ovanför.

Överst till höger i KWIC-fliken finns möjligheten att ladda ner den aktuella sidans träffar i olika format.
Om du behöver alla träffar kan du öka _Träffar per sida_ till det maximala,
och sedan ladda ner träffarna för varje sida.

**Större kontext**

I vissa korpusar är det möjligt att få se en större kontext än bara en mening. Vanligtvis rör det sig om hela stycken.
Klicka i alternativet "Visa kontext".
Detta växlar till en alternativ träffsida, där större kontext visas i de fall det är möjligt,
och varje träffrad är radbruten för enklare läsning.
I övrigt fungerar kontextläget precis som det vanliga KWIC-läget.

**Sidopanelen**

I kwic:en kan du markera ett token genom att klicka på det.
Du kan också navigera till närligande token med piltangenterna.
Det markerade tokenet får en grön bakgrund.

När ett token är markerat visas till höger en sidopanel.
Denna innehåller både information om det markerade ordet (under rubriken _Ordattribut_), och eventuellt också om den mening eller större text som ordet ingår i (under _Strukturella attribut_).
Ordattributen är information som ordklass, grundform, sammansättningsanalys med mera, medan textattributen kan vara författare, utgivningsår och liknande.

Vissa attribut har en _detaljmeny_ som symboliseras av tre prickar.
Den kan till exempel innehålla en konfidenspoäng, intern sökning och extern sökning.
Med _konfidens_ menas ett mått på hur "självsäker" en viss automatiserad modell var när den gav attributets värde.
_Intern sökning_ betyder att du kan klicka för att skapa en ny Korp-sökning på det givna attributvärdet.
_Extern sökning_ är en länk till information om attributvärdet i en annan plattform.

När ett ord är markerat markeras även dess _syntaktiska huvud_ i samma mening, med en blå bakgrund.

### Statistik

Statistik-fliken visar en tabell där varje kolumn motsvarar en korpus, och raderna utgörs av de olika värden som sökningen matchat. Som standard
sammanställs statistiken på ordformer, och vid en enkel
sökning på endast ett ord kommer det därför bara finnas en rad, medan en sökning på ett lemgram i stället ger en rad per ordform som förekommer i materialet.
Man kan även välja att sammanställa statistiken på andra attribut än ordform, till exempel ordklass eller något textattribut.
För vissa attribut kan man välja om sammanställningen ska vara skiftlägesberoende eller ej.

Genom att klicka på sökträfftexten i en resultatrad i tabellen, öppnas en ny KWIC-flik med de meningar som legat till grund för just den statistikraden.

Tabellens celler visar antalet förekomster i varje korpus.
Genom att välja _Visa relativa frekvenser_ kan de bytas ut till relativa frekvenser, det vill säga antal träffar per en miljon token.
Med relativa frekvenser är det lättare att jämföra träffstorleken mellan korpusar.
Genom att klicka på kolumnernas rubriker kan man sortera tabellen i stigande eller fallande ordning efter vald kolumn.

Om flera korpusar är valda finns också en kolumn med ikoner för cirkeldiagram.
Klicka på ikonen för att öppna ett diagram på fördelningen av träffarna mellan de olika korpusarna.
Både absolut och relativ frekvens visas.

Överst till höger i statistikfliken finns möjligheten att ladda ner tabellen.

**Trenddiagram**

Om någon av korpusarna man har sökt i innehåller tidsinformation, är det möjligt att ta fram ett trenddiagram. Trenddiagrammet utgår från rader i statistiktabellen,
och visar förändringen av dessa raders relativa frekvens över tid. Den relativa frekvensen i diagrammet visar antalet träffar per en miljon token för varje specifik tidsenhet.

För att komma till trenddiagrammet väljer man först ut en eller flera rader från statistiken med hjälp av kryssrutorna längst till vänster i tabellen
(eller lämnar standardvalet av summaraden),
och därefter klickar man på knappen _Trenddiagram_.
En ny flik kommer då öppnas, innehållande ett linjediagram.
Diagrammets horisontella axel visar tid, medan den vertikala axeln visar relativ frekvens.
Varje linje i diagrammet motsvarar en vald rad i statistiktabellen, och i teckenförklaringen längst till höger går det att kryssa i och ur vilka linjer man vill visa. Genom att
klicka på en punkt på en linje, öppnas en ny flik med alla träffar för just den tidpunkten.

Under trenddiagrammet finns en miniatyrversion av diagrammet, med handtag som låter en zooma in och panorera runt i det stora diagrammet. Upplösningen på trenddiagrammets tidaxel
bestäms av storleken på det tidsspann som visas, och genom att zooma in går det att visa tidsinformation ner på sekundnivå, förutsatt att det valda materialet har stöd för det.

Genom att välja _Visa Stapel_ eller _Tabell_ byts diagrammet ut mot ett stapeldiagram eller en tabell.
Överst till höger finns också möjligheten att ladda ner tabellen.

**Karta**

Med kartfunktionen kan du se frekvenserna som olika stora markörer på en karta.
Likt trenddiagrammet utgår den från rader i statistiktabellen.
Kryssa för en eller flera rader i statistiken med hjälp av kryssrutorna längst till vänster i tabellen,
och klicka sedan på knappen _Karta_.

I den meny som då fälls ut väljer du vilket attribut du vill basera kartan på. För de flesta korpusar är det endast möjligt
att basera kartan på samförekomst med platsnamn på menings- eller styckesnivå, dvs den tittar på sökträffens kontext och
letar efter platser där. Men för vissa korpusar finns det även platsinformation angiven som metadata, t.ex. en bloggares
hemort, och då är det möjligt att basera kartan på den informationen i stället.

Här finns också valet _Relativ_, som innebär att markörernas storlek blir
i förhållande till hur vanligt förekommande respektive plats är i övrigt,
inom valda korpusar.
Därmed ges ett intryck av vilka platser som är särskilt utmärkande just för den aktuella sökningen.

Efter att du gjort ditt val och klickat på _Öppna karta_ kommer en ny kartflik att öppnas.
När du för muspekaren över en markör visas en låda till höger med träffinformation för den platsen.
Genom att klicka på markören stannar platslådan kvar även efter att du för bort muspekaren.
Då kan du sedan klicka på ett träffvärde i platslådan för att öppna en KWIC-flik med alla träffar för den platsen.

Med valet _Gruppera markörer_ slås närliggande markörer ihop till en.
Markörerna byter också form, från cirklar till staplar.
När du hovrar eller klickar på en grupperad markör visas en låda för varje plats som ingår.

### Ordbild

För att kunna skapa en ordbild behöver sökfrågan vara exakt ett ord eller lemgram. I utökad och avancerad sökning innebär det ett enda token med ett enda villkor på attributet _ord_ eller _lemgram_.

Här visas det sökta ordet tillsammans med ord som det har
olika syntaktiska relationer till i materialet, grupperat efter relation. För ett verb visas till exempel de subjekt och objekt som är särskilt utmärkande för just det
verbet, och för ett substantiv visas utmärkande attribut, och verb som substantivet är subjekt och objekt till.

![Ordbilden i Korp](images/ordbild.png)

Intill varje relaterat ord finns ett mått på sambandet till sökordet inom det valda materialet.
Du kan välja att visa och sortera på absolut frekvens (antal) eller Lexicographer's Mutual Information (LMI).
LMI är ett värde som mäter frekvensen av ett givet ordpar i förhållande till frekvenserna av varje ord i paret.
På så vis reduceras ord som samförekommer ofta bara för att de är vanliga i allmänhet, såsom "vara" och "ha".

Genom att klicka på ett ord i tabellen kan man få fram en ny KWIC-flik med alla de meningar i vilka vald relation förekommer.

## Jämförelser

I jämförelsefunktionen visualiseras vilka värden som är mest utmärkande för en delmängd av korpusmaterialet jämfört med en annan.

Först behöver du skapa och spara två sökfrågor.
Välj korpusar och formulera en sökfråga som vanligt.
Klicka sedan på _Spara_-knappen bredvid _Sök_-knappen och välj ett passande namn.
(Du behöver inte utföra själva sökningen, men det kan vara bra för att se att din fråga blir korrekt.)
Gör likadant igen för en ny fråga.

Gå sedan till fliken _Jämförelse_, som kommer efter de tre sökflikarna.
Välj de två sökningarna, och därefter vilket attribut som jämförelsen ska utföras på.

I resultatet presenteras en kolumn för vardera sökning, med värden för det valda attributet.
För varje värde skrivs antalet träffar ut, men framför allt görs också en uträkning av _log-likelihood (loglike)_.
Detta berättar hur utmärkande värdet är för den ena sökningen jämfört med den andra.
Loglike-värdet syns som en mätstapel bakom attributvärdet, och utgör sorteringen i varje kolumn:
det som är mest utmärkande för den första sökningen är längst upp i den vänstra kolumnen,
och det mest utmärkande för den andra är längst upp i den högra.

Klicka på en rad för att öppna en KWIC-flik med alla träffar som ingår i raden.

![Resultat från jämförelse](images/jamforelse.png)
