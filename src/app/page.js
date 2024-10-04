'use client';
import { useState, useEffect, useCallback } from 'react';
import { FaCopy, FaTimes } from 'react-icons/fa'; // Import ikone za kopiranje

export default function CalendarPage() {
  const [filterId, setFilterId] = useState('');
  const [subjects, setSubjects] = useState([{ name: '', group: '' }]); // Seznam predmetov in skupin
  const [calendarUrl, setCalendarUrl] = useState('');
  const [copied, setCopied] = useState(false); // Stanje za spremljanje kopiranja

  // Funkcija za posodabljanje posameznega predmeta
  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value; // Ne obrezuj še, dokler ne generiraš URL-ja
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
  const generateUrl = useCallback(() => {
    const subjectParams = subjects
      .map(subject => {
        const trimmedName = subject.name.trim(); 
        const group = subject.group ? subject.group : 'null'; 
        return `${encodeURIComponent(trimmedName)},${group}`;
      })
      .join(';'); 
    return `https://feri-calendar.vercel.app/api/calendar?filterId=${filterId}&subjects=${subjectParams}`;
  }, [filterId, subjects]);

  // useEffect, ki se sproži ob vsaki spremembi filterId ali subjects
  useEffect(() => {
    if (filterId) {
      const newUrl = generateUrl();
      setCalendarUrl(newUrl);
    }
  }, [filterId, subjects, generateUrl]); // Zasleduj spremembe v filterId in subjects

  // Funkcija za kopiranje URL-ja v odložišče
  const copyToClipboard = () => {
    navigator.clipboard.writeText(calendarUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Pokaži obvestilo za 2 sekundi
    });
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Generate your own FERI schedule</h1>

      {/* Vnos za filterId */}
      <div className="mb-4">
        <label className="block text-lg font-semibold mb-2">Filter ID:</label>
        <input
          type="text"
          placeholder="Input your filterId"
          value={filterId}
          onChange={(e) => setFilterId(e.target.value.trim())}
          className="w-full p-2 text-white bg-black border border-gray-500 rounded focus:outline-none focus:bg-gray-800"
        />
      </div>

      {/* Dinamično dodajanje predmetov in skupin */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Subjects and groups:</h2>
        {subjects.map((subject, index) => (
          <div key={index} className="flex items-center mb-4 space-x-4">
            <input
              type="text"
              placeholder="Subject name"
              value={subject.name}
              onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
              className="p-2 text-white bg-black border border-gray-500 rounded w-1/2 focus:outline-none focus:bg-gray-800"
            />

            {/* Dropdown za skupine */}
            <select
              value={subject.group}
              onChange={(e) => handleSubjectChange(index, 'group', e.target.value)}
              className="p-2 text-white bg-black border border-gray-500 rounded w-1/4 focus:outline-none focus:bg-gray-800"
            >
              <option value="">Group (optional)</option>
              {[...Array(10)].map((_, i) => (
                <option key={i} value={i + 1}>{i + 1}</option>
              ))}
            </select>

            <button
              onClick={() => removeSubject(index)}
              className="text-red-600 font-bold hover:text-red-800"
            >
              <FaTimes className="mr-1" /> 
            </button>
          </div>
        ))}
        <button
          onClick={addSubject}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Add subject
        </button>
      </div>

      {/* Prikaz dinamično generiranega URL-ja */}
      {calendarUrl && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Generated URL:</h2>
          <div className="flex items-center bg-gray-100 p-2 rounded">
            <input
              type="text"
              value={calendarUrl}
              readOnly
              className="bg-gray-100 text-black border-none flex-grow text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="ml-4 bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded flex items-center"
            >
              <FaCopy className="mr-1" /> Copy
            </button>
          </div>
          {copied && <span className="text-green-500 mt-2">URL copied!</span>}
        </div>
      )}
    </div>
  );
}
