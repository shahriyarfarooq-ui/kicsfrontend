import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AnimateOnScroll from '../components/AnimateOnScroll';
import SEO from '../components/SEO';
import { newsService } from '../services';
import { mapNewsItem, stripHtml } from '../utils/contentMappers';
import { getImageLoadingProps } from '../utils/image';
import { FiArrowLeft, FiArrowRight, FiCalendar, FiTag } from 'react-icons/fi';

export default function NewsDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.all([
      newsService.get(id),
      newsService.list({ limit: 10 })
    ])
      .then(([data, allNews]) => {
        if (active) {
          const mapped = mapNewsItem(data);
          setItem(mapped);
          
          // Get related news (same category, excluding current item)
          const related = Array.isArray(allNews) 
            ? allNews
                .map(mapNewsItem)
                .filter(n => n.id !== id && n.category === mapped.category)
                .slice(0, 3)
            : [];
          setRelatedNews(related);
        }
      })
      .catch(() => {
        if (active) setError('Unable to load this news item.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [id]);

  const title = item?.title || 'News Detail';

  return (
    <div>
      <SEO
        title={title}
        description={item?.excerpt || 'KICS news detail.'}
        image={item?.image}
        type="article"
        path={`/news/${id}`}
        publishedTime={item?.raw?.created_at}
        modifiedTime={item?.raw?.updated_at}
        breadcrumbs={[{ label: 'News', url: '/news' }, { label: title, url: `/news/${id}` }]}
      />

      {/* Minimal Hero Section with Breadcrumbs Only */}
      <section className="py-6 sm:py-8 bg-gradient-to-b from-blue-50 to-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">Home</Link>
            <span className="text-slate-400">/</span>
            <Link to="/news" className="text-primary-600 hover:text-primary-700 font-medium">News</Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600">Detail</span>
          </nav>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link to="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-cyan-600 mb-8">
            <FiArrowLeft size={14} /> Back to News
          </Link>

          {loading && (
            <div className="text-sm text-primary-700 bg-primary-50 border border-primary-100 rounded-lg px-4 py-3">
              Loading news detail...
            </div>
          )}

          {error && (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {item && (
            <AnimateOnScroll>
              <article className="bg-white rounded-xl overflow-hidden shadow-md">
                <img
                  src={item.image}
                  alt={item.title}
                  {...getImageLoadingProps({ eager: true, sizes: '(min-width: 1024px) 900px, 100vw' })}
                  className="w-full h-80 sm:h-96 object-cover object-center"
                  onError={e => { e.target.src='https://placehold.co/900x420/4a1209/fae3de?text=KICS+News'; }}
                />
                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-5">
                    <span className="inline-flex items-center gap-1.5 text-primary-600 font-semibold">
                      <FiCalendar size={12} /> {item.date || 'Latest'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-3 py-1 rounded-full">
                      <FiTag size={11} /> {item.category}
                    </span>
                  </div>
                  <h1 className="font-bold text-3xl sm:text-4xl text-slate-900 mb-6 leading-tight">{item.title}</h1>
                  <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed prose-headings:text-slate-900 prose-headings:font-bold prose-a:text-primary-600 prose-a:underline prose-strong:text-slate-900" dangerouslySetInnerHTML={{ __html: item.description || item.excerpt }} />
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-200">
                      {item.tags.map((tag) => <span key={tag} className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full">{tag}</span>)}
                    </div>
                  )}
                </div>
              </article>
            </AnimateOnScroll>
          )}
        </div>
      </section>

      {/* Related News Section */}
      {relatedNews.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-white via-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <AnimateOnScroll>
              <div className="mb-10">
                <span className="inline-block text-sm font-semibold text-primary-600 uppercase tracking-wide mb-2">Related Content</span>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">More News & Events</h2>
                <div className="w-12 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full mt-4" />
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedNews.map((newsItem, index) => (
                <AnimateOnScroll
                  key={newsItem.id || index}
                  animation="fade-in"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <Link
                    to={newsItem.id ? `/news/${newsItem.id}` : "/news"}
                    className="group h-full flex flex-col bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-primary-100"
                  >
                    {/* Image Container */}
                    <div className="relative overflow-hidden bg-slate-200" style={{ aspectRatio: "16/10" }}>
                      <img
                        src={newsItem.image}
                        alt={newsItem.title}
                        width="400"
                        height="250"
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=400&h=250&fit=crop";
                        }}
                      />
                      {/* Category Badge */}
                      <span className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-[10px] sm:text-xs font-bold px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full shadow-lg backdrop-blur-sm bg-opacity-95">
                        {newsItem.category}
                      </span>
                    </div>

                    {/* Content Container */}
                    <div className="flex-1 flex flex-col p-4 sm:p-5">
                      {/* Date */}
                      <span className="text-[10px] sm:text-xs text-primary-600 font-semibold flex items-center gap-1.5 mb-2">
                        <FiCalendar size={12} className="flex-shrink-0" />
                        {newsItem.date}
                      </span>

                      {/* Title */}
                      <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug group-hover:text-primary-600 transition-colors mb-2 line-clamp-2">
                        {newsItem.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-2 flex-1 mb-3">
                        {newsItem.excerpt}
                      </p>

                      {/* Read More Link */}
                      <div className="inline-flex items-center gap-2 text-primary-600 font-semibold text-xs sm:text-sm group-hover:gap-3 transition-all">
                        Read More
                        <FiArrowRight size={14} className="transition-transform" />
                      </div>
                    </div>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
