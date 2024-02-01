# README

## Opis

Ovaj projekat je web aplikacija za portal turističke agencije fokusirana na prikazivanje trenutnih ponuda putovanja. Uključuje funkcionalnosti za dvije korisničke uloge: admin i korisnik.

### Uloga Admina:
- Upravlja korisnicima i oglasima za trenutne ponude putovanja.
  - Može dodavati nove korisnike.
  - Može mijenjati postojeće podatke korisnika.
  - Može deaktivirati korisnike umjesto brisanja.
  - Može dodavati nove ponude putovanja.
  - Može mijenjati postojeće ponude putovanja i brisati ih.
  - Ima pristup pitanjima postavljenim na ponude putovanja od strane korisnika s ulogom korisnika i može ih ukloniti po potrebi.

### Uloga Korisnika:
- Može se registrirati nezavisno.
- Može pregledavati ponude putovanja.
- Može postavljati pitanja na objavljene ponude putovanja.
- Može se prijaviti na ponudu putovanja.
- Može pregledati historiju putovanja (ponude putovanja na koje se korisnik prijavio gdje je datum završetka putovanja stariji od trenutnog datuma).

Samo korisnici s aktivnim statusom mogu se prijaviti u sistem. Ostali korisnici koji nisu registrirani su gosti (posjetioci) i mogu samo pregledati detaljne informacije o ponudama putovanja i postavljena pitanja. Da bi postavio pitanje ili se prijavio na ponudu putovanja, korisnik se mora registrirati i dobiti ulogu korisnika.

### Stranice za Prijavu i Registraciju:
- Preko stranice za prijavu, svi registrovani korisnici uneseni u sistem od strane admin korisnika ili korisnika koji se samostalno registrirao mogu se prijaviti.
- Stranica za prijavu također treba sadržavati link za stranicu za registraciju gdje posjetilac (gost) može se registrirati.
- Putem nezavisne registracije, korisnik dobiva ulogu korisnika.

Nakon uspješne prijave korisnika, u zavisnosti od njegove uloge (admin ili korisnik), sistem treba ponuditi odgovarajuće opcije za daljni rad (kako je navedeno u zadacima).

### Glavna Stranica:
- Prikazuje sažetak svih ponuda putovanja.
- Pruža opciju detaljnog pregleda svake ponude putovanja s postavljenim pitanjima i filtriranje po kategorijama.
- Ponude putovanja mogu biti podijeljene u kategorije: Evropa, dugputovanja, ljetovanja, itd.

### Backend:
- Backend web aplikacije implementiran je koristeći Node.js.

## Korištene Tehnologije

- Node.js
- Express
- MongoDB
- Mongoose

## Pokretanje Aplikacije Lokalno

Ako želite testirati aplikaciju na svom računaru, slijedite ove korake:

1. **Kreirajte fork projekta!**
2. Kreirajte svoju granu funkcionalnosti: `git checkout -b moja-nova-funkcionalnost`
3. Komitujte svoje promjene: `git commit -am 'Dodajem neku funkcionalnost'`
4. Pritisnite granu: `git push origin moja-nova-funkcionalnost`
5. Napravite pull zahtjev.
