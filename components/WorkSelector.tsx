
import React from 'react';
import { JobType } from '../types';

interface Props {
  value: JobType;
  onChange: (val: JobType) => void;
  disabled?: boolean;
}

const WorkSelector: React.FC<Props> = ({ value, onChange, disabled }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">Contexto de Operação:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as JobType)}
        disabled={disabled}
        className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none text-slate-800 font-medium disabled:opacity-50"
      >
        {Object.values(JobType).map((job) => (
          <option key={job} value={job}>
            {job}
          </option>
        ))}
      </select>
    </div>
  );
};

export default WorkSelector;
