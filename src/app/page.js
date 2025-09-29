'use client';
import { useState, useEffect, useCallback } from 'react';
import { FaCopy, FaTimes, FaGithub, FaPlus, FaTrash } from 'react-icons/fa';

const predefinedSubjectsVP1 = [
  "RAČUNALNIŠKA GRAFIKA IN ANIMACIJA",
  "RAČUNALNIŠKA VEČPREDSTAVNOST",
  "NAČRTOVANJE RAČUNALNIŠKIH SISTEMOV",
  "PARALELNO IN PORAZDELJENO RAČUNANJE"
];

const predefinedSubjectsVP2 = [
  "STROJNO UČENJE IN ISKANJE NOVEGA ZNANJA",
  "UVOD V EVOLUCIJSKE ALGORITME",
  "RAČUNALNIŠKA VEČPREDSTAVNOST",
  "RAČUNALNIŠKA GRAFIKA IN ANIMACIJA"
];

const optionalSubjects = [
  "UVOD V VGRAJENE SISTEME",
  "UVOD V RAZVOJ RAČUNALNIŠKIH IGER"
];

export default function CalendarPage() {
  const [scheduleSources, setScheduleSources] = useState([
    {
      id: 1,
      name: 'Main College (FERI)',
      filterId: '0;418,419;0;0;',
      module: 'VP1',
      subjects: [{ name: '', group: '' }]
    }
  ]);
  const [calendarUrl, setCalendarUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleScheduleSourceChange = (sourceId, field, value) => {
    setScheduleSources(prevSources => 
      prevSources.map(source => 
        source.id === sourceId ? { ...source, [field]: value } : source
      )
    );
  };

  const handleSubjectChange = (sourceId, subjectIndex, field, value) => {
    setScheduleSources(prevSources =>
      prevSources.map(source => {
        if (source.id === sourceId) {
          const newSubjects = [...source.subjects];
          newSubjects[subjectIndex][field] = value;
          return { ...source, subjects: newSubjects };
        }
        return source;
      })
    );
  };

  const addSubject = (sourceId) => {
    setScheduleSources(prevSources =>
      prevSources.map(source =>
        source.id === sourceId
          ? { ...source, subjects: [...source.subjects, { name: '', group: '' }] }
          : source
      )
    );
  };

  const removeSubject = (sourceId, subjectIndex) => {
    setScheduleSources(prevSources =>
      prevSources.map(source => {
        if (source.id === sourceId) {
          const newSubjects = source.subjects.filter((_, i) => i !== subjectIndex);
          return { ...source, subjects: newSubjects.length > 0 ? newSubjects : [{ name: '', group: '' }] };
        }
        return source;
      })
    );
  };

  const addScheduleSource = () => {
    const newId = Math.max(...scheduleSources.map(s => s.id)) + 1;
    setScheduleSources(prev => [
      ...prev,
      {
        id: newId,
        name: `Additional College ${newId - 1}`,
        filterId: '',
        module: 'VP1',
        subjects: [{ name: '', group: '' }]
      }
    ]);
  };

  const removeScheduleSource = (sourceId) => {
    if (scheduleSources.length > 1) {
      setScheduleSources(prev => prev.filter(source => source.id !== sourceId));
    }
  };

  const generateUrl = useCallback(() => {
    // Filter out sources that don't have a filterId
    const validSources = scheduleSources.filter(source => source.filterId.trim());
    
    if (validSources.length === 0) {
      return '';
    }

    // Create sources parameter with all schedule sources
    const sourcesParam = validSources.map(source => {
      const subjectParams = source.subjects
        .filter(subject => subject.name.trim()) // Only include subjects with names
        .map(subject => {
          const trimmedName = subject.name.trim();
          const group = subject.group ? subject.group : 'null';
          return `${encodeURIComponent(trimmedName)},${group}`;
        })
        .join(';');
      
      return JSON.stringify({
        filterId: source.filterId,
        module: source.module,
        subjects: subjectParams,
        name: source.name
      });
    });
    
    const encodedSources = encodeURIComponent(JSON.stringify(sourcesParam));
    
    // return `https://feri-calendar.vercel.app/api/calendar?sources=${encodedSources}`;
    return `http://localhost:3003/api/calendar?sources=${encodedSources}`;
  }, [scheduleSources]);

  useEffect(() => {
    const newUrl = generateUrl();
    setCalendarUrl(newUrl);
  }, [scheduleSources, generateUrl]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(calendarUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center uppercase">FERI urnik</h1>
      <p className="text-center">Ustvari svoj personaliziran FERI urnik z več fakultetami</p>
      <div className="text-center mt-4">
        <a
          href="https://github.com/pegi4/feri-urnik-personal-url-google-calendar-generator"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-500"
        >
          <FaGithub size={28} className="inline-block mr-2" />
        </a>
      </div>
      <hr className="my-6" />

      {/* Schedule Sources */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Schedule Sources</h2>
          <button
            onClick={addScheduleSource}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded flex items-center"
          >
            <FaPlus className="mr-2" /> Add College
          </button>
        </div>

        {scheduleSources.map((source) => (
          <div key={source.id} className="border border-gray-300 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                value={source.name}
                onChange={(e) => handleScheduleSourceChange(source.id, 'name', e.target.value)}
                className="text-lg font-semibold bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-500"
              />
              {scheduleSources.length > 1 && (
                <button
                  onClick={() => removeScheduleSource(source.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTrash />
                </button>
              )}
            </div>

            {/* Filter ID */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Filter ID:</label>
              <input
                type="text"
                placeholder="Input your filterId"
                value={source.filterId}
                onChange={(e) => handleScheduleSourceChange(source.id, 'filterId', e.target.value.trim())}
                className="w-full p-2 text-white bg-black border border-gray-500 rounded focus:outline-none focus:bg-gray-800"
              />
            </div>

            {/* Module Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Module:</label>
              <select
                value={source.module}
                onChange={(e) => handleScheduleSourceChange(source.id, 'module', e.target.value)}
                className="w-full p-2 text-white bg-black border border-gray-500 rounded focus:outline-none focus:bg-gray-800"
              >
                <option value="VP1">VP1</option>
                <option value="VP2">VP2</option>
              </select>
            </div>

            {/* Subjects and Groups */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Subjects and Groups:</label>
              {source.subjects.map((subject, subjectIndex) => (
                <div key={subjectIndex} className="flex items-center mb-2 space-x-2">
                  {/* Subject Input - Allow custom input for other colleges */}
                  {source.id === 1 ? (
                    <select
                      value={subject.name}
                      onChange={(e) => handleSubjectChange(source.id, subjectIndex, 'name', e.target.value)}
                      className="p-2 text-white bg-black border border-gray-500 rounded flex-1 focus:outline-none focus:bg-gray-800"
                    >
                      <option value="">Select a subject</option>
                      <optgroup label={`${source.module} Core Subjects`}>
                        {(source.module === 'VP1' ? predefinedSubjectsVP1 : predefinedSubjectsVP2).map((subj) => (
                          <option key={subj} value={subj}>{subj}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Optional Subjects">
                        {optionalSubjects.map((subj) => (
                          <option key={subj} value={subj}>{subj}</option>
                        ))}
                      </optgroup>
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Enter subject name"
                      value={subject.name}
                      onChange={(e) => handleSubjectChange(source.id, subjectIndex, 'name', e.target.value)}
                      className="p-2 text-white bg-black border border-gray-500 rounded flex-1 focus:outline-none focus:bg-gray-800"
                    />
                  )}
                  
                  {/* Group Dropdown */}
                  <select
                    value={subject.group}
                    onChange={(e) => handleSubjectChange(source.id, subjectIndex, 'group', e.target.value)}
                    className="p-2 text-white bg-black border border-gray-500 rounded w-24 focus:outline-none focus:bg-gray-800"
                  >
                    <option value="">Auto</option>
                    <option value="RV">RV (Default)</option>
                    {[...Array(5)].map((_, i) => (
                      <option key={i} value={`RV${i + 1}`}>{`RV${i + 1}`}</option>
                    ))}
                  </select>
                  
                  <button
                    onClick={() => removeSubject(source.id, subjectIndex)}
                    className="text-red-600 font-bold hover:text-red-800 p-2"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addSubject(source.id)}
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
              >
                Add Subject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Generated URL */}
      {calendarUrl && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Generated URL:</h2>
          <div className="flex items-center border border-gray-300 p-2 rounded">
            <input
              type="text"
              value={calendarUrl}
              readOnly
              className="bg-transparent border-none flex-grow text-sm"
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