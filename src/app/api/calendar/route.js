import { NextResponse } from 'next/server';

// Funkcija za pretvorbo query parametrov v predmet-skupina objekt
function parseSubjects(subjectsParam) {
  const subjectArray = subjectsParam.split(';');
  const predmetSkupina = {};

  subjectArray.forEach((item) => {
    const [predmet, skupina] = item.split(',');
    predmetSkupina[predmet] = skupina === 'null' ? null : skupina;
  });

  return predmetSkupina;
}

function dodajVrstoVSummary(eventLines, vrsta) {
  return eventLines.map(line => {
    if (line.startsWith("SUMMARY:")) {
      const predmet = line.split("SUMMARY:")[1].trim();
      return `SUMMARY:${predmet} (${vrsta})\n`;
    }
    return line;
  });
}

function filtrirajIcs(data, predmetSkupina) {
  const lines = data.split('\n');
  let filtriraneVrstice = [];
  let isEvent = false;
  let currentEvent = [];
  let currentPredmet = null;
  let vrstaDogodka = null;

  for (let line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) {
      isEvent = true;
      currentEvent = [];
      currentPredmet = null;
      vrstaDogodka = null;
    }

    if (isEvent) {
      currentEvent.push(line);

      if (line.startsWith("SUMMARY:")) {
        currentPredmet = line.split("SUMMARY:")[1].trim();
      }

      if (line.startsWith("DESCRIPTION:")) {
        const description = line.split("DESCRIPTION:")[1].trim();
        if (description.includes("PR")) {
          vrstaDogodka = "Predavanje";
        } else if (description.includes("SV")) {
          vrstaDogodka = "Seminarske vaje";
        } else if (description.includes("RV")) {
          vrstaDogodka = "Računalniške vaje";
        }
      }
    }

    if (line.startsWith("END:VEVENT")) {
      isEvent = false;
      let eventDescription = currentEvent.join('');

      if (currentPredmet) {
        if (eventDescription.includes("RIT 2 VS")) {
          if (eventDescription.includes("RV")) {
            const match = eventDescription.match(/RV (\d+)/);
            if (match) {
              const skupina = match[1];
              if (predmetSkupina[currentPredmet] === skupina) {
                currentEvent = dodajVrstoVSummary(currentEvent, vrstaDogodka);
                filtriraneVrstice.push(...currentEvent);
              }
            }
          } else {
            currentEvent = dodajVrstoVSummary(currentEvent, vrstaDogodka);
            filtriraneVrstice.push(...currentEvent);
          }
        }
      }
    }
  }

  return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:WISE TIMETABLE\n` + filtriraneVrstice.join('\n') + `\nEND:VCALENDAR`;
}

// Nova funkcija za pridobivanje koledarja iz zunanjega API-ja
async function fetchCalendar(filterId) {
  const url = `http://calendar.rwx.si/calendar?filterId=${filterId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Napaka pri pridobivanju podatkov iz API-ja.');
    }
    const data = await response.text(); // Pridobi vsebino kot besedilo
    return data; // Vrni ICS podatke
  } catch (error) {
    console.error('Napaka pri pridobivanju koledarja:', error);
    throw new Error('Koledarja ni bilo mogoče pridobiti.');
  }
}

// API handler funkcija
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filterId = searchParams.get('filterId');
  const subjectsParam = searchParams.get('subjects');

  if (!filterId || !subjectsParam) {
    return NextResponse.json({ error: 'filterId and subjects are required' }, { status: 400 });
  }

  try {
    // Pridobi predmet-skupina podatke iz URL-ja
    const predmetSkupina = parseSubjects(subjectsParam);

    // Pridobi podatke iz API-ja z uporabo nove funkcije fetchCalendar
    const data = await fetchCalendar(filterId);

    // Filtriraj podatke s pomočjo predmeta in skupin
    const filtriraniPodatki = filtrirajIcs(data, predmetSkupina);

    // Vrni filtrirane podatke kot odgovor
    return new NextResponse(filtriraniPodatki, {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
      }
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Could not fetch calendar', details: e.message }, { status: 500 });
  }
}
