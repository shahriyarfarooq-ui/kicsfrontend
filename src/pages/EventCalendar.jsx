import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiMapPin, FiClock, FiArrowRight } from 'react-icons/fi';
import PageHero from '../components/PageHero';
import SEO from '../components/SEO';
import { eventService } from '../services/eventService';
import { formatDate, getTime, getStatusColor, getStatusLabel, getCalendarDays } from '../utils/dateUtils';
import { buildImageUrl } from '../utils/contentMappers';

export default function EventCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'

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

  // Group events by date
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
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const goToMonth = (year, month) => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  // Get events for selected date
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const calendarDays = getCalendarDays(year, month);

  // Navigate to event detail
  const handleEventClick = (slug) => {
    window.location.href = `/events/${slug}`;
  };

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
          
          {/* View Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 bg-white rounded-full border border-slate-200 p-1 shadow-sm">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
                }`}
              >
                <FiCalendar size={16} />
                Calendar
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
                }`}
              >
                <FiCalendar size={16} />
                List View
              </button>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={goToPrevMonth}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              >
                <FiChevronLeft size={20} />
              </button>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 min-w-[180px] text-center">
                {monthName} {year}
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              >
                <FiChevronRight size={20} />
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold"
              >
                Today
              </button>
            </div>
          </div>

          {/* Quick Month Navigation */}
          <div className="flex flex-wrap gap-1 mb-6">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => {
              const monthNum = i + 1;
              const isActive = monthNum === month;
              return (
                <button
                  key={i}
                  onClick={() => goToMonth(year, monthNum)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>

          {/* ─── CALENDAR VIEW ─── */}
          {viewMode === 'calendar' && (
            <>
              {loading ? (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="py-3 text-center text-sm font-semibold text-slate-600">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {[...Array(42)].map((_, i) => (
                      <div key={i} className="min-h-[80px] p-2 border-b border-r border-slate-100 animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-6 mb-2" />
                        <div className="h-3 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
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
                          onClick={() => hasEvent && setSelectedDate(day.date)}
                          className={`
                            min-h-[100px] p-2 border-b border-r border-slate-100 cursor-pointer
                            transition-colors hover:bg-blue-50
                            ${!day.isCurrentMonth ? 'bg-slate-50/50' : ''}
                            ${isToday ? 'bg-blue-50' : ''}
                            ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}
                            ${!hasEvent ? 'cursor-default' : ''}
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
                            <div className="mt-1 space-y-0.5">
                              {dayEvents.slice(0, 2).map(event => (
                                <div
                                  key={event.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `/events/${event.slug}`;
                                  }}
                                  className="block text-[10px] text-blue-600 truncate hover:underline cursor-pointer bg-blue-50/80 px-1.5 py-0.5 rounded"
                                >
                                  {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <span className="text-[10px] text-slate-400 px-1.5">
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

              {/* Selected Date Events */}
              {selectedDate && (
                <div className="mt-8 bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                    <h3 className="text-xl font-bold text-white">
                      Events on {formatDate(selectedDate, 'MMMM D, YYYY')}
                    </h3>
                    <p className="text-blue-100 text-sm mt-1">
                      {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                  
                  <div className="p-4 sm:p-6">
                    {selectedDateEvents.length > 0 ? (
                      <div className="space-y-4">
                        {selectedDateEvents.map(event => (
                          <div
                            key={event.id}
                            onClick={() => handleEventClick(event.slug)}
                            className="group block p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                    {event.title}
                                  </h4>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-${getStatusColor(event.event_status) === 'blue' ? 'blue' : getStatusColor(event.event_status) === 'green' ? 'green' : getStatusColor(event.event_status) === 'red' ? 'red' : 'gray'}-100 text-${getStatusColor(event.event_status) === 'blue' ? 'blue' : getStatusColor(event.event_status) === 'green' ? 'green' : getStatusColor(event.event_status) === 'red' ? 'red' : 'gray'}-700`}>
                                    {getStatusLabel(event.event_status)}
                                  </span>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
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
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
                                  View Details
                                </span>
                                <FiArrowRight className="text-blue-600 group-hover:translate-x-1 transition-transform" size={14} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-center py-8">No events on this day.</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ─── LIST VIEW ─── */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-slate-500">Loading events...</div>
              ) : events.length === 0 ? (
                <div className="p-12 text-center">
                  <FiCalendar className="text-4xl text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No events this month</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {events.map((event) => {
                    const eventDate = new Date(event.start_date);
                    return (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event.slug)}
                        className="p-4 sm:p-6 hover:bg-blue-50/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          {/* Date Badge */}
                          <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex flex-col items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                            <span className="text-2xl font-bold leading-none">
                              {eventDate.getDate()}
                            </span>
                            <span className="text-[10px] font-semibold uppercase mt-0.5">
                              {eventDate.toLocaleString('default', { month: 'short' })}
                            </span>
                          </div>

                          {/* Event Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                {event.title}
                              </h3>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-${getStatusColor(event.event_status) === 'blue' ? 'blue' : getStatusColor(event.event_status) === 'green' ? 'green' : getStatusColor(event.event_status) === 'red' ? 'red' : 'gray'}-100 text-${getStatusColor(event.event_status) === 'blue' ? 'blue' : getStatusColor(event.event_status) === 'green' ? 'green' : getStatusColor(event.event_status) === 'red' ? 'red' : 'gray'}-700`}>
                                {getStatusLabel(event.event_status)}
                              </span>
                              {event.is_featured && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                                  ⭐ Featured
                                </span>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
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

                            {event.description && (
                              <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                                {event.description}
                              </p>
                            )}
                          </div>

                          <div className="flex-shrink-0 self-center sm:self-auto">
                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                              View Details <FiArrowRight size={14} />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl shadow p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{events.length}</p>
              <p className="text-xs text-slate-500">Total Events</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {events.filter(e => e.event_status === 'upcoming').length}
              </p>
              <p className="text-xs text-slate-500">Upcoming</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">
                {events.filter(e => e.event_status === 'ongoing').length}
              </p>
              <p className="text-xs text-slate-500">Ongoing</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {new Set(events.map(e => new Date(e.start_date).toDateString())).size}
              </p>
              <p className="text-xs text-slate-500">Event Days</p>
            </div>
          </div>

          {/* Back to Events */}
          <div className="mt-8 text-center">
            <Link to="/events" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              <FiArrowRight size={16} className="rotate-180" />
              Back to Events List
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}