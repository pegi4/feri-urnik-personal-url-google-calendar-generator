import { NextResponse } from 'next/server';

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
      return `SUMMARY:${predmet} (${vrsta})`;
    }
    return line;
  });
}

function filtrirajIcs(data, module, predmetSkupina) {
  const lines = data.split('\n');
  let filtriraneVrstice = [];
  let isEvent = false;
  let currentEvent = [];
  let currentPredmet = null;
  let vrstaDogodka = null;

  for (let line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) {
      isEvent = true;
      currentEvent = [line];
      currentPredmet = null;
      vrstaDogodka = null; // Reset for each new event
    } else if (isEvent) {
      currentEvent.push(line);

      if (line.startsWith("SUMMARY:")) {
        currentPredmet = line.split("SUMMARY:")[1].trim();
      }

      if (line.startsWith("DESCRIPTION:")) {
        const description = line.split("DESCRIPTION:")[1].trim();
        const parts = description.split(','); // Split by comma
        const eventType = parts[1]?.trim(); // Second element is the event type (PR, SV, RV)
        
        if (eventType === "PR") {
          vrstaDogodka = "Predavanje";
        } else if (eventType === "SV") {
          vrstaDogodka = "Seminarske vaje";
        } else if (eventType === "RV") {
          vrstaDogodka = "Računalniške vaje";
        }
        console.log(`Detected event type for ${currentPredmet}: ${vrstaDogodka} (from "${eventType}")`); // Debugging
      }

      if (line.startsWith("END:VEVENT")) {
        isEvent = false;
        const eventDescription = currentEvent.join('\n');

        if (currentPredmet && predmetSkupina[currentPredmet] !== undefined) {
          const includesModule = eventDescription.includes(`RIT 2 VS - ${module}`);
          if (!includesModule) continue; // Skip if module doesn’t match

          console.log(`Processing event: ${currentPredmet}, Type: ${vrstaDogodka}, Module: ${module}`); // Debugging

          if (vrstaDogodka) { // Ensure vrstaDogodka is set
            if (vrstaDogodka === "Predavanje" || vrstaDogodka === "Seminarske vaje") {
              currentEvent = dodajVrstoVSummary(currentEvent, vrstaDogodka);
              filtriraneVrstice.push(...currentEvent);
            } else if (vrstaDogodka === "Računalniške vaje") {
              const group = predmetSkupina[currentPredmet];
              if (group && eventDescription.includes(`${module} ${group}`)) {
                currentEvent = dodajVrstoVSummary(currentEvent, vrstaDogodka);
                filtriraneVrstice.push(...currentEvent);
              } else if (!group) {
                currentEvent = dodajVrstoVSummary(currentEvent, vrstaDogodka);
                filtriraneVrstice.push(...currentEvent);
              }
            }
          } else {
            console.log(`No event type detected for ${currentPredmet}`); // Debugging
          }
        }
      }
    }
  }

  return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:WISE TIMETABLE\nX-WR-TIMEZONE:Europe/Ljubljana\n` + filtriraneVrstice.join('\n') + `\nEND:VCALENDAR`;
}

async function fetchCalendar(filterId) {
  const url = `http://calendar.rwx.si/calendar?filterId=${filterId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Napaka pri pridobivanju podatkov iz API-ja.');
    }
    return await response.text();
  } catch (error) {
    console.error('Napaka pri pridobivanju koledarja:', error);
    throw new Error('Koledarja ni bilo mogoče pridobiti.');
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filterId = searchParams.get('filterId');
  const ModuleModule = searchParams.get('module');
  const subjectsParam = searchParams.get('subjects');

  if (!filterId || !ModuleModule || !subjectsParam) {
    return NextResponse.json({ error: 'filterId, module, and subjects are required' }, { status: 400 });
  }

  try {
    const predmetSkupina = parseSubjects(subjectsParam);
    const data = await fetchCalendar(filterId);
    const filtriraniPodatki = filtrirajIcs(data, ModuleModule, predmetSkupina);

    return new NextResponse(filtriraniPodatki, {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Could not fetch calendar', details: e.message }, { status: 500 });
  }
}