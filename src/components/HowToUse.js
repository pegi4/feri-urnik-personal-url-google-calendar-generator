export default function HowToUse() {
  return (
    <div className="p-8 font-sans mt-6 max-w-lg mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Kako se to uporablja?
      </h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Pregled</h2>
        <p className="text-gray-300">
          To orodje vam omogoča generiranje prilagojenega URL-ja za iCalendar na
          podlagi vašega osebnega urnika iz platforme Wise Time Table. 
          Generirani URL lahko nato dodate v Google Koledar ali druge aplikacije za koledar za enostavno sinhronizacijo. 
          Lahko določite predmete, pri katerih ste vpisani, in ustrezne skupine za vsak predmet.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Zakaj?</h2>
        <p className="text-gray-300">
          Wise Time Table izvozi iCalendar datoteke z vsemi predmeti, zaradi česar je lahko nerodno 
          izločiti nepomembne predmete. To orodje poenostavi postopek, saj vam omogoča, 
          da določite, katere predmete in skupine želite vključiti v koledar. 
          Rezultat je čist, prilagojen koledar, ki prikazuje le dogodke, ki so pomembni za vas.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Rešitev</h2>
        <p className="text-gray-300 mb-2">Generator URL-jev koledarja vam omogoča:</p>
        <ul className="list-disc list-inside text-gray-300 mb-4">
          <li>
            Vnesite svoj <strong>Filter ID</strong> (iz Wise Time Table) in izberite predmete in skupine, katerih del ste.
          </li>
          <li>
            Samodejno generirajte URL, ki ga lahko dodate v svoj Google Koledar za samodejno sinhronizacijo.
          </li>
          <li>
            Prilagodite predmete in številke skupin ter prejmite samo dogodke, pomembne za vaš urnik.
          </li>
        </ul>
        <p className="text-gray-300">
          Ko imate URL, ga preprosto kopirate in prilepite v Google Koledar, Thunderbird ali katero koli drugo aplikacijo, ki podpira iCalendar URL-je.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Uporaba</h2>

        <h3 className="text-lg font-semibold text-gray-200 mb-2">
          1. Vnesite Filter ID:
        </h3>
        <p className="text-gray-300 mb-4">
          Pomaknite se na spletno stran Wise Time Table in ustvarite FilterID tako, 
          da izberete svoje želene možnosti urnika. FilterID lahko pridobite tako, 
          da na spletnem mestu urnika izberete želene možnosti in nato kliknete na ikono knjige v zgornjem levem kotu. 
          Dobite stalno povezavo, nato pa morate samo kopirati del FilterID. Na primer, v povezavi:{" "}
          <span className="block rounded-md p-2 mt-2">
            https://www.wise-tt.com/wtt_um_feri/index.jsp?filterId=0;37;0;0
          </span>
          je{" "}
          <code className="text-sm bg-gray-300 text-rose-800 px-2 py-1 rounded">
            0;37;0;0
          </code>{" "}
          vrednost, ki jo morate vnesti v generator.
        </p>

        <h3 className="text-lg font-semibold text-gray-200 mb-2">
          2. Dodajte predmete in skupine:
        </h3>
        <p className="text-gray-300 mb-4">
          Določite predmete, ki jih želite vključiti v svoj koledar. Za vsak predmet lahko določite tudi številko skupine, če je to potrebno. 
          Če predmet nima skupinskih sej (npr. predavanja), lahko polje za skupino pustite prazno ali uporabite &quot;null&quot; kot nadomestek.
        </p>

        <h3 className="text-lg font-semibold text-gray-200 mb-2">
          3. Ustvarite URL:
        </h3>
        <p className="text-gray-300 mb-4">
          Ko ste vnesli svoje predmete in skupine, bo orodje samodejno ustvarilo URL. Ta URL bo kazal na filtrirano različico vašega urnika, vključno samo z ustreznimi predmeti in sejami.
        </p>

        <h3 className="text-lg font-semibold text-gray-200 mb-2">
          4. Kopirajte URL:
        </h3>
        <p className="text-gray-300 mb-4">
          Uporabite gumb za kopiranje, da preprosto kopirate URL v svoj odložišče. Nato lahko ta URL prilepite v Google Koledar ali katero koli drugo aplikacijo, ki podpira iCal naročnine.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-200 mb-4">Primer URL-ja:</h2>
        <span className="block bg-gray-200 text-rose-800 rounded-md p-2 text-sm">
          http://yourapp.com/api/calendar?filterId=0;37;0;0&subjects=SUBJECT1,1;SUBJECT2,3;SUBJECT3,null
        </span>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-200 mb-4">
          Integracija z Google Koledarjem
        </h2>
        <p className="text-gray-300">Za integracijo z Google Koledarjem:</p>
        <ul className="list-decimal list-inside text-gray-300 mb-4">
          <li>Odprite Google Koledar.</li>
          <li>
            Na levi strani kliknite ikono &quot;+&quot; poleg &quot;Drugi koledarji&quot; in izberite &quot;Iz URL-ja.&quot;
          </li>
          <li>Prilepite URL, ki ga je ustvarilo orodje.</li>
          <li>Kliknite &quot;Dodaj koledar.&quot;</li>
        </ul>
        <p className="text-gray-300">
          Vaš koledar se bo samodejno sinhroniziral z dogodki, filtriranimi na podlagi izbranih predmetov in skupin.
        </p>
      </section>
    </div>
  );
}
