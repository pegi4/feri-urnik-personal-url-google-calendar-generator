'use client';
import { useState, useEffect, useCallback } from 'react';
import { FaCopy, FaTimes, FaGithub } from 'react-icons/fa';

export default function CalendarPage() {
  const [filterId, setFilterId] = useState('');
  const [module, setModule] = useState('VP1'); // Default to VP1
  const [subjects, setSubjects] = useState([{ name: '', group: '' }]);
  const [calendarUrl, setCalendarUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  const addSubject = () => {
    setSubjects([...subjects, { name: '', group: '' }]);
  };

  const removeSubject = (index) => {
    const newSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(newSubjects);
  };

  const generateUrl = useCallback(() => {
    const subjectParams = subjects
      .map(subject => {
        const trimmedName = subject.name.trim();
        const group = subject.group ? subject.group : 'null';
        return `${encodeURIComponent(trimmedName)},${group}`;
      })
      .join(';');
    return `https://feri-calendar.vercel.app/api/calendar?filterId=${filterId}&module=${module}&subjects=${subjectParams}`;
    //return `http://localhost:3000/api/calendar?filterId=${filterId}&module=${module}&subjects=${subjectParams}`;
  }, [filterId, module, subjects]);

  useEffect(() => {
    if (filterId) {
      const newUrl = generateUrl();
      setCalendarUrl(newUrl);
    }
  }, [filterId, module, subjects, generateUrl]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(calendarUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center uppercase">FERI urnik</h1>
      <p className="text-center">Ustvari svoj personaliziran FERI urnik</p>
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

      {/* Filter ID */}
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

      {/* Module Selection (VP1 or VP2) */}
      <div className="mb-4">
        <label className="block text-lg font-semibold mb-2">Module:</label>
        <select
          value={module}
          onChange={(e) => setModule(e.target.value)}
          className="w-full p-2 text-white bg-black border border-gray-500 rounded focus:outline-none focus:bg-gray-800"
        >
          <option value="VP1">VP1</option>
          <option value="VP2">VP2</option>
        </select>
      </div>

      {/* Subjects and Groups */}
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
            <select
              value={subject.group}
              onChange={(e) => handleSubjectChange(index, 'group', e.target.value)}
              className="p-2 text-white bg-black border border-gray-500 rounded w-1/4 focus:outline-none focus:bg-gray-800"
            >
              <option value="">Group (optional)</option>
              {[...Array(5)].map((_, i) => (
                <option key={i} value={`RV${i + 1}`}>{`RV${i + 1}`}</option>
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

      {/* Generated URL */}
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