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

        if (currentPredmet && predmetSkupina[currentPredmet] !== undefined) {
          // Check if this is a RIT program (uses VP1/VP2 modules)
          const isRITProgram = eventDescription.includes('RIT 3 VS') || 
                              eventDescription.includes('RIT 2 VS');
          
          if (isRITProgram && module) {
            // For RIT programs with a module specified, apply module filtering (VP1/VP2)
            const includesModule = eventDescription.includes(`RIT 3 VS ${module}`) || 
                                  eventDescription.includes(`RIT 2 VS ${module}`) || 
                                  eventDescription.includes(`RIT 2 VS - ${module}`);
            if (!includesModule) continue;
          }
          // For non-RIT programs (IPT, etc.), skip module filtering - include all events for the subject

          console.log(`Processing event: ${currentPredmet}, Type: ${vrstaDogodka}, Module: ${module}`);

          if (vrstaDogodka) {
            if (vrstaDogodka === "Predavanje" || vrstaDogodka === "Seminarske vaje") {
              currentEvent = dodajVrstoVSummary(currentEvent, vrstaDogodka);
              filtriraneVrstice.push(...currentEvent);
            } else if (vrstaDogodka === "Računalniške vaje") {
              const group = predmetSkupina[currentPredmet];
              
              console.log(`Processing RV for ${currentPredmet}, group: ${group}, description: ${eventDescription.split('\n').find(line => line.startsWith('DESCRIPTION:'))}`);
              
              if (isRITProgram) {
                // RIT program - use VP1/VP2 module-based group filtering
                if (group && group !== 'null' && group !== '' && group !== 'RV') {
                  // Specific numbered group selected (RV1, RV2, etc.)
                  const groupPatterns = [
                    `${module} ${group}`,           // e.g., "VP2 RV1"
                    `${module} RV ${group.replace('RV', '')}`, // e.g., "VP2 RV 1"
                    `VS ${module} ${group}`,        // e.g., "VS VP2 RV1"
                    `VS ${module} RV ${group.replace('RV', '')}` // e.g., "VS VP2 RV 1"
                  ];
                  
                  const matchesGroup = groupPatterns.some(pattern => eventDescription.includes(pattern));
                  
                  if (matchesGroup) {
                    console.log(`Found specific group ${group} for ${currentPredmet} (RIT program)`);
                    currentEvent = dodajVrstoVSummary(currentEvent, vrstaDogodka);
                    filtriraneVrstice.push(...currentEvent);
                  }
                } else {
                  // No specific group selected OR "RV (Default)" selected - include RV events for this module
                  const hasModuleMatch = eventDescription.includes(`VS ${module}`);
                  
                  if (hasModuleMatch) {
                    // Check if it's a generic RV event (no specific group number) OR if we want all RV events
                    const hasSpecificGroup = /RV \d+/.test(eventDescription);
                    
                    if (!hasSpecificGroup || group === 'RV' || !group || group === 'null') {
                      console.log(`Including RV event for ${currentPredmet} (RIT program, default/generic group)`);
                      currentEvent = dodajVrstoVSummary(currentEvent, vrstaDogodka);
                      filtriraneVrstice.push(...currentEvent);
                    }
                  }
                }
              } else {
                // Non-RIT program (IPT, etc.) - use different group filtering logic
                if (group && group !== 'null' && group !== '' && group !== 'RV') {
                  // Specific numbered group selected (RV1, RV2, etc.) - look for "RV 1", "RV 2" patterns
                  const groupNumber = group.replace('RV', '').trim();
                  const hasMatchingGroup = eventDescription.includes(`RV ${groupNumber}`);
                  
                  if (hasMatchingGroup) {
                    console.log(`Found specific group ${group} for ${currentPredmet} (non-RIT program)`);
                    currentEvent = dodajVrstoVSummary(currentEvent, vrstaDogodka);
                    filtriraneVrstice.push(...currentEvent);
                  }
                } else {
                  // No specific group selected - include all RV events for this subject
                  console.log(`Including RV event for ${currentPredmet} (non-RIT program, all groups)`);
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

function mergeCalendars(calendarDataArray) {
  if (calendarDataArray.length === 0) {
    return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:WISE TIMETABLE\nX-WR-TIMEZONE:Europe/Ljubljana\nEND:VCALENDAR`;
  }
  
  if (calendarDataArray.length === 1) {
    return calendarDataArray[0];
  }
  
  // Extract all events from all calendars
  const allEvents = [];
  const eventSet = new Set(); // To track unique events and avoid duplicates
  const conflictingEvents = []; // To track time conflicts
  
  calendarDataArray.forEach((calendarData, sourceIndex) => {
    const lines = calendarData.split('\n');
    let isEvent = false;
    let currentEvent = [];
    
    for (let line of lines) {
      if (line.startsWith("BEGIN:VEVENT")) {
        isEvent = true;
        currentEvent = [line];
      } else if (isEvent) {
        currentEvent.push(line);
        
        if (line.startsWith("END:VEVENT")) {
          isEvent = false;
          
          // Create a unique identifier for the event (UID + DTSTART + SUMMARY)
          const eventKey = generateEventKey(currentEvent);
          
          if (!eventSet.has(eventKey)) {
            eventSet.add(eventKey);
            
            // Check for time conflicts with existing events
            const eventTime = extractEventTime(currentEvent);
            const conflicts = findTimeConflicts(allEvents, eventTime);
            
            if (conflicts.length > 0) {
              console.warn(`Time conflict detected for event: ${eventTime.summary}`);
              console.warn(`Conflicts with: ${conflicts.map(c => c.summary).join(', ')}`);
              
              // Add conflict warning to event description
              const modifiedEvent = addConflictWarning(currentEvent, conflicts);
              allEvents.push(...modifiedEvent);
              conflictingEvents.push({
                event: eventTime,
                conflicts: conflicts
              });
            } else {
              allEvents.push(...currentEvent);
            }
          } else {
            console.log(`Duplicate event detected and skipped: ${eventKey}`);
          }
        }
      }
    }
  });
  
  // Log summary of conflicts
  if (conflictingEvents.length > 0) {
    console.log(`\nSummary: Found ${conflictingEvents.length} time conflicts:`);
    conflictingEvents.forEach((conflict, index) => {
      console.log(`${index + 1}. ${conflict.event.summary} (${conflict.event.startTime}) conflicts with:`);
      conflict.conflicts.forEach(c => {
        console.log(`   - ${c.summary} (${c.startTime})`);
      });
    });
  }
  
  // Sort events by start time for better organization
  const sortedEvents = sortEventsByDateTime(allEvents);
  
  // Build merged calendar
  return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:WISE TIMETABLE\nX-WR-TIMEZONE:Europe/Ljubljana\n` + 
         sortedEvents.join('\n') + 
         `\nEND:VCALENDAR`;
}

function generateEventKey(eventLines) {
  let uid = '';
  let dtstart = '';
  let summary = '';
  
  eventLines.forEach(line => {
    if (line.startsWith("UID:")) {
      uid = line;
    } else if (line.startsWith("DTSTART")) {
      dtstart = line;
    } else if (line.startsWith("SUMMARY:")) {
      summary = line;
    }
  });
  
  return `${uid}|${dtstart}|${summary}`;
}

function sortEventsByDateTime(eventLines) {
  // Group lines into events
  const events = [];
  let currentEvent = [];
  
  eventLines.forEach(line => {
    if (line.startsWith("BEGIN:VEVENT")) {
      currentEvent = [line];
    } else if (line.startsWith("END:VEVENT")) {
      currentEvent.push(line);
      events.push([...currentEvent]);
      currentEvent = [];
    } else {
      currentEvent.push(line);
    }
  });
  
  // Sort events by DTSTART
  events.sort((a, b) => {
    const getStartTime = (event) => {
      const dtStartLine = event.find(line => line.startsWith("DTSTART"));
      return dtStartLine ? dtStartLine.split(':')[1] || '' : '';
    };
    
    const startA = getStartTime(a);
    const startB = getStartTime(b);
    return startA.localeCompare(startB);
  });
  
  // Flatten back to lines
  return events.flat();
}

function extractEventTime(eventLines) {
  let startTime = '';
  let endTime = '';
  let summary = '';
  
  eventLines.forEach(line => {
    if (line.startsWith("DTSTART")) {
      startTime = line.split(':')[1] || '';
    } else if (line.startsWith("DTEND")) {
      endTime = line.split(':')[1] || '';
    } else if (line.startsWith("SUMMARY:")) {
      summary = line.split("SUMMARY:")[1] || '';
    }
  });
  
  return { startTime, endTime, summary };
}

function findTimeConflicts(existingEvents, newEventTime) {
  const conflicts = [];
  
  // Group existing events
  const existingEventGroups = [];
  let currentEvent = [];
  
  existingEvents.forEach(line => {
    if (line.startsWith("BEGIN:VEVENT")) {
      currentEvent = [line];
    } else if (line.startsWith("END:VEVENT")) {
      currentEvent.push(line);
      existingEventGroups.push([...currentEvent]);
      currentEvent = [];
    } else {
      currentEvent.push(line);
    }
  });
  
  // Check each existing event for time overlap
  existingEventGroups.forEach(eventGroup => {
    const existingEventTime = extractEventTime(eventGroup);
    
    if (hasTimeOverlap(newEventTime, existingEventTime)) {
      conflicts.push(existingEventTime);
    }
  });
  
  return conflicts;
}

function hasTimeOverlap(event1, event2) {
  // Convert time strings to comparable format
  const start1 = event1.startTime;
  const end1 = event1.endTime;
  const start2 = event2.startTime;
  const end2 = event2.endTime;
  
  // Check if events overlap: start1 < end2 && start2 < end1
  return start1 < end2 && start2 < end1;
}

function addConflictWarning(eventLines, conflicts) {
  const modifiedLines = [];
  let descriptionFound = false;
  
  eventLines.forEach(line => {
    if (line.startsWith("DESCRIPTION:")) {
      descriptionFound = true;
      const conflictText = conflicts.map(c => c.summary).join(', ');
      const newDescription = `${line} ⚠️ TIME CONFLICT with: ${conflictText}`;
      modifiedLines.push(newDescription);
    } else if (line.startsWith("END:VEVENT") && !descriptionFound) {
      // Add description if it doesn't exist
      const conflictText = conflicts.map(c => c.summary).join(', ');
      modifiedLines.push(`DESCRIPTION:⚠️ TIME CONFLICT with: ${conflictText}`);
      modifiedLines.push(line);
    } else {
      modifiedLines.push(line);
    }
  });
  
  return modifiedLines;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Check for new multi-source format
  const sourcesParam = searchParams.get('sources');
  
  if (sourcesParam) {
    return handleMultipleSourcesRequest(sourcesParam);
  }
  
  // Fallback to legacy single-source format for backward compatibility
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

async function handleMultipleSourcesRequest(sourcesParam) {
  try {
    const sources = JSON.parse(decodeURIComponent(sourcesParam));
    const parsedSources = sources.map(sourceStr => JSON.parse(sourceStr));
    
    console.log('Processing multiple sources:', parsedSources.map(s => ({ name: s.name, filterId: s.filterId })));
    
    // Fetch all calendars in parallel
    const calendarPromises = parsedSources.map(async (source) => {
      try {
        const data = await fetchCalendar(source.filterId);
        const predmetSkupina = parseSubjects(source.subjects);
        const filteredData = filtrirajIcs(data, source.module, predmetSkupina);
        return { source: source.name, data: filteredData, success: true };
      } catch (error) {
        console.error(`Error fetching calendar for ${source.name}:`, error);
        return { source: source.name, error: error.message, success: false };
      }
    });
    
    const results = await Promise.all(calendarPromises);
    const successfulResults = results.filter(result => result.success);
    const failedResults = results.filter(result => !result.success);
    
    if (successfulResults.length === 0) {
      return NextResponse.json({ 
        error: 'Could not fetch any calendars', 
        details: failedResults.map(r => `${r.source}: ${r.error}`)
      }, { status: 500 });
    }
    
    // Merge all successful calendars
    const mergedCalendar = mergeCalendars(successfulResults.map(r => r.data));
    
    // Log any failures but still return merged result
    if (failedResults.length > 0) {
      console.warn('Some calendars failed to load:', failedResults);
    }
    
    return new NextResponse(mergedCalendar, {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
      },
    });
    
  } catch (e) {
    console.error('Error processing multiple sources:', e);
    return NextResponse.json({ 
      error: 'Could not process multiple calendar sources', 
      details: e.message 
    }, { status: 500 });
  }
}