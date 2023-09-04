import { Language } from ".";

export const bad_pl = {
  mail: {
    accountVerifyPrompt: {
      subject: "Potwierdź se konto, sierotko!",
      text: "Twoje gówno-konto już jest, ale musisz je jeszcze w chuj potwierdzić. Kliknij na ten jebany link, co go niżej podrzucam!"
    },
    accountVerified: {
      subject: "Konto potwierdzone, chwała Bogu!",
      text: "O kurła, twoje konto zostało potwierdzone! To dopiero jest piękne!"
    },
    passwordChanged: {
      subject: "Zmiana passa, tak jak trzeba",
      text: "Passa zmienione, jak góralowi w górach! Mówisz, masz!"
    }
  },
  titles: {
    login: "Zaloguj się jak prawdziwy chłop",
    setup: "Ustawienia, jakie chcesz",
    signup: "Rejestracja, kurwa!",
    manage: "Zarządzanie swoją dzidzią",
    forgotPassword: "Zapomniałeś passa, cipa?",
    sellBook: "Sprzedaj swoją bibułę",
    printLabel: "Drukuj jakiś tam etykietę",
    library: "Twoje gówno, które już przeczytałeś",
    adminDashboard: "Pulpit admina, jak król chata",
    resetPassword: "Wyrzuć stare hasło w cholerę"
  },
  statuses: {
    registered: "Książka zarejestrowana, jak tubylec w górach",
    printed_label: "Etykieta dla książki wydrukowana, jak kozak na drukarce",
    accepted: "Książka zaakceptowana przez sprzedawcę, szacun za to",
    sold: "Książka sprzedana, hajs w kieszeni",
    given_money: "Hajs wysłany, teraz do piwa",
    canceled: "Ogłoszenie anulowane, aż szkoda gadać",
    deleted: "Ogłoszenie usunięte, coś tam było nie halo",
  },
  success: {
    schoolCreated: "Pomyślnie utworzono szkołę, to jest raj!",
    activationMailSent: "Wysłano wiadomość aktywacyjną na Twój adres email, leci jak trzeba",
    listingSold: "Książka sprzedana! Gdzie hajs?",
    listingsSold: "Książki sprzedane! Tylko nie wiem, gdzie teraz ta forsa",
    listingDeleted: "Książka usunięta! Było gówno, teraz już jej nie ma",
    listingCancelled: "Książka anulowana! No i chuj, nie ma sprzedaży",
    moneyGiven: "Pieniądze wysłane, hajs idzie w obieg",
    listingAccepted: "Książka zaakceptowana pomyślnie! Teraz można ją sprzedać",
    listingCreated: "Ogłoszenie utworzone pomyślnie, jest i śmiga",
    accountInfoUpdated: "Informacje profilowe zostały zaktualizowane, teraz masz się jak król",
    loggedIn: "Sukces! Zalogowano. Król na pokładzie!",
    accountVerifyPrompt:
      "Twoje konto zostało utworzone. Teraz je potwierdź, kurwa! Kliknij na link wysłany na Twój adres email.",
    accountVerified: "Twoje konto zostało pomyślnie zweryfikowane, nieźle, co?",
    passwordChanged: "Hasło zostało zmienione. Nowa broń gotowa!",
    accountDeleted: "Twoje konto zostało pomyślnie usunięte, nie ma Ciebie w bazie!",
    passwordResetInfo:
      "Wysłaliśmy Ci instrukcje dotyczące resetowania hasła na Twój adres email, sprawdź skrzynkę"
  },
  info: {
    registrationDisabled: "Rejestracja jest obecnie wyłączona, zajebiście, co nie?"
  },
  errors: {
    permissionDenied: "Nie masz kurwa uprawnień, do pokoju dziecka się dostaniesz!",
    notLoggedIn: "Nie jesteś zalogowany, co ty tu robisz?",
    listingDoesntExist: "Ogłoszenie nie istnieje, chyba że to jakiś kosmiczny gówniany portal",
    listingCancelForbidden: "Nie można anulować ogłoszenia, skomplikowana sprawa",
    roleNotExisting: "Ta rola nie istnieje, jak Bigfoot",
    internal: "Wystąpił błąd wewnętrzny, spróbuj ponownie później, jebani hakerzy",
    passwordResetTokenInvalid: "Token resetujący hasło jest nieprawidłowy lub wygasł, co za syf",
    accountCreationPermissionDenied: "Nie masz uprawnień do tworzenia nowych uprzywilejowanych użytkowników, idź gdzie indziej",
    accountAlreadyExists: "Konto o tym adresie już istnieje, podawaj adresy unikalne, no kurwa",
    emailNotSent: "Wystąpił problem podczas wysyłania wiadomości email. Spróbuj skontaktować się z naszym zespołem administracyjnym, żeby rozwiązać ten problem, chujnia się zrobiła",
    accountDoesntExist: "Konto związane z tym adresem email nie istnieje, poszukaj lepiej",
    validate: {
      schoolNameBlank: "Podaj nazwę szkoły, no chyba że masz z jajami",
      schoolstreetBlank: "Podaj nazwę szkoły, wiesz, na chacie szkoły",
      schoolComissionMultiplierInvalid: "Podaj prawidłowy współczynnik marży, chociaż kurwa w przybliżeniu",
      isbnInvalid: "Podano nieprawidłowy kod ISBN, musisz być pewien, żeby nie zjebać",
      phoneInvalid: "Podano nieprawidłowy numer telefonu, kto to ma",
      bookTitleBlank: "Tytuł książki nie może być pusty, jasne?",
      bookPublisherBlank: "Wydawca książki nie może być pusty, takie podstawy",
      bookPublicationDateBlank: "Data wydania książki nie może być pusta, nie baw się, kurwa",
      pageNotProvided: "Strona nie została podana, nie kombinuj",
      noPriceProvided: "Podaj cenę, inaczej ciężko będzie sprzedać",
      listingIdBlank: "Nie podano identyfikatora ogłoszenia książki, co za buraki",
      emailInvalid: "Podaj prawidłowy adres email, bez jaj",
      nameNotProvided: "Nie podano imienia, zapomniałeś?",
      surnameNotProvided: "Nie podano nazwiska, wyjechałeś?",
      passwordBlank: "Hasło nie może być puste, co za jajo",
      passwordInvalid: "Hasło musi mieć co najmniej 4 znaki, zjebałeś coś",
      passwordNotMatch: "Hasła nie pasują do siebie, nie przekombinowuj",
      tokenNotProvided: "Nie podano tokena autoryzacyjnego, nie kombinuj",
      tokenInvalid: "Token konta jest nieprawidłowy lub wygasł, coś się posypało",
      passwordTokenInvalid: "Token konta jest nieprawidłowy lub wygasł, kurwa"
    }
  },
  website: {
    title: "Targi Książek, co nie widzisz?",
    signature: "prościej, bo jak inaczej",
    description: "\"Sprzedawaj, rozdawaj, zarabiaj!\" To nasza wiadomość. Twoje podręczniki szkolne zyskują drugie życie dzięki szybkiemu i wygodnemu procesowi sprzedaży i odkupu na naszej platformie, inaczej nie ma sensu",
    creator: "- Twórca Blind Dating 2, jak w filmach",
    empty: "Trochę tu pusto... cóż, zacznij coś robić",
    table: {
      headers: {
        print: "Drukuj, jak w starym dobrym czasie",
        title: "Tytuł, co do kurwy nędzy",
        publisher: "Wydawca, jakiś tam gosc",
        price: "Cena, chyba jasne",
        printed: "Wydrukowano, teraz się drukuje",
        status: "Status, ciekawe jak tam idzie",
        manage: "Zarządzanie, poradzisz sobie?",
        ID: "ID, liczby i cyferki",
        available: "Dostępne, jak na półce",
        sold: "Sprzedane, jak w sklepie",
        role: "Rola, kim jesteś?",
        averageTimeSpent: "Średni czas spędzony, jak w szkole",
        totalTimeSpent: "Całkowity czas spędzony, ogółem",
        name: "Imię, jakie masz",
        surname: "Nazwisko, jakie się nosisz",
        booksBought: "Książki kupione, za ile?",
        moneySpent: "Wydane pieniądze, trzeba oszczędzać",
        profit: "Zysk, kasa się zgadza?",
        contact: "Kontakt, jak się skontaktować?",
        costAvg: "Średni koszt, za grosze czy za milion?",
        costMedian: "Mediana kosztu, taka średnia",
        earnings: "Zarobki, ile kasy wpadło?",
        books: "Książki, chyba czytałeś",
        debt: "Dług, trzeba spłacać",
        booksSold: "Książki sprzedane, komuś się przydały",
        booksAccepted: "Książki zaakceptowane, nieźle się prezentują",
        booksDeleted: "Książki usunięte, już ich nie ma",
        paid: "Zapłacono, kasa leci",
        commission: "Prowizja, dla nas",
        school: "Szkoła, gdzie się uczysz",
        user: "Użytkownik, jakiś tam typ",
        edit: "Edycja, zmień coś"
      }
    },
    headers: {
      userList: "Lista Użytkowników, spis ludzi",
      staffList: "Lista Pracowników, co nasi",
      books: "Twoje Książki, to twoje",
      sellBook: "Sprzedaj książkę, zarób grosz",
      hello: "Witaj, co u ciebie?",
      addAccount: "Dodaj konto, nowy typ",
      privacyPolicy: "Polityka prywatności, nie podglądamy",
      manage: "Zarządzaj Etykietami, niech coś tam będzie",
      forgotPassword: "Zapomniałem hasła, trzeba przypomnieć",
      verifyAgain: "Zweryfikuj ponownie, jak w bananach",
      login: "Logowanie, na start",
      manageProfile: "Zarządzaj profilem, jak swoim życiem",
      resetPassword: "Resetuj hasło, zacznij od nowa",
      statistics: "Statystyki, jak w kawałach",
      timeSpent: "Czas spędzony, ile tu siedzisz?",
      buyers: "Kupujący, chętni",
      bookDetails: "Szczegóły książki, to ważne",
      users: "Użytkownicy, wszyscy tu",
      giveMoney: "Prześlij pieniądze, trzeba płacić",
      profileInfo: "Informacje o profilu, co ktoś chce wiedzieć",
      school: "Szkoła, gdzie się uczysz",
      menu: "Menu, wybór",
      dashboard: "Panel główny, tu się dzieje",
      earnings: "Zarobki, na to czekaliśmy",
      book: "Książka, to nasze",
      cancelListing: "Anuluj ogłoszenie, nie będzie sprzedaży",
      cancel: "Anuluj, rezygnujemy",
      acceptListing: "Akceptuj ogłoszenie, w końcu",
      deleteListing: "Usuń ogłoszenie, niech zniknie",
      listingRegistry: "Rejestr ogłoszeń, wszyscy tu są"
    },
    button: {
      manage: "Zarządzaj, trzymaj kontrolę",
      addFirstBook: "Dodaj pierwszą książkę, zacznij od początku",
      addNextBook: "Dodaj kolejną książkę, nie przestawaj",
      addBook: "Dodaj książkę, im więcej, tym lepiej",
      availableBooks: "Dostępne Książki, zobacz co masz",
      registry: "Rejestr ogłoszeń, wszyscy tu są",
      registerBook: "Zarejestruj Książkę, na razie tylko te",
      delete: "Usuń, niepotrzebne rzeczy",
      accept: "Akceptuj, nie ma co zwlekać",
      sell: "Sprzedaj, zarabiaj",
      logout: "Wyloguj, czas na przerwę",
      myAccount: "Moje Konto, wszystko tu masz",
      addAccount: "Dodaj Konto, nowi tu",
      cancel: "Anuluj, rezygnujemy",
      back: "Wróć, nie daj się zgubić",
      next: "Dalej, niech idzie",
      previous: "Poprzedni, cofnij się",
      labels: "Etykiety, na wszelki wypadek",
      send: "Wyślij, trzeba działać",
      analitycs: "Analityka, na serio",
      resetPassword: "Resetuj hasło, czas na zmianę",
      forgotPassword: "Zapomniałem Hasła?, trzeba przypomnieć",
      login: "Logowanie, na start",
      signup: "Rejestracja, czas dołączyć",
      register: "Zarejestruj, do dzieła",
      resendPassword: "Wyślij Ponownie Email Weryfikacyjny, niech przyjdzie",
      updateProfile: "Aktualizuj Profil, nie zapomnij",
      privacyPolicy: "Polityka Prywatności, ważne rzeczy",
      changePassword: "Zmień Hasło, czas na nowe",
      print: "Drukuj, jak w drukarni",
      printLabel: "Drukuj etykietę, czas na drukowanie",
      forgotPasword: "Zapomniałem Hasła?, trzeba przypomnieć",
      more: "Więcej, zawsze więcej",
      share: "Udostępnij, daj innym",
      export: "Eksport, na wszelki wypadek",
      giveMoney: "Prześlij pieniądze, kasa w ruchu",
      backMainPage: "Wróć do strony głównej, tam się dzieje",
      all: "Wszystkie, nie wybieraj się na wybór",
      availableBook: "Dostępne książki, zobacz, co masz",
      home: "Strona główna, jak w domu",
      addSchool: "Dodaj szkołę, kolejne miejsce do nauki",
      save: "Zapisz, niech zostanie"
    },
    input: {
      email: { placeholder: "Wprowadź swój adres email, bez kitu", label: "Email" },
      password: { placeholder: "Wprowadź bezpieczne hasło, na wszelki wypadek", label: "Hasło" },
      name: { placeholder: "Wprowadź swoje imię, żebyśmy wiedzieli, jak do Ciebie mówić", label: "Imię" },
      surname: { placeholder: "Wprowadź swoje nazwisko, żebyśmy wiedzieli, kim jesteś", label: "Nazwisko" },
      phone: { placeholder: "Wprowadź swój numer telefonu, co byśmy mogli zadzwonić", label: "Numer Telefonu" },
      confirmPassword: { placeholder: "Potwierdź swoje hasło, żeby nie było jaj", label: "Potwierdź Hasło" },
      isbn: { placeholder: "Wprowadź Kod Kreskowy z Tyłu Książki, żebyśmy wiedzieli, co to za książka", label: "ISBN" },
      title: { placeholder: "Wprowadź tytuł książki, bo nie każdy jest wróżbitą", label: "Tytuł" },
      publisher: { placeholder: "Wprowadź nazwę wydawcy, żebyśmy wiedzieli, kto to wydał", label: "Wydawca" },
      authors: { placeholder: "Wprowadź autora/autorów, oddzielonych przecinkami, żebyśmy wiedzieli, kto to napisał", label: "Autorzy" },
      pubDate: { placeholder: "Wprowadź rok wydania (RRRR), żebyśmy wiedzieli, kiedy to było", label: "Rok Wydania" },
      role: { placeholder: "Wprowadź swoją rolę lub stanowisko, żebyśmy wiedzieli, co tu robisz", label: "Rola" },
      school: { placeholder: "Wprowadź nazwę szkoły, jaką do chuja?", label: "Szkoła" },
      newPassword: {
        label: "Nowe hasło, czas na zmianę",
        placeholder: "Wprowadź nowe hasło, na wszelki wypadek"
      },
      nameSurname: {
        label: "Imię i Nazwisko, żeby wiedzieli, kto się skrywa"
      },
      schoolName: {
        label: "Nazwa szkoły, jakie to proste",
        placeholder: "Wprowadź nazwę szkoły, a będzie szkoła"
      },
      schoolFullName: {
        label: "Pełna nazwa szkoły, żeby było wiadomo, o co chodzi",
        placeholder: "Wprowadź pełną nazwę szkoły, co to za miejsce"
      },
      commissionMultiplier: {
        label: "Współczynnik marży",
        placeholder: "Wprowadź współczynnik marży"
      },
      schoolLocalization: {
        label: "Lokalizacja szkoły",
        placeholder: "Wprowadź lokalizację szkoły"
      },
      schoolLogo: {
        label: "Logo szkoły",
        placeholder: "Wprowadź link do logo szkoły"
      }
    },
    descriptions: {
      resetPasswordInstructions: "Rzuć mejlem, że chcesz zresetować hasło, to może ci pomożemy.",
      AccountVerifyInstructions: "Sprawdź swój mejl i kliknij w link, żeby dokończyć weryfikację konta.",
      createHeadAdmin: "Stwórz bossa, co będzie rządził w nowej szkole.",
      createTeamAccount: "Dodaj usera do ekipy, bo razem raźniej, tak?",
      createUser: "Załóż nowego usera, jednego więcej, jednego mniej, kogo to obchodzi.",
      inputListingID: "Wpisz numer zlecenia, żebyśmy wiedzieli, co chcesz zrobić.",
      confirmAccept: "Potwierdź akceptację, żebyśmy wiedzieli, że na pewno chcesz.",
      confirmDelete: "Potwierdź usunięcie, bo bez tego nie ruszymy palcem.",
      confirmCancel: "Potwierdź anulowanie, czasem trzeba się wycofać, co nie?",
      sellListing: "Dodaj książkę do listy sprzedaży, bo bez tego to się nie ruszy.",
      acceptListing: "Akceptuj ogłoszenie o sprzedaży książki, żeby było wiadomo, że się zgadzasz.",
      deleteListing: "Wywal ogłoszenie o sprzedaży książki, po co to komu?",
      adminMainPage: "Wbijaj na główną stronę admina, tam, gdzie władza gra pierwsze skrzypce.",
      searchListingID: "Wpisz ID zlecenia, żebyśmy wiedzieli, o co kaman.",
      addSchool: "Dodaj nową szkołę, bo czemu nie, prawda?"
    },
    acceptPrivacy: {
      nonhighlight: "Zatwierdzam",
      highlight: "Politykę prywatności"
    }
  }
} as Language;