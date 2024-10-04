import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

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

async function getTitles(page, filterId) {
  const subjectFilter = filterId.split(';', 4).pop();
  if (subjectFilter !== '0') {
    const ids = subjectFilter.split(',');
    return await page.evaluate((ids) => {
      return ids.map(id => document.querySelector(`tr[data-rk="${id}"]`).querySelector('span').innerHTML);
    }, ids);
  }
  return null;
}

async function clickExport(page) {
  await page.evaluate(() => {
    const node = document.querySelector('a[title="Izvoz celotnega urnika v ICS formatu  "]');
    if (node == null) {
      throw 'Export button not found';
    }
    const handler = node.getAttributeNode('onclick').nodeValue;
    node.setAttribute('onclick', handler.replace('_blank', '_self'));
    node.click();
  });
}

function setupDownloadHook(page, cookies) {
  return new Promise(resolve => {
    page.on('request', async request => {
      if (request.url() === 'https://www.wise-tt.com/wtt_um_feri/TextViewer') {
        const response = await fetch(request.url(), {
          headers: {
            ...request.headers(),
            'cookie': cookies.map(cookie => `${cookie.name}=${cookie.value}`).join(';'),
          }
        });
        const data = await response.text();
        resolve(data);
      } else {
        request.continue(); // Redirect 302
      }
    });
  });
}

async function fetchCalendar(filterId) {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`https://www.wise-tt.com/wtt_um_feri/index.jsp?filterId=${filterId}`);

    await page.setRequestInterception(true);
    const cookies = await page.cookies();
    const download = setupDownloadHook(page, cookies);
    const titles = await getTitles(page, filterId);

    await clickExport(page);
    let data = await download;

    if (titles != null) {
      data = data.replace(/\s*BEGIN:VEVENT[\s\S]*?END:VEVENT\s*/g, event => {
        return titles.some(title => event.includes(`SUMMARY:${title}`)) ? event : '';
      });
    }

    const position = data.indexOf('BEGIN:VEVENT');
    data = data.substr(0, position) + 'X-WR-TIMEZONE:Europe/Ljubljana\n' + data.substr(position);

    return data;
  } finally {
    await browser.close();
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

    // Pridobi podatke iz WISE Timetable preko puppeteerja
    const data = await fetchCalendar(filterId); // Tukaj uporabi `filterId`, ne `subjectsParam`

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
