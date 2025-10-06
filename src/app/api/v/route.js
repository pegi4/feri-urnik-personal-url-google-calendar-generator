import { NextResponse } from 'next/server';

// Hardcoded filterId and subject configurations
const FILTER_ID = '0;0;0;1501,1444,878,912,909,915';

// Subject configurations with their specific filters
const SUBJECT_FILTERS = {
  // RIT subjects
  'UVOD V EVOLUCIJSKE ALGORITME': {
    program: 'RIT',
    module: null, // No filters needed
    group: null
  },
  'STROJNO UČENJE IN ISKANJE NOVEGA ZNANJA': {
    program: 'RIT',
    module: null, // No filters needed
    group: null
  },
  'RAČUNALNIŠKA VEČPREDSTAVNOST': {
    program: 'RIT',
    module: 'VP2',
    group: 'RV3'
  },
  'RAČUNALNIŠKA GRAFIKA IN ANIMACIJA': {
    program: 'RIT',
    module: 'VP1',
    group: 'RV2'
  },
  // IPT subjects
  'INTELIGENTNO UPRAVLJANJE PROCESOV': {
    program: 'IPT',
    module: null,
    group: 'RV2' // RV 2
  },
  'KIBERNETSKA VARNOST': {
    program: 'IPT',
    module: null,
    group: 'RV1' // RV 1
  }
};

function dodajVrstoVSummary(eventLines, vrsta) {
  return eventLines.map(line => {
    if (line.startsWith("SUMMARY:")) {
      const predmet = line.split("SUMMARY:")[1].trim();
      return `SUMMARY:${predmet} (${vrsta})`;
    }
    return line;
  });
}

function filtrirajIcs(data, subjectFilters) {
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
      vrstaDogodka = null;
    } else if (isEvent) {
      currentEvent.push(line);

      if (line.startsWith("SUMMARY:")) {
        currentPredmet = line.split("SUMMARY:")[1].trim();
      }

      if (line.startsWith("DESCRIPTION:")) {
        const description = line.split("DESCRIPTION:")[1].trim();
        const parts = description.split(',');
        const eventType = parts[1]?.trim();
        
        if (eventType?.startsWith("PR")) {
          vrstaDogodka = "Predavanje";
        } else if (eventType === "SV") {
          vrstaDogodka = "Seminarske vaje";
        } else if (eventType === "RV") {
          vrstaDogodka = "Računalniške vaje";
        }
        console.log(`Detected event type for ${currentPredmet}: ${vrstaDogodka} (from "${eventType}")`);
      }

      if (line.startsWith("END:VEVENT")) {
        isEvent = false;
        const eventDescription = currentEvent.join('\n');

        // Check if this subject is in our filter list
        if (currentPredmet && subjectFilters[currentPredmet]) {
          const subjectConfig = subjectFilters[currentPredmet];
          console.log(`Processing event: ${currentPredmet}, Type: ${vrstaDogodka}, Config:`, subjectConfig);

          if (vrstaDogodka) {
            if (vrstaDogodka === "Predavanje" || vrstaDogodka === "Seminarske vaje") {
              // For lectures and seminars, apply module filtering if specified
              if (subjectConfig.module) {
                const isRITProgram = eventDescription.includes('RIT 3 VS') || 
                                   eventDescription.includes('RIT 2 VS');
                
                if (isRITProgram) {
                  const includesModule = eventDescription.includes(`RIT 3 VS ${subjectConfig.module}`) || 
                                        eventDescription.includes(`RIT 2 VS ${subjectConfig.module}`) || 
                                        eventDescription.includes(`RIT 2 VS - ${subjectConfig.module}`);
                  if (!includesModule) continue;
                }
              }
              
              currentEvent = dodajVrstoVSummary(currentEvent, vrstaDogodka);
              filtriraneVrstice.push(...currentEvent);
              
            } else if (vrstaDogodka === "Računalniške vaje") {
              const group = subjectConfig.group;
              
              console.log(`Processing RV for ${currentPredmet}, group: ${group}, description: ${eventDescription.split('\n').find(line => line.startsWith('DESCRIPTION:'))}`);
              
              if (subjectConfig.program === 'RIT') {
                // RIT program - use VP1/VP2 module-based group filtering
                if (subjectConfig.module && group && group !== 'null' && group !== '') {
                  // Specific numbered group selected (RV1, RV2, RV3, etc.)
                  const groupPatterns = [
                    `${subjectConfig.module} ${group}`,           // e.g., "VP2 RV3"
                    `${subjectConfig.module} RV ${group.replace('RV', '')}`, // e.g., "VP2 RV 3"
                    `VS ${subjectConfig.module} ${group}`,        // e.g., "VS VP2 RV3"
                    `VS ${subjectConfig.module} RV ${group.replace('RV', '')}` // e.g., "VS VP2 RV 3"
                  ];
                  
                  const matchesGroup = groupPatterns.some(pattern => eventDescription.includes(pattern));
                  
                  if (matchesGroup) {
                    console.log(`Found specific group ${group} for ${currentPredmet} (RIT program)`);
                    currentEvent = dodajVrstoVSummary(currentEvent, vrstaDogodka);
                    filtriraneVrstice.push(...currentEvent);
                  }
                } else if (!subjectConfig.module && !group) {
                  // No specific filtering needed - include all RV events for this subject
                  console.log(`Including all RV events for ${currentPredmet} (RIT program, no filters)`);
                  currentEvent = dodajVrstoVSummary(currentEvent, vrstaDogodka);
                  filtriraneVrstice.push(...currentEvent);
                }
              } else if (subjectConfig.program === 'IPT') {
                // IPT program - use different group filtering logic
                if (group && group !== 'null' && group !== '') {
                  // Specific numbered group selected (RV1, RV2, etc.) - look for "RV 1", "RV 2" patterns
                  const groupNumber = group.replace('RV', '').trim();
                  const hasMatchingGroup = eventDescription.includes(`RV ${groupNumber}`);
                  
                  if (hasMatchingGroup) {
                    console.log(`Found specific group ${group} for ${currentPredmet} (IPT program)`);
                    currentEvent = dodajVrstoVSummary(currentEvent, vrstaDogodka);
                    filtriraneVrstice.push(...currentEvent);
                  }
                } else {
                  // No specific group selected - include all RV events for this subject
                  console.log(`Including all RV events for ${currentPredmet} (IPT program, no group filter)`);
                  currentEvent = dodajVrstoVSummary(currentEvent, vrstaDogodka);
                  filtriraneVrstice.push(...currentEvent);
                }
              }
            }
          } else {
            console.log(`No event type detected for ${currentPredmet}`);
          }
        }
      }
    }
  }

  return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:WISE TIMETABLE\nX-WR-TIMEZONE:Europe/Ljubljana\n` + filtriraneVrstice.join('\n') + `\nEND:VCALENDAR`;
}

async function fetchCalendar(filterId) {
  const url = `http://calendar.rwx.si/calendar?filterId=${filterId}`;
  console.log(`Fetching calendar from: ${url}`);
  
  try {
    const response = await fetch(url);
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error Response: ${errorText}`);
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.text();
    console.log(`Successfully fetched ${data.length} characters of calendar data`);
    return data;
  } catch (error) {
    console.error('Error fetching calendar:', error);
    if (error.message.includes('fetch')) {
      throw new Error(`Network error: Could not connect to calendar.rwx.si`);
    }
    throw new Error(`Failed to fetch calendar: ${error.message}`);
  }
}

export async function GET(request) {
  console.log('Personal calendar endpoint called with hardcoded filters');
  
  try {
    // Fetch calendar data with hardcoded filterId
    const data = await fetchCalendar(FILTER_ID);
    
    // Apply predefined subject filters
    const filtriraniPodatki = filtrirajIcs(data, SUBJECT_FILTERS);

    return new NextResponse(filtriraniPodatki, {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
      },
    });
  } catch (e) {
    console.error('Error in personal calendar endpoint:', e);
    return NextResponse.json({ 
      error: 'Could not fetch personal calendar', 
      details: e.message 
    }, { status: 500 });
  }
}
