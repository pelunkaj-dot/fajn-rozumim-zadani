window.tasks=[
  {
    "story": [
      "Na větvi sedí 6 sýkorek.",
      "2 sýkorky odletí do lesa."
    ],
    "question": "Kolik sýkorek zůstane na větvi?",
    "other": "Kolik sýkorek přiletělo?",
    "paths": [
      "Odeberu dvě ze šesti.",
      "Dopočítám od dvou do šesti.",
      "Přidám dvě k šesti."
    ],
    "valid": [
      0,
      1
    ],
    "explain": [
      "Šest ptáků, dva pryč. Počítáš zbývající ptáky.",
      "Hledáš, kolik chybí od dvou odletělých do původních šesti.",
      "Přidáním bys měl osm ptáků. V příběhu ale ptáci odletěli."
    ],
    "answer": 4,
    "unit": "sýkorky",
    "check": "Po odletu musí být na větvi méně než šest ptáků.",
    "badcheck": "Po odletu musí být ptáků více.",
    "model": "Šest celkem = dva odletělí + zbývající."
  },
  {
    "story": [
      "Chystáme svačinu pro 4 děti.",
      "Každé dítě dostane 3 rohlíky."
    ],
    "question": "Kolik rohlíků potřebujeme pro všechny 4 děti?",
    "other": "Kolik rohlíků dostane jedno dítě?",
    "paths": [
      "Připravím pro každé ze čtyř dětí tři rohlíky.",
      "Sečtu 3 + 3 + 3 + 3.",
      "Sečtu počet dětí a rohlíků: 4 + 3."
    ],
    "valid": [
      0,
      1
    ],
    "explain": [
      "Máme čtyři děti a pro každé tři rohlíky. Celkový počet rohlíků zapíšeme jako 4 × 3.",
      "Sečtu rohlíky na všech talířích. Pro Aničku jsou tři, pro Tomáše tři, pro Emu tři a pro Petra také tři.",
      "Zkus rozdat sedm rohlíků. Na každém ze čtyř talířů mají být tři rohlíky. Sedm na takovou svačinu nestačí."
    ],
    "answer": 12,
    "unit": "rohlíků",
    "check": "Rozdělím rohlíky mezi čtyři děti. Každé musí dostat právě tři.",
    "badcheck": "Stačí, když je rohlíků víc než tři.",
    "model": "4 děti. Každému dítěti patří 3 rohlíky."
  },
  {
    "story": [
      "Na zahradě máme 6 záhonů.",
      "Na každém záhonu rostou 4 sazenice rajčat."
    ],
    "question": "Kolik sazenic rajčat roste na celé zahradě?",
    "other": "Kolik sazenic je na jednom záhonu?",
    "paths": [
      "Vynásobím 6 × 4.",
      "Spočtu tři záhony a výsledek zdvojnásobím.",
      "Vydělím 6 : 4."
    ],
    "valid": [
      0,
      1
    ],
    "explain": [
      "Máme šest záhonů. Na každém rostou čtyři sazenice rajčat. Celkový počet sazenic zapíšu jako 6 × 4.",
      "Nejprve spočítám sazenice na třech záhonech. Zbývající tři záhony mají stejný počet sazenic. První výsledek proto zdvojnásobím.",
      "Dělení zde nepočítá všechny sazenice v šesti skupinách."
    ],
    "answer": 24,
    "unit": "sazenic",
    "check": "Rozmístím sazenice na šest záhonů. Na každém musí být právě čtyři.",
    "badcheck": "Celek musí být menší než šest.",
    "model": "6 záhonů. Na každém záhonu rostou 4 sazenice rajčat."
  },
  {
    "story": [
      "U domu je obdélníková zahrada. Je dlouhá 8 metrů a široká 5 metrů.",
      "Kolem zahrady chceme postavit plot. Na jedné straně bude branka široká 2 metry. V místě branky plot nebude."
    ],
    "question": "Kolik metrů plotu potřebujeme?",
    "other": "Jaký obsah má zahrada?",
    "paths": [
      "Sečtu všechny čtyři strany a odečtu branku.",
      "Spočtu 2 × (8 + 5) − 2.",
      "Spočtu 8 × 5 − 2."
    ],
    "valid": [
      0,
      1
    ],
    "explain": [
      "Plot vede po hranici, branka nahrazuje dva metry plotu.",
      "Dva páry stejně dlouhých stran tvoří obvod.",
      "Násobení 8 × 5 měří plochu, nikoli délku hranice."
    ],
    "answer": 24,
    "unit": "m",
    "check": "Délka plotu je o dva metry menší než obvod.",
    "badcheck": "Délka plotu musí odpovídat obsahu v m².",
    "model": "Hranice: 8 m + 5 m + 8 m + 5 m. Branka: 2 m."
  },
  {
    "story": [
      "Chceme nalít vodu do prázdného akvária. Jeho vnitřní délka je 100 cm, šířka 40 cm a výška 50 cm.",
      "Do akvária nalijeme 65 litrů vody. Není v něm písek ani žádné dekorace."
    ],
    "question": "Jak vysoko bude sahat voda ode dna akvária?",
    "other": "Jaký je obvod dna?",
    "paths": [
      "Převedu litry na cm³ a objem vydělím obsahem dna.",
      "Převedu dno na 10 × 4 dm a počítám v litrech = dm³.",
      "Vydělím 65 součtem 100 + 40."
    ],
    "valid": [
      0,
      1
    ],
    "explain": [
      "65 000 cm³ ÷ 4 000 cm² dává výšku v cm.",
      "65 dm³ ÷ 40 dm² dává výšku v dm. Tu převedeš na cm.",
      "Součet stran není plocha dna. Vrstva vody vyplňuje celé dno."
    ],
    "answer": 16.25,
    "unit": "cm",
    "check": "Vrstva vysoká 1 cm pojme 4 litry, takže 65 litrů sahá mezi 16 a 17 cm.",
    "badcheck": "65 litrů vždy znamená hladinu 65 cm.",
    "model": "Dno = 100 × 40 = 4 000 cm². Jeden centimetr výšky = 4 litry."
  },
  {
    "story": [
      "Plánujeme výlet vlakem. Na mapě měří vybraná trať 8 cm.",
      "Mapa má měřítko 1 : 25 000. To znamená, že 1 cm na mapě představuje 25 000 cm ve skutečnosti."
    ],
    "question": "Jak dlouhá je trať ve skutečnosti? Odpověz v kilometrech.",
    "other": "Kolik centimetrů měří trať na mapě?",
    "paths": [
      "Vynásobím 8 × 25 000 a převedu cm na km.",
      "Zjistím délku pro 1 cm a pak ji osminásobím.",
      "Vydělím 8 číslem 25 000."
    ],
    "valid": [
      0,
      1
    ],
    "explain": [
      "Každý centimetr mapy odpovídá 25 000 cm skutečnosti.",
      "1 cm mapy znamená 250 m, osm centimetrů osmkrát tolik.",
      "Skutečná trať je větší než její obraz na mapě, ne menší."
    ],
    "answer": 2,
    "unit": "km",
    "check": "Osm úseků po 250 metrech dává délku v řádu kilometrů.",
    "badcheck": "Skutečná trať musí být kratší než 8 cm.",
    "model": "1 cm → 250 m; 8 cm → osmkrát delší úsek."
  },
  {
    "story": [
      "Veřejné osvětlení dříve spotřebovalo každý den 800 kWh elektrické energie.",
      "Po výměně lamp spotřebuje za den 680 kWh. Chceme porovnat úsporu s původní spotřebou."
    ],
    "question": "O kolik procent původní spotřeby se spotřeba snížila?",
    "other": "Kolik procent nové spotřeby tvoří úbytek?",
    "paths": [
      "Úbytek vydělím původní spotřebou a násobím stem.",
      "Spočtu, kolik procent původní spotřeby zbylo, a odečtu od 100 %.",
      "Úbytek vydělím novou spotřebou a násobím stem."
    ],
    "valid": [
      0,
      1
    ],
    "explain": [
      "Úspora je 800 − 680 = 120 kWh. Porovnám ji s původní spotřebou: 120 ÷ 800 × 100.",
      "Nejprve zjistím, kolik procent původní spotřeby zůstalo: 680 ÷ 800 × 100. Potom toto procento odečtu od 100 %.",
      "Tato cesta používá jiný základ. Odpovídala by otázce na podíl z nové spotřeby."
    ],
    "answer": 15,
    "unit": "%",
    "check": "Deset procent původní spotřeby je 80 kWh. Úspora 120 kWh je větší než 10 %, ale menší než 20 %.",
    "badcheck": "Úspora 120 kWh automaticky znamená 120 %.",
    "model": "Původní celek: 800. Zbývá: 680. Úbytek: 120."
  },
  {
    "story": [
      "U hvězdárny je plošina ve výšce 4 metry nad vodorovnou zemí. Stěna pod plošinou je svislá.",
      "K plošině přistavíme žebřík. Jeho dolní konec bude na zemi 3 metry od stěny."
    ],
    "question": "Jak dlouhý musí být žebřík, aby dosáhl přesně k plošině?",
    "other": "Jaký je součet vzdálenosti od stěny a výšky?",
    "paths": [
      "Použiju pravoúhlý trojúhelník: odmocnina z (4² + 3²).",
      "Poznám pravoúhlý trojúhelník s poměrem stran 3 : 4 : 5.",
      "Sečtu 4 + 3."
    ],
    "valid": [
      0,
      1
    ],
    "explain": [
      "Žebřík je přepona, ne jedna z odvěsen.",
      "Známou trojici je možné ověřit: 3² + 4² = 5².",
      "Součet vede podél země a potom vzhůru, ne přímo po žebříku."
    ],
    "answer": 5,
    "unit": "m",
    "check": "Žebřík musí být delší než 4 m, ale kratší než cesta 3 + 4 m.",
    "badcheck": "Žebřík musí být kratší než výška plošiny.",
    "model": "Odvěsny: 3 m a 4 m. Přepona: hledaná délka žebříku."
  },
  {
    "story": [
      "Vybíráme mezi dvěma nabídkami telefonního operátora. U nabídky A zaplatíme každý měsíc 100 Kč a k tomu 4 Kč za každou provolanou minutu.",
      "U nabídky B zaplatíme každý měsíc 200 Kč a k tomu 2 Kč za každou provolanou minutu. Žádné další poplatky nepočítáme."
    ],
    "question": "Při kolika provolaných minutách zaplatíme za obě nabídky stejnou částku?",
    "other": "Který tarif je vždy levnější bez ohledu na volání?",
    "paths": [
      "Zapíšu obě celkové ceny a najdu, kdy se rovnají.",
      "Zjistím, za kolik minut se vyrovná rozdíl měsíčních poplatků.",
      "Porovnám jen měsíční poplatky. Nabídka A bude vždy levnější."
    ],
    "valid": [
      0,
      1
    ],
    "explain": [
      "Označím počet minut písmenem x. Celkové ceny jsou 100 + 4x a 200 + 2x. Hledám takové x, při kterém jsou stejné.",
      "U B zaplatím každý měsíc o 100 Kč více. Za každou minutu ale ušetřím 2 Kč. Hledám, za kolik minut ušetřím právě těch 100 Kč.",
      "Při 100 minutách zaplatím za A 500 Kč a za B 400 Kč. Samotný měsíční poplatek tedy nestačí k rozhodnutí."
    ],
    "answer": 50,
    "unit": "minut",
    "check": "Dosadím stejný počet minut do obou cen a porovnám částky.",
    "badcheck": "Stačí porovnat měsíční paušály.",
    "model": "A: 100 + 4 × minuty. B: 200 + 2 × minuty."
  }
];
