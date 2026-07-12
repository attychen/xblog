'use client';
import { useEffect, useState } from 'react';

const PV_KEY = 'fazhouji_pv';
const BASE_PV = 12680; // Seed value

export default function PageViewCounter() {
  const [pv, setPv] = useState(BASE_PV);

  useEffect(() => {
    // Read stored count
    const stored = localStorage.getItem(PV_KEY);
    const count = stored ? parseInt(stored, 10) : 0;
    const newCount = count + 1;
    localStorage.setItem(PV_KEY, String(newCount));
    setPv(BASE_PV + newCount);
  }, []);

  return (
    <span className="text-gray-400 dark:text-gray-500">
      {pv.toLocaleString()} 次浏览
    </span>
  );
}