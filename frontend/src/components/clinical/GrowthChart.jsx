import React, { useState, useEffect, useMemo, useLayoutEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceArea,
  Area
} from 'recharts';
import { getPediatricStandards } from '../../services/api';

// Module-level cache to prevent redundant WHO standards fetches
const standardsCache = {};

const GrowthChart = ({ data = [], type = 'weight', gender = 'M' }) => {
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = React.useRef(null);

  const measure = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const width = rect.width;
      if (width > 0) {
        const height = Math.max(350, width / 1.5);
        setDimensions({ width, height });
      }
    }
  }, []);

  useLayoutEffect(() => {
    setMounted(true);
    
    // Attempt immediate measurement
    measure();

    // Sequence of retries to catch late layout settling
    const timers = [
        setTimeout(measure, 50),
        setTimeout(measure, 150),
        setTimeout(measure, 500),
        setTimeout(measure, 1000)
    ];

    const observer = new ResizeObserver(() => {
        measure();
    });
    
    if (containerRef.current) {
        observer.observe(containerRef.current);
    }
    
    return () => {
        timers.forEach(t => clearTimeout(t));
        observer.disconnect();
    };
  }, [measure]);

  useEffect(() => {
    fetchStandards();
  }, [type, gender]);

  const fetchStandards = async () => {
    const metricMap = {
        weight: 'weight_for_age',
        height: 'height_for_age',
        bmi: 'bmi_for_age',
        head_circumference: 'head_circumference_for_age'
    };
    const metric = metricMap[type] || 'weight_for_age';
    const cacheKey = `${gender}-${metric}`;

    if (standardsCache[cacheKey]) {
        setStandards(standardsCache[cacheKey]);
        setLoading(false);
        return;
    }

    setLoading(true);
    try {
        const res = await getPediatricStandards({ gender, metric });
        const data = res || [];
        standardsCache[cacheKey] = data;
        setStandards(data);
    } catch (err) {
        console.error("Failed to fetch WHO standards", err);
        setStandards([]);
    } finally {
        setLoading(false);
    }
  };

  const chartTheme = useMemo(() => {
    if (gender === 'F') {
        return {
            primary: '#db2777', // Pink 600
            secondary: '#fbcfe8', // Pink 200
            bg: 'rgba(219, 39, 119, 0.03)',
            standards: ['#fce7f3', '#fbcfe8', '#f9a8d4', '#db2777', '#f9a8d4', '#fbcfe8', '#fce7f3']
        };
    }
    return {
        primary: '#2563eb', // Blue 600
        secondary: '#bfdbfe', // Blue 200
        bg: 'rgba(37, 99, 235, 0.03)',
        standards: ['#eff6ff', '#dbeafe', '#bfdbfe', '#2563eb', '#bfdbfe', '#dbeafe', '#eff6ff']
    };
  }, [gender]);

  const combinedData = useMemo(() => {
    if (standards.length === 0) return data;
    
    // Ensure we always show at least 24 months even if no data
    const maxMonth = Math.max(24, ...data.map(d => d.age_months), ...standards.map(s => s.age_months));
    const merged = [];
    
    for (let m = 0; m <= maxMonth; m++) {
        const record = data.find(d => d.age_months === m);
        const item = { age_months: m };
        
        // Find or interpolate standards
        let low = null;
        let high = null;
        
        for (const s of standards) {
            if (s.age_months === m) {
                low = s;
                high = s;
                break;
            }
            if (s.age_months < m) low = s;
            if (s.age_months > m && !high) {
                high = s;
                break;
            }
        }

        if (low && high) {
            const calc = (z) => {
                let L, M, S;
                if (low === high) {
                    L = parseFloat(low.l || 1);
                    M = parseFloat(low.m);
                    S = parseFloat(low.s);
                } else {
                    const ratio = (m - low.age_months) / (high.age_months - low.age_months);
                    L = parseFloat(low.l || 1) + ratio * (parseFloat(high.l || 1) - parseFloat(low.l || 1));
                    M = parseFloat(low.m) + ratio * (parseFloat(high.m) - parseFloat(low.m));
                    S = parseFloat(low.s) + ratio * (parseFloat(high.s) - parseFloat(low.s));
                }
                if (L === 0) return M * Math.exp(S * z);
                return M * Math.pow(Math.max(0.001, 1 + L * S * z), 1 / L);
            };

            item.zM3 = calc(-3);
            item.zM2 = calc(-2);
            item.zM1 = calc(-1);
            item.z0 = calc(0);
            item.z1 = calc(1);
            item.z2 = calc(2);
            item.z3 = calc(3);
        }
        
        if (record) {
            item.value = type === 'weight' ? record.weight_kg : record.height_cm;
            if (type === 'bmi') {
                const hM = record.height_cm / 100;
                item.value = hM > 0 ? record.weight_kg / (hM * hM) : 0;
            }
            if (type === 'head_circumference') item.value = record.head_circumference_cm;
            item.measured_at = record.measured_at;
            item.record = record;
        }
        
        // Always push if we have standards or record
        if ((low && high) || record) merged.push(item);
    }
    return merged;
  }, [data, standards, type]);

  if (loading) return <div className="h-[400px] flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing WHO Datasets...</div>;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload.find(p => p.dataKey === 'value');
      if (!dataPoint) return null;
      
      const item = dataPoint.payload.record;
      if (!item) return null;

      const metricLabel = {
        weight: { title: 'Weight', unit: 'kg', zKey: 'weight_for_age_z', pKey: 'weight_for_age_percentile' },
        height: { title: 'Height', unit: 'cm', zKey: 'height_for_age_z', pKey: 'height_for_age_percentile' },
        bmi: { title: 'BMI', unit: 'kg/m²', zKey: 'bmi_for_age_z', pKey: 'bmi_for_age_percentile' },
        head_circumference: { title: 'Head Circ.', unit: 'cm', zKey: 'head_circum_z', pKey: 'head_circum_percentile' }
      }[type] || { title: type, unit: '' };

      const zScore = item.analysis?.[metricLabel.zKey];
      const percentile = item.analysis?.[metricLabel.pKey];

      return (
        <div className="bg-white/95 backdrop-blur-xl p-5 rounded-[2rem] shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">
            {new Date(item.measured_at).toLocaleDateString()} • {item.age_months}mo
          </p>
          <div className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full shadow-lg`} style={{ backgroundColor: chartTheme.primary, boxShadow: `0 0 15px ${chartTheme.primary}40` }} />
            <span className="text-2xl font-black text-slate-900">{Number(dataPoint.value || 0).toFixed(1)} {metricLabel.unit}</span>
          </div>
          {zScore !== undefined && zScore !== null && (
            <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
              <div className="flex justify-between items-center bg-slate-50 px-3 py-1.5 rounded-xl">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Z-Score</span>
                 <span className="text-xs font-black text-slate-900">{parseFloat(zScore || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 px-3 py-1.5 rounded-xl">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Percentile</span>
                 <span className="text-xs font-black text-slate-900">{(parseFloat(percentile || 0) * 100).toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const currentLabel = {
    weight: { title: 'Weight', unit: 'kg' },
    height: { title: 'Height', unit: 'cm' },
    bmi: { title: 'BMI', unit: 'kg/m²' },
    head_circumference: { title: 'Head Circ.', unit: 'cm' }
  }[type] || { title: type, unit: '' };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end px-4 gap-4">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${gender === 'F' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                    WHO {gender === 'F' ? 'Girls' : 'Boys'} Standard
                </span>
            </div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">{currentLabel.title} Trajectory</h4>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-200" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Z-Lines (-3 to +3)</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chartTheme.primary }} />
                <span className="text-[9px] font-black text-slate-900 uppercase tracking-tighter">Measured Vitals</span>
            </div>
        </div>
      </div>

      <div className="w-full bg-white rounded-[2.5rem] border border-slate-100/50 shadow-inner overflow-hidden p-4 sm:p-10 relative flex flex-col">
        <div ref={containerRef} className="flex-1 min-w-0 min-h-[350px] relative w-full flex items-center justify-center">
          {mounted && !loading && standards.length > 0 && dimensions.width > 0 ? (
            <ResponsiveContainer 
              key={`${type}-${gender}-${standards.length}-${dimensions.width}`}
              width="100%" 
              height={dimensions.height || 350}
            >
              <LineChart data={combinedData} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f8fafc" />
            
            {/* Background Standards - Z-Scores -3, -2, -1, 0, 1, 2, 3 */}
            <Line type="monotone" dataKey="zM3" stroke={chartTheme.standards[0]} strokeWidth={1} dot={false} strokeDasharray="3 3" isAnimationActive={false} />
            <Line type="monotone" dataKey="zM2" stroke={chartTheme.standards[1]} strokeWidth={1} dot={false} strokeDasharray="3 3" isAnimationActive={false} />
            <Line type="monotone" dataKey="zM1" stroke={chartTheme.standards[2]} strokeWidth={1} dot={false} strokeDasharray="3 3" isAnimationActive={false} />
            <Line type="monotone" dataKey="z0" stroke={chartTheme.primary} strokeWidth={1.5} dot={false} opacity={0.3} isAnimationActive={false} />
            <Line type="monotone" dataKey="z1" stroke={chartTheme.standards[4]} strokeWidth={1} dot={false} strokeDasharray="3 3" isAnimationActive={false} />
            <Line type="monotone" dataKey="z2" stroke={chartTheme.standards[5]} strokeWidth={1} dot={false} strokeDasharray="3 3" isAnimationActive={false} />
            <Line type="monotone" dataKey="z3" stroke={chartTheme.standards[6]} strokeWidth={1} dot={false} strokeDasharray="3 3" isAnimationActive={false} />

            <XAxis 
              dataKey="age_months" 
              tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              dy={10}
              interval="preserveStartEnd"
              minTickGap={20}
              label={{ value: 'Age (Months)', position: 'insideBottom', offset: -10, fontSize: 9, fontWeight: 'black', fill: '#94a3b8', textAnchor: 'middle' }}
            />
            <YAxis 
              tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              width={40}
              label={{ value: `${currentLabel.unit}`, angle: -90, position: 'insideLeft', offset: 0, fontSize: 9, fontWeight: 'black', fill: '#94a3b8' }}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f1f5f9', strokeWidth: 40, strokeOpacity: 0.5 }} />
            
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={chartTheme.primary} 
              strokeWidth={5} 
              dot={{ r: 8, fill: 'white', strokeWidth: 4, stroke: chartTheme.primary }}
              activeDot={{ r: 10, fill: chartTheme.primary, stroke: 'white', strokeWidth: 5, shadow: '0 0 20px rgba(0,0,0,0.1)' }}
              animationDuration={2000}
              connectNulls
            />
          </LineChart>
          </ResponsiveContainer>
          ) : !loading && (standards.length === 0 || dimensions.width === 0) ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-200 mx-auto border border-slate-100 italic font-black">N/A</div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {dimensions.width === 0 ? "Initializing Layout..." : `WHO Standards Not Available for ${currentLabel.title}`}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 animate-pulse">
               <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100" />
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Syncing WHO Baseline...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrowthChart;
