# První hratelný základ

Otevři `index.html` v prohlížeči; aplikace nepotřebuje instalaci ani server. Pro stabilní ukládání pokroku doporučujeme webový hosting. Veškeré údaje zůstávají v localStorage daného prohlížeče.

Obsahuje šest nezávisle dostupných úvodních misí pro 1.–6. ročník (dvě uznané strategie pro každou, možnost návratu, dobrovolný početní bonus, kontrolu reality, přetahování ptáků a klikací alternativu) a tři plně rozpracované herní světy s okruhy: 7. ročník (Souměrné město), 8. ročník (Konstrukční město) a 9. ročník (Město souvislostí), každý s deseti matematickými okruhy po deseti úlohách (100 slovních úloh na ročník), volným výběrem úlohy, filtrováním podle stavu a okruhu, a samostatným resetem okruhu. Vypínatelné syntetické zvuky a čtení zadání podle dostupných hlasů prohlížeče fungují ve všech ročnících; nahraný lidský hlas zatím existuje jen pro úvodní mise 1.–6. ročníku.

Nejde ještě o devět hotových světů ani 900 úloh — zbývá dopracovat 1.–6. ročník na stejnou hloubku jako 7.–9. ročník. Barva na mapě u 1.–6. ročníku značí pouze splnění úvodního sektoru, nikoli celého ročníku. Zbývá doplnit tematické ilustrace, skutečné stavební fáze a animace materiálů, manipulativní modely, další mise, podrobnější diagnostiku a plnohodnotný obsah tématu Finance v 9. ročníku (zatím používá obecnou šablonu). Obě alternativní cesty jsou zatím vysvětleny textově, nikoli vyhodnocovány jako libovolný sled žákových kroků.

Kontroly: `node --check app.js` a `node test.cjs`. Test používá jednoduchou náhradu DOM; není náhradou vizuálního a dotykového testu v prohlížeči.

Původní README je zachováno. Hosting ani GitHub Pages nebyly nastaveny.
