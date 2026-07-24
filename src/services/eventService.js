import { api, unwrapData } from './api';

export const eventService = {
  // Get all events with pagination and filters
  list: async (params = {}) => {
    const payload = await api.get('/api/events', { params });
    return unwrapData(payload);
  },

  // Get single event by slug
  get: async (slug) => {
    const payload = await api.get(`/api/events/${slug}`);
    return unwrapData(payload);
  },

  // Get upcoming events (homepage)
  upcoming: async (limit = 6) => {
    const payload = await api.get('/api/events/upcoming', { params: { limit } });
    return unwrapData(payload);
  },

  // Get events for calendar view
  calendar: async (year, month) => {
    const payload = await api.get('/api/events/calendar', { params: { year, month } });
    return unwrapData(payload);
  },

  // Get featured events
  featured: async () => {
    const payload = await api.get('/api/events', { params: { featured: true, per_page: 4 } });
    return unwrapData(payload);
  }
};