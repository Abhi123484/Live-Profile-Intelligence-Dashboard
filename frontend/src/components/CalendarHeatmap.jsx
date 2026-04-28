import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarHeatmap = ({ userId, isPublic = false }) => {
  const [heatmapData, setHeatmapData] = useState({});
  const [loading, setLoading] = useState(true);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    fetchHeatmapData();
  }, [userId]);

  const fetchHeatmapData = async () => {
    try {
      const url = isPublic
        ? `http://localhost:5000/api/activity/heatmap/public/${userId}`
        : 'http://localhost:5000/api/activity/heatmap/data';
      
      const config = !isPublic ? {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      } : {};

      const res = await axios.get(url, config);
      setHeatmapData(res.data);
    } catch (err) {
      console.error('Error fetching heatmap data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityLevel = (count) => {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count <= 2) return 2;
    if (count <= 4) return 3;
    return 4;
  };

  const getActivityColor = (count) => {
    const level = getActivityLevel(count);
    const colors = [
      'rgba(255, 255, 255, 0.1)',      // 0: Very light gray
      'rgba(129, 140, 248, 0.4)',      // 1: Light indigo
      'rgba(129, 140, 248, 0.6)',      // 2: Medium indigo
      'rgba(129, 140, 248, 0.8)',      // 3: Strong indigo
      'rgba(129, 140, 248, 1)'         // 4+: Full indigo
    ];
    return colors[level];
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  const handleNextMonth = () => {
    const today = new Date();
    const isCurrentMonth = currentMonth.getFullYear() === today.getFullYear() 
      && currentMonth.getMonth() === today.getMonth();
    
    if (!isCurrentMonth) {
      setCurrentMonth(prev => {
        const newMonth = new Date(prev);
        newMonth.setMonth(newMonth.getMonth() + 1);
        return newMonth;
      });
    }
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading heatmap...</div>;
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  // Pad to complete the last week
  while (days.length % 7 !== 0) {
    days.push(null);
  }

  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      padding: '12px',
      marginTop: '12px'
    }}>
      <div style={{ marginBottom: '8px' }}>
        <h4 style={{ margin: '0 0 2px 0', fontSize: '0.8rem', fontWeight: '600' }}>Activity Consistency</h4>
        <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.6)' }}>
          Daily engagement heatmap
        </p>
      </div>

      {/* Month Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <button
          onClick={handlePrevMonth}
          style={{
            background: 'rgba(129, 140, 248, 0.1)',
            border: '1px solid rgba(129, 140, 248, 0.2)',
            borderRadius: '4px',
            padding: '3px 6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.6rem',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(129, 140, 248, 0.2)';
            e.target.style.color = 'rgba(255, 255, 255, 1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(129, 140, 248, 0.1)';
            e.target.style.color = 'rgba(255, 255, 255, 0.7)';
          }}
        >
          <ChevronLeft size={12} />
          Prev
        </button>

        <div style={{
          fontSize: '0.75rem',
          fontWeight: '600',
          color: 'rgba(255, 255, 255, 0.9)',
          minWidth: '100px',
          textAlign: 'center'
        }}>
          {monthNames[month]} {year}
        </div>

        <button
          onClick={handleNextMonth}
          disabled={isCurrentMonth}
          style={{
            background: isCurrentMonth ? 'rgba(255, 255, 255, 0.05)' : 'rgba(129, 140, 248, 0.1)',
            border: '1px solid rgba(129, 140, 248, 0.2)',
            borderRadius: '4px',
            padding: '3px 6px',
            cursor: isCurrentMonth ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            color: isCurrentMonth ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.6rem',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            opacity: isCurrentMonth ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (!isCurrentMonth) {
              e.target.style.background = 'rgba(129, 140, 248, 0.2)';
              e.target.style.color = 'rgba(255, 255, 255, 1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isCurrentMonth) {
              e.target.style.background = 'rgba(129, 140, 248, 0.1)';
              e.target.style.color = 'rgba(255, 255, 255, 0.7)';
            }
          }}
        >
          Next
          <ChevronRight size={12} />
        </button>
      </div>

      {/* Day labels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '2px',
        marginBottom: '6px'
      }}>
        {dayLabels.map((label) => (
          <div
            key={label}
            style={{
              fontSize: '0.55rem',
              fontWeight: '600',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.5)',
              height: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '2px',
        marginBottom: '8px'
      }}>
        {days.map((day, dayIdx) => {
          if (!day) {
            return (
              <div
                key={`empty-${dayIdx}`}
                style={{
                  aspectRatio: '1',
                  borderRadius: '3px'
                }}
              />
            );
          }

          const dateStr = day.toISOString().split('T')[0];
          const count = heatmapData[dateStr] || 0;

          return (
            <div
              key={dateStr}
              style={{
                aspectRatio: '1',
                background: getActivityColor(count),
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '3px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: hoveredDate === dateStr ? 'scale(1.1)' : 'scale(1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6rem',
                fontWeight: '600',
                color: count > 0 ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.3)'
              }}
              onMouseEnter={(e) => {
                setHoveredDate(dateStr);
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltipPos({ x: rect.left, y: rect.top });
              }}
              onMouseLeave={() => setHoveredDate(null)}
              title={`${dateStr}: ${count} activities`}
            >
              {day.getDate()}
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {hoveredDate && (
        <div style={{
          position: 'fixed',
          left: `${tooltipPos.x}px`,
          top: `${tooltipPos.y - 35}px`,
          background: 'rgba(20, 20, 30, 0.95)',
          border: '1px solid rgba(129, 140, 248, 0.3)',
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '0.65rem',
          pointerEvents: 'none',
          zIndex: 1000,
          backdropFilter: 'blur(8px)',
          whiteSpace: 'nowrap'
        }}>
          <div>{hoveredDate}</div>
          <div style={{ color: 'rgba(129, 140, 248, 0.8)', fontWeight: '600' }}>
            {heatmapData[hoveredDate] || 0} activities
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.65rem',
        color: 'rgba(255, 255, 255, 0.6)',
        paddingTop: '6px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            style={{
              width: '8px',
              height: '8px',
              background: getActivityColor(level),
              borderRadius: '1px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

export default CalendarHeatmap;
