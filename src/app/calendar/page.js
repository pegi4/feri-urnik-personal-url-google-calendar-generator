'use client';
import { useState, useEffect } from 'react';

export default function CalendarPage() {
  const [filterId, setFilterId] = useState('');
  const [subjects, setSubjects] = useState([{ name: '', group: '' }]); // Seznam predmetov in skupin
  const [calendarUrl, setCalendarUrl] = useState('');

  // Funkcija za posodabljanje posameznega predmeta
  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  // Funkcija za dodajanje novega predmeta
  const addSubject = () => {
    setSubjects([...subjects, { name: '', group: '' }]);
  };

  // Funkcija za odstranjevanje predmeta
  const removeSubject = (index) => {
    const newSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(newSubjects);
  };

  // Funkcija za generiranje URL-ja
  const generateUrl = () => {
    // Pretvori predmete in skupine v obliko primerne za URL (ime predmeta, skupina)
    const subjectParams = subjects
      .map(subject => {
        const group = subject.group ? subject.group : 'null'; // Če ni skupine, uporabi "null"
        return `${encodeURIComponent(subject.name)},${group}`;
      })
      .join(';'); // Predmeti so ločeni s ";"

    // Ustvari URL z filterId in subjects parametrom
    return `/api/calendar?filterId=${filterId}&subjects=${subjectParams}`;
  };

  // useEffect, ki se sproži ob vsaki spremembi filterId ali subjects
  useEffect(() => {
    if (filterId) {
      const newUrl = generateUrl();
      setCalendarUrl(newUrl);
    }
  }, [filterId, subjects]); // Zasleduj spremembe v filterId in subjects

  return (
    <div>
      <h1>Generiraj svoj urnik</h1>

      {/* Vnos za filterId */}
      <div>
        <label>Filter ID:</label>
        <input
          type="text"
          placeholder="Vnesi svoj filterId"
          value={filterId}
          onChange={(e) => setFilterId(e.target.value)}
          style={{ backgroundColor: '#000', color: '#fff', border: '1px solid #ccc', padding: '8px', borderRadius: '4px' }}
          onFocus={(e) => e.target.style.backgroundColor = '#333'}
          onBlur={(e) => e.target.style.backgroundColor = '#000'}
        />
      </div>

      {/* Dinamično dodajanje predmetov in skupin */}
      <div>
        <h2>Predmeti in skupine:</h2>
        {subjects.map((subject, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Ime predmeta"
              value={subject.name}
              onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
              style={{ backgroundColor: '#000', color: '#fff', border: '1px solid #ccc', padding: '8px', borderRadius: '4px' }}
              onFocus={(e) => e.target.style.backgroundColor = '#333'}
              onBlur={(e) => e.target.style.backgroundColor = '#000'}
            />
            <input
              type="text"
              placeholder="Skupina (opcijsko)"
              value={subject.group}
              onChange={(e) => handleSubjectChange(index, 'group', e.target.value)}
              style={{ backgroundColor: '#000', color: '#fff', border: '1px solid #ccc', padding: '8px', borderRadius: '4px', marginLeft: '10px' }}
              onFocus={(e) => e.target.style.backgroundColor = '#333'}
              onBlur={(e) => e.target.style.backgroundColor = '#000'}
            />
            <button onClick={() => removeSubject(index)} style={{ marginLeft: '10px' }}>Odstrani</button>
          </div>
        ))}
        <button onClick={addSubject}>Dodaj predmet</button>
      </div>

      {/* Prikaz dinamično generiranega URL-ja */}
      {calendarUrl && (
        <div>
          <h2>Generated URL:</h2>
          <a href={calendarUrl}>{calendarUrl}</a>
        </div>
      )}
    </div>
  );
}
