import React, { useState } from 'react';
import { allStructuresData } from '../data/allStructuresData';

interface Structure {
  title: string;
  description: string;
  url: string;
}

interface Subsection {
  title: string;
  structures: Structure[];
}

interface AllStructuresListProps {
  onStructureSelect: (url: string, title: string) => void;
}

const AccordionItem: React.FC<{ subsection: Subsection; onStructureSelect: (url: string, title: string) => void }> = ({ subsection, onStructureSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-600">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-1.5 text-left hover:bg-slate-600/50 transition-colors"
        aria-expanded={isOpen}
      >
        <h4 className="font-semibold text-slate-200">{subsection.title}</h4>
        <svg
          className={`w-5 h-5 text-slate-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pl-4 py-1 bg-slate-800/50">
          <ul className="space-y-0.5">
            {subsection.structures.map((structure, index) => (
              <li key={index}>
                <button
                  onClick={() => onStructureSelect(structure.url, structure.title)}
                  className="text-left w-full px-2 py-0.5 rounded-md hover:bg-slate-700 transition-colors text-sky-400 hover:text-sky-300 text-sm"
                >
                  {structure.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const AllStructuresList: React.FC<AllStructuresListProps> = ({ onStructureSelect }) => {
  return (
    <div className="p-0 sm:p-4 text-white">
      {allStructuresData.map((section, index) => (
        <div key={index} className="mb-2">
          <h3 className="text-lg font-bold text-sky-300 p-2 bg-slate-700/50 rounded-t-md">{section.title}</h3>
          {section.subsections.map((subsection, subIndex) => (
             <AccordionItem key={subIndex} subsection={subsection} onStructureSelect={onStructureSelect} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default AllStructuresList;