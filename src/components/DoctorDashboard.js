





import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Building2, Search } from 'lucide-react';

export default function DoctorDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [specialities, setSpecialities] = useState([]);
  const [selectedSpecialities, setSelectedSpecialities] = useState([]);
  const [consultationMode, setConsultationMode] = useState('all');

  useEffect(() => {
    axios.get('https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json')
      .then(response => {
        const fetchedDoctors = Array.isArray(response.data) ? response.data : [response.data];
        setDoctors(fetchedDoctors);

        const allSpecialities = fetchedDoctors.flatMap(doc =>
          doc.specialities?.map(spec => spec.name) || []
        );
        const uniqueSpecialities = [...new Set(allSpecialities)];
        setSpecialities(uniqueSpecialities);
      })
      .catch(error => console.error('Error fetching doctors:', error));
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value.trim() === '') {
      setSuggestions([]);
    } else {
      const matches = doctors.filter(doc => doc.name.toLowerCase().includes(value.toLowerCase()));
      setSuggestions(matches.slice(0, 3));
    }
  };

  const handleSuggestionClick = (name) => {
    setSearchInput(name);
    setSuggestions([]);
  };

  const getNumberFromString = (str) => {
    const num = str?.match(/\d+/);
    return num ? parseInt(num[0]) : 0;
  };

  const handleSpecialityToggle = (spec) => {
    setSelectedSpecialities((prev) =>
      prev.includes(spec)
        ? prev.filter(s => s !== spec)
        : [...prev, spec]
    );
  };

  const handleConsultationModeChange = (mode) => {
    setConsultationMode(mode);
  };

  const filteredDoctors = [...doctors]
    .filter(doc =>
      doc.name.toLowerCase().includes(searchInput.toLowerCase()) &&
      (selectedSpecialities.length === 0 ||
        doc.specialities?.some(spec => selectedSpecialities.includes(spec.name))) &&
      (consultationMode === 'all' ||
        (consultationMode === 'video' && doc.video_consult) ||
        (consultationMode === 'in_clinic' && doc.in_clinic))
    )
    .sort((a, b) => {
      if (sortBy === 'price') {
        return getNumberFromString(a.fees) - getNumberFromString(b.fees);
      } else if (sortBy === 'experience') {
        return getNumberFromString(b.experience) - getNumberFromString(a.experience);
      }
      return 0;
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      {/* Search Bar */}
      <div className="relative mb-8">
        <input
          type="text"
          className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search doctor by name..."
          value={searchInput}
          onChange={handleSearchChange}
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search size={18} />
        </div>
        {suggestions.length > 0 && (
          <ul className="absolute bg-white border w-full mt-1 rounded shadow z-10">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="p-3 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion.name)}
              >
                {suggestion.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Filter & Sort Panel */}
      <div className="grid md:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="bg-white p-5 rounded-xl shadow space-y-6">
          <h3 className="font-semibold text-gray-700">Filters</h3>

          {/* Consultation Mode Filter */}
          <div>
            <h4 className="text-sm font-medium mb-2">Mode of consultation</h4>
            <div className="flex flex-col gap-2">
              {['video', 'in_clinic', 'all'].map(mode => (
                <label key={mode} className="flex items-center gap-2 text-sm capitalize">
                  <input
                    type="radio"
                    name="consultation-mode"
                    checked={consultationMode === mode}
                    onChange={() => handleConsultationModeChange(mode)}
                  />
                  {mode.replace('_', '-')} Consultation
                </label>
              ))}
            </div>
          </div>

          {/* Specialities Filter */}
          <div>
            <h4 className="text-sm font-medium mb-2">Specialities</h4>
            <div className="flex flex-col gap-2 max-h-60 overflow-auto">
              {specialities.map((spec, index) => (
                <label key={index} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedSpecialities.includes(spec)}
                    onChange={() => handleSpecialityToggle(spec)}
                  />
                  {spec}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="md:col-span-3 flex flex-col gap-6">
          {/* Sort Options */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Sort by</h3>
            <div className="flex gap-4">
              {[
                { label: 'Price: Low–High', value: 'price' },
                { label: 'Experience: Most First', value: 'experience' }
              ].map(option => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="sort"
                    value={option.value}
                    checked={sortBy === option.value}
                    onChange={() => setSortBy(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {/* Doctor Cards */}
          <div className="flex flex-col gap-6">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white flex items-center justify-between p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  {/* Left */}
                  <div className="flex items-center gap-6">
                    <img
                      src={doc.photo || "/api/placeholder/80/80"}
                      alt={doc.name}
                      className="w-20 h-20 rounded-full object-cover border shadow-sm"
                    />
                    <div className="flex flex-col">
                      <h2 className="text-lg font-semibold text-gray-800">{doc.name}</h2>
                      <p className="text-sm text-gray-600">{doc.specialities?.[0]?.name}</p>
                      <p className="text-sm text-gray-600">{doc.qualifications?.join(', ')}</p>
                      <p className="text-sm text-gray-600">{doc.experience}</p>
                      <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                        <Building2 size={14} />
                        <span className="truncate max-w-xs">{doc.clinic?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <MapPin size={14} />
                        <span>{doc.clinic?.address?.locality}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {doc.in_clinic && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">In-clinic</span>
                        )}
                        {doc.video_consult && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Video</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Right */}
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-base font-semibold text-gray-800">₹{doc.fees}</p>
                    <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md text-sm font-medium hover:bg-blue-600 hover:text-white transition-colors duration-200">
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-gray-600">No doctors found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
