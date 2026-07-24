import { useState, useEffect } from 'react';
import { FiSearch, FiCalendar, FiFilter, FiX } from 'react-icons/fi';
import PageHero from '../components/PageHero';
import EventCard from '../components/EventCard';
import SEO from '../components/SEO';
import { eventService } from '../services/eventService';
import { getTypeLabel } from '../utils/dateUtils';

const EVENT_TYPES = ['all', 'conference', 'workshop', 'seminar', 'summit', 'training', 'social'];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });

  useEffect(() => {
    fetchEvents();
  }, [filterType, filterStatus, pagination.current_page]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: pagination.current_page,
        per_page: 9
      };
      
      if (filterType !== 'all') params.type = filterType;
      if (filterStatus === 'upcoming') params.upcoming = true;
      
      const response = await eventService.list(params);
      
      if (response && Array.isArray(response)) {
        setEvents(response);
      } else if (response && response.data) {
        setEvents(response.data);
        if (response.meta) {
          setPagination({
            current_page: response.meta.current_page || 1,
            last_page: response.meta.last_page || 1,
            total: response.meta.total || 0
          });
        }
      }
    } catch (err) {
      setError('Failed to load events. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter events by search
  const filteredEvents = events.filter(event => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return event.title.toLowerCase().includes(searchLower) ||
           (event.description && event.description.toLowerCase().includes(searchLower)) ||
           (event.location && event.location.toLowerCase().includes(searchLower));
  });

  return (
    <div>
      <SEO
        title="Events"
        description="Browse upcoming events, conferences, workshops, and seminars at KICS UET Lahore."
        breadcrumbs={[{ label: 'Home', url: '/' }, { label: 'Events' }]}
      />

      <PageHero
        title="Events"
        subtitle="Stay updated with the latest conferences, workshops, seminars, and training programs at KICS."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Events' }]}
      />

      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-8">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <FiX size={16} />
                  </button>
                )}
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <FiFilter className="text-slate-400" size={18} />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
                >
                  {EVENT_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All Types' : getTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
              >
                <option value="all">All Events</option>
                <option value="upcoming">Upcoming Only</option>
              </select>

              {/* Results Count */}
              {!loading && (
                <span className="text-sm text-slate-500 ml-auto">
                  {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
                </span>
              )}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                  <div className="h-48 bg-slate-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-full" />
                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                    <div className="h-10 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchEvents}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Events Grid */}
          {!loading && !error && (
            <>
              {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <FiCalendar className="text-6xl text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-800 mb-2">No Events Found</h3>
                  <p className="text-slate-500">
                    {search ? 'Try adjusting your search or filters.' : 'Check back later for upcoming events.'}
                  </p>
                  {search && (
                    <button
                      onClick={() => { setSearch(''); setFilterType('all'); setFilterStatus('all'); }}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, current_page: Math.max(1, prev.current_page - 1) }))}
                    disabled={pagination.current_page === 1}
                    className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-slate-600">
                    Page {pagination.current_page} of {pagination.last_page}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, current_page: Math.min(prev.last_page, prev.current_page + 1) }))}
                    disabled={pagination.current_page === pagination.last_page}
                    className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}