# Festivo Kalendarz Świąt & Social Media Planner (AI)

> **Festivo** to nowoczesna aplikacja mobilna i webowa (PWA + natywny Android APK) stworzona do planowania treści w mediach społecznościowych i odkrywania świąt nietypowych na każdy dzień roku. Wbudowany moduł sztucznej inteligencji automatycznie generuje wiralowe scenariusze na **TikTok** oraz angażujące posty na **Facebook**.

[![Pobierz APK](https://img.shields.io/badge/Pobierz_APK-MediaFire-E55B3C?style=for-the-badge&logo=android&logoColor=white)](https://www.mediafire.com/file/pu2rlvgihp619pr/Festivo.apk/file)

**Autor:** Eryk Paluch  
**Licencja:** MIT  

---

## 🌟 Główne Funkcje

* 📅 **Kompletna baza 366 dni w roku** — ponad 730 świąt tradycyjnych, państwowych i nietypowych.
* 🎂 **Baza imienin** — automatyczne dopasowanie imienin do każdego dnia roku.
* 🤖 **Generator AI (Google Gemini & Groq / Llama 3.3 / Qwen)**:
  * **TikTok**: Hook na pierwsze 3 sekundy zatrzymujący scrollowanie, scenariusz ujęć krok po kroku (z podziałem na sceny), sugerowany trend muzyczny/audio, gotowy opis i hasztagi.
  * **Facebook**: Chwytliwy nagłówek, angażująca treść dla społeczności szkolnej lub firmowej, wezwanie do działania (CTA) pobudzające komentarze oraz hasztagi.
  * **Wybór klimatu treści**: Szkolny humor, sonda korytarzowa, filmowy POV lub oficjalna akcja samorządu.
* 📱 **Wieloplatformowość**:
  * **Android**: Gotowy, natywny plik instalacyjny `.APK` (Capacitor) z dedykowanymi ikonami systemowymi.
  * **iOS (iPhone)**: Pełne wsparcie dla PWA (instalacja przez Safari *„Do ekranu początkowego”* bez pasków przeglądarki).
  * **Web**: Responsywna aplikacja działająca na każdym komputerze i tablecie.
* 🎨 **Unikalny Design (Monument Valley)**:
  * Dojrzała, ciepła paleta barw (głęboki storm teal `#243235`, terakota `#D97652`, piaskowiec `#F2AB91`).
  * Nowoczesne, geometryczne zaokrąglenia (brak chaotycznych okrągłych przycisków, minimalizm, brak zbędnego szumu graficznego).
* 🔒 **Prywatność i bezpieczeństwo**:
  * Klucze API (Gemini / Groq) są zapisywane wyłącznie w pamięci lokalnej urządzenia (`localStorage`) i łączą się bezpośrednio z oficjalnymi serwerami dostawców AI.
* 🧠 **Graphify Knowledge Graph**:
  * Zindeksowany graf wiedzy AST Tree-Sitter (`graphify-out/`), ułatwiający agentom AI nawigację po architekturze projektu bez przepalania tokenów kontekstu.

---

## 🛠️ Stos Technologiczny

* **Frontend**: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Ikony**: [Lucide React](https://lucide.dev/)
* **Mobile Runtime**: [@capacitor/core](https://capacitorjs.com/), [@capacitor/android](https://capacitorjs.com/)
* **AI Engine**: Google Gemini API (`@google/genai`), Groq Cloud API (Llama 3.3, Qwen 3.8, GPT OSS)
* **Graf Wiedzy AST**: Graphify (`graphifyy`)

---

## 🚀 Uruchomienie Lokalne

### Wymagania
* [Node.js](https://nodejs.org/) (wersja 18+)
* [npm](https://www.npmjs.com/)

### Krok po kroku:
1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/<twoj-login>/festivo.git
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
   Aplikacja uruchomi się pod adresem: `http://localhost:5173`.

---

## 📲 Instalacja na Telefonie

### 🤖 Android (Plik .APK)
* 📥 **Bezpośredni link do pobrania APK:**  
  👉 **[Pobierz Festivo.apk (MediaFire)](https://www.mediafire.com/file/pu2rlvgihp619pr/Festivo.apk/file)**

1. Pobierz plik `Festivo.apk` z powyższego linku (lub bezpośrednio w aplikacji w zakładce *„Aplikacja”*).
2. Dotknij pobranego pliku w powiadomieniach lub w menedżerze plików i wybierz **Zainstaluj**.
3. Jeśli system poprosi o zgodę na instalację z nieznanych źródeł, zaznacz *„Zezwalaj z tego źródła”*.

### 🍎 iPhone (iOS / Safari)
1. Otwórz stronę w przeglądarce **Safari**.
2. Kliknij przycisk **Udostępnij** (ikona kwadratu ze strzałką w górę `⎋`).
3. Wybierz opcję **„Do ekranu początkowego”** (*Add to Home Screen*) i kliknij **Dodaj**.

---

## 📦 Budowanie Produkcyjne

* **Wersja Web (PWA):**
  ```bash
  npm run build
  ```
  Pliki wynikowe trafią do katalogu `dist/`.

* **Pakiet Android (.APK):**
  ```bash
  npx cap sync android
  cd android
  ./gradlew assembleDebug
  ```
  Gotowy plik APK znajdziesz w: `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 🧠 Integracja Graphify (Knowledge Graph)

Projekt posiada wbudowaną mapę architektury AST opartą na Graphify:
```bash
# Odpytanie grafu o powiązania i architekturę
graphify query "Jak działa generator AI?"

# Sprawdzenie ścieżki między komponentami
graphify path "App" "buildPrompt"

# Aktualizacja grafu po zmianach w kodzie
graphify update .
```
Wizualizację grafu można otworzyć w przeglądarce: `graphify-out/graph.html`.

---

## 👨‍💻 Autor

Projekt stworzony przez: **Eryk Paluch**
