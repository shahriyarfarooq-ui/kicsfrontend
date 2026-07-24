import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiMapPin, FiClock } from 'react-icons/fi';
import PageHero from '../components/PageHero';
import SEO from '../components/SEO';
import { eventService } from '../services/eventService';
import { formatDate, getTime, getCalendarDays } from '../utils/dateUtils';

export default function EventCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  useEffect(() => {
    fetchEvents();
  }, [year, month]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.calendar(year, month);
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch calendar events:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toDateString();
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate.toDateString() === dateStr;
    });
  };

  const hasEvents = (date) => {
    return getEventsForDate(date).length > 0;
  };

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const calendarDays = getCalendarDays(year, month);

  return (
    <div>
      <SEO
        title="Event Calendar"
        description="View all KICS events in a calendar format. Browse conferences, workshops, seminars, and more."
        breadcrumbs={[{ label: 'Home', url: '/' }, { label: 'Events', url: '/events' }, { label: 'Calendar' }]}
      />

      <PageHero
        title="Event Calendar"
        subtitle="View all upcoming events, conferences, workshops, and seminars at KICS in a calendar view."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Events', to: '/events' }, { label: 'Calendar' }]}
      />

      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Calendar Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={goToPrevMonth}
                className="p-2 rounded-xl border border-slate-200 hover:bg-white transition-colors"
              >
                <FiChevronLeft size={20} />
              </button>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 min-w-[140px] text-center">
                {monthName} {year}
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-2 rounded-xl border border-slate-200 hover:bg-white transition-colors"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
            
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              Today
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-3 text-center text-sm font-semibold text-slate-600">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const dayEvents = getEventsForDate(day.date);
                const isToday = day.date.toDateString() === new Date().toDateString();
                const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();
                const hasEvent = dayEvents.length > 0;

                return (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(hasEvent ? day.date : null)}
                    className={`
                      min-h-[100px] p-2 border-b border-r border-slate-100 cursor-pointer
                      transition-colors hover:bg-blue-50
                      ${!day.isCurrentMonth ? 'bg-slate-50/50' : ''}
                      ${isToday ? 'bg-blue-50' : ''}
                      ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <span className={`
                        text-sm font-semibold
                        ${!day.isCurrentMonth ? 'text-slate-400' : 'text-slate-700'}
                        ${isToday ? 'text-blue-600' : ''}
                      `}>
                        {day.date.getDate()}
                      </span>
                      {hasEvent && (
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </div>

                    {/* Event indicators on calendar */}
                    {day.isCurrentMonth && dayEvents.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <Link
                            key={event.id}
                            to={`/events/${event.slug}`}
                            className="block text-[10px] text-blue-600 truncate hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {event.title}
                          </Link>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="text-[10px] text-slate-400">
                            +{dayEvents.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Events */}
          {selectedDate && (
            <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                Events on {formatDate(selectedDate, 'MMMM D, YYYY')}
              </h3>
              
              {loading ? (
                <p className="text-slate-500">Loading events...</p>
              ) : (
                <>
                  {getEventsForDate(selectedDate).length > 0 ? (
                    <div className="space-y-4">
                      {getEventsForDate(selectedDate).map(event => (
                        <Link
                          key={event.id}
                          to={`/events/${event.slug}`}
                          className="block p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-slate-800">{event.title}</h4>
                              <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                  <FiClock size={14} />
                                  {getTime(event.start_date)}
                                  {event.end_date && ` - ${getTime(event.end_date)}`}
                                </span>
                                {event.location && (
                                  <span className="flex items-center gap-1">
                                    <FiMapPin size={14} />
                                    {event.location}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold bg-${event.event_status === 'upcoming' ? 'blue' : event.event_status === 'ongoing' ? 'green' : 'gray'}-100 text-${event.event_status === 'upcoming' ? 'blue' : event.event_status === 'ongoing' ? 'green' : 'gray'}-700`}>
                              {event.event_status === 'upcoming' ? 'Upcoming' : event.event_status === 'ongoing' ? 'Ongoing' : event.event_status === 'completed' ? 'Completed' : 'Cancelled'}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500">No events on this day.</p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 bg-blue-50 border border-slate-200 rounded" />
              Current month
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 bg-slate-50/50 border border-slate-200 rounded" />
              Other month
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 bg-blue-50 border-2 border-blue-500 rounded" />
              Today
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Has events
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 ring-2 ring-blue-500 ring-inset rounded" />
              Selected date
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}