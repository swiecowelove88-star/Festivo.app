# Festivo: Kalendarz Świąt & Social Media Planner (AI)

> Festivo to nowoczesna aplikacja mobilna i webowa (PWA oraz natywny Android APK) stworzona do planowania treści w mediach społecznościowych i odkrywania świąt nietypowych na każdy dzień roku. Wbudowany moduł sztucznej inteligencji automatycznie generuje wiralowe scenariusze na TikTok oraz angażujące posty na Facebook.

<p>
  <a href="https://festivoapp.vercel.app/"><img src="https://img.shields.io/badge/Aplikacja_Online-festivoapp.vercel.app-243235?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel App" /></a>
  <a href="https://www.mediafire.com/file/bvgxsxgury9h9qm/festivo.apk/file"><img src="https://img.shields.io/badge/Pobierz_APK-MediaFire-D97652?style=for-the-badge&logo=android&logoColor=white" alt="MediaFire APK" /></a>
</p>

**Autor:** Eryk Paluch  
**Licencja:** MIT  

## 📱 Dostęp Online & Szybka Instalacja na Telefonie

Aplikacja jest dostępna publicznie pod adresem:  
👉 **[https://festivoapp.vercel.app](https://festivoapp.vercel.app/)**

Zeskanuj wybrany kod QR aparatem w telefonie:

| iPhone & Android (Wersja Online / PWA) | Android (Bezpośrednie pobieranie APK) |
| :---: | :---: |
| <img src="public/qr-festivo.png" width="180" alt="Kod QR Festivo Online" /> | <img src="public/qr-festivo-apk.png" width="180" alt="Kod QR Festivo APK" /> |
| **[festivoapp.vercel.app](https://festivoapp.vercel.app/)** | **[Pobierz Festivo.apk](https://festivoapp.vercel.app/festivo.apk)** |

Możesz zainstalować Festivo jako aplikację mobilną dodając skrót do ekranu głównego:

### 🍎 iPhone (iOS / Safari)
1. Otwórz stronę **[festivoapp.vercel.app](https://festivoapp.vercel.app/)** w przeglądarce Safari.
2. Na dolnym pasku kliknij przycisk Udostępnij (kwadrat ze strzałką w górę `⎋`).
3. Wybierz opcję **Do ekranu początkowego** (*Add to Home Screen*).
4. Kliknij **Dodaj** w prawym górnym rogu.

### 🤖 Android (Google Chrome)
1. Otwórz stronę **[festivoapp.vercel.app](https://festivoapp.vercel.app/)** w przeglądarce Chrome.
2. Kliknij menu z trzema kropkami (`⋮`) w prawym górnym rogu.
3. Wybierz opcję **Zainstaluj aplikację** lub **Dodaj do ekranu głównego**.
4. Alternatywnie możesz pobrać gotowy plik instalacyjny: [Pobierz Festivo.apk (MediaFire)](https://www.mediafire.com/file/bvgxsxgury9h9qm/festivo.apk/file).

## 🌟 Główne Funkcje

* 📅 **Baza 366 dni w roku**: ponad 730 świąt tradycyjnych, państwowych i nietypowych.
* 🎂 **Baza imienin**: dopasowanie imienin do każdego dnia roku.
* 🤖 **Generator AI (Google Gemini & Groq / Llama 3.3 / Qwen)**:
  * **TikTok**: Hook na pierwsze 3 sekundy, scenariusz ujęć krok po kroku, sugerowany trend muzyczny, gotowy opis i hasztagi.
  * **Facebook**: Chwytliwy nagłówek, angażująca treść dla społeczności szkolnej lub firmowej, wezwanie do działania (CTA) oraz hasztagi.
  * **Klimat treści**: Szkolny humor, sonda korytarzowa, filmowy POV lub oficjalna akcja samorządu.
* 📱 **Dostępność**:
  * **Android**: Gotowy plik instalacyjny APK z dedykowanymi ikonami systemowymi.
  * **iOS (iPhone)**: Pełne wsparcie PWA (uruchamianie na pełnym ekranie bez pasków przeglądarki).
  * **Web**: Responsywna wersja na komputery i tablety.
* 🎨 **Paleta Monument Valley**:
  * Barwy natury: ciemny storm teal `#243235`, terakota `#D97652`, brzoskwiniowy piaskowiec `#F2AB91`.
  * Geometria i czytelność bez zbędnego szumu wizualnego.
* 🔒 **Prywatność**:
  * Klucze API (Gemini / Groq) są zapisywane wyłącznie w pamięci lokalnej urządzenia (`localStorage`).

## 🛠️ Stos Technologiczny

* **Frontend**: React 18, TypeScript, Vite
* **Styling**: Tailwind CSS
* **Ikony**: Lucide React
* **Mobile Runtime**: Capacitor Android
* **Silniki AI**: Google Gemini API, Groq Cloud API
* **Graf Wiedzy AST**: Graphify

## 🚀 Uruchomienie Lokalne

1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/twoj-login/festivo.git
   cd festivo
   ```
2. Zainstaluj zależności:
   ```bash
   npm install
   ```
3. Uruchom serwer deweloperski:
   ```bash
   npm run dev
   ```

## 📦 Budowanie Produkcyjne

* **Wersja Web (PWA):**
  ```bash
  npm run build
  ```

* **Pakiet Android (.APK):**
  ```bash
  npx cap sync android
  cd android
  ./gradlew assembleDebug
  ```

## 👨‍💻 Autor

Projekt stworzony przez: **Eryk Paluch**
