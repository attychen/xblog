'use client';
import { useEffect, useState } from 'react';

const FALLBACK_PV = 12680;

export default function PageViewCounter() {
  const [pv, setPv] = useState(FALLBACK_PV);

  useEffect(() => {
    // Increment and get count from API
    fetch('/api/pv', { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (data.pv > 0) setPv(data.pv);
      })
      .catch(() => {
        // Fallback to localStorage
        const stored = localStorage.getItem('fazhouji_pv');
        const count = stored ? parseInt(stored, 10) : 0;
        localStorage.setItem('fazhouji_pv', String(count + 1));
        setPv(FALLBACK_PV + count + 1);
      });
  }, []);

  return (
    <span className="text-gray-400 dark:text-gray-500">
      {pv.toLocaleString()} 次浏览
    </span>
  );
}