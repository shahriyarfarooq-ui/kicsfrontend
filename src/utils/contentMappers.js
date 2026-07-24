import { buildImageUrl } from './image';

export { buildImageUrl, DEFAULT_IMAGE_FALLBACK } from './image';

export const stripHtml = (value = '') =>
  String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const truncateText = (value = '', maxLength = 160) => {
  const text = stripHtml(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
};

export const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const mapNewsItem = (item = {}) => ({
  id: item.id,
  date: formatDate(item.created_at || item.date),
  category: item.category || 'News',
  title: item.title || 'KICS News',
  image: buildImageUrl(item.image, 'https://placehold.co/400x200/4a1209/fae3de?text=KICS+News'),
  excerpt: item.excerpt || truncateText(item.description, 150),
  description: item.description || '',
  tags: Array.isArray(item.tags) ? item.tags : [],
  raw: item,
});

// export const mapStaffMember = (person = {}) => ({
//   id: person.id || person.people_id,
//   name: person.name || [person.fname, person.lname].filter(Boolean).join(' ') || 'KICS Staff',
//   title: person.title || person.designation || person.post || 'Staff Member',
//   dept: person.dept || person.department || person.group || 'KICS',
//   email: person.email || '',
//   image: buildImageUrl(person.image, ''),
//   bio: person.bio || truncateText(person.biography || person.research_interest, 140) || 'KICS team member.',
//   researchInterest: person.research_interest || '',
//   raw: person,
// });
export const mapStaffMember = (person = {}) => ({
  id: person.people_id || person.id,

  name:
    person.name ||
    [person.fname, person.lname]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    'KICS Staff',

  title:
    person.designation?.designation_name ||
    person.post?.post_name ||
    person.title ||
    'Staff Member',

  dept:
    person.group?.group_name ||
    person.department ||
    'KICS',

  email: person.email || '',

  image: buildImageUrl(
    person.image_name || person.image,
    ''
  ),

  bio:
    truncateText(
      person.biography ||
      person.research_interest ||
      '',
      140
    ) || 'KICS team member.',

  researchInterest: person.research_interest || '',

  raw: person,
});

export const mapPartner = (partner = {}) => ({
  id: partner.id,
  name: partner.title || partner.name || 'KICS Partner',
  logo: buildImageUrl(partner.logo, ''),
  link: partner.link || partner.url || '#',
  raw: partner,
});

export const mapCareer = (career = {}) => {
  const groupName = career.group?.name || career.group?.group_name || career.dept || career.department || 'KICS';
  const tags = Array.isArray(career.tags)
    ? career.tags.map((tag) => (typeof tag === 'string' ? tag : tag?.name)).filter(Boolean)
    : [];

  return {
    id: career.id,
    title: career.title || career.job_title || 'KICS Position',
    dept: groupName,
    type: career.type || career.employment_type || 'Career Opportunity',
    deadline: career.job_close_date ? `Apply by ${formatDate(career.job_close_date)}` : 'Open until filled',
    closeDate: career.job_close_date || '',
    location: career.location || 'KICS, UET Lahore',
    company: career.company || 'KICS',
    description: career.description || 'Career opportunity at KICS.',
    requirements: tags.length > 0 ? tags : ['Relevant experience and qualifications for the position'],
    applyEmail: career.apply_email || 'hr@kics.edu.pk',
    raw: career,
  };
};

export const mapPublication = (publication = {}) => ({
  id: publication.id || publication.publication_id,
  title: publication.title || publication.publication_title || 'KICS Publication',
  author: publication.author || 'KICS Researchers',
  journal: publication.journal || 'Research Publication',
  volume: publication.volume || '',
  year: publication.year || publication.publication_year || '',
  category: publication.category || 'Publication',
  abstract: publication.abstract || publication.publication_abstract || '',
  group: publication.group?.name || publication.group?.group_name || '',
  person: publication.person?.name || '',
  completed: Boolean(publication.publication_iscompleted),
  raw: publication,
});

export const mapGroupToArea = (group = {}, index = 0) => ({
  title: group.group_name || group.name || group.code || 'Research Group',
  image: buildImageUrl(group.img_path || group.group_banner, ''),
  desc: group.group_briefdescription || group.group_description || 'KICS research group and specialized lab.',
  code: group.code || String(index),
  raw: group,
});

export const mapGroupsToCategories = (groups = []) => {
  const colors = [
    'from-blue-600 to-blue-800',
    'from-violet-600 to-purple-800',
    'from-teal-600 to-teal-800',
    'from-amber-500 to-orange-700',
    'from-slate-600 to-slate-800',
    'from-rose-500 to-pink-700',
  ];
  const icons = ['wifi', 'cpu', 'code', 'zap', 'settings', 'target'];

  return [{
    category: 'KICS Labs & Centers',
    color: colors[0],
    icon: icons[0],
    labs: groups.map((group, index) => ({
      name: group.group_name || group.name || group.code || 'Research Group',
      short: group.code || `G${index + 1}`,
      code: group.code,
    })),
  }];
};
