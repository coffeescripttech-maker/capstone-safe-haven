-- =====================================================
-- Insert sample projects for D1 (SQLite format)
-- =====================================================

-- Insert sample projects
INSERT OR REPLACE INTO projects (
  id, title, client, category, data_cat, languages, classification,
  vimeo_id, video_url, poster_image, poster_image_srcset, credits, order_index, is_published
) VALUES
(
  'project-1',
  'The Abu Dhabi Plan',
  'Abu Dhabi Executive Council',
  'Government / Strategic Communication',
  'government',
  'Arabic & English',
  'TVC',
  '414307456',
  'https://player.vimeo.com/video/414307456',
  'https://res.cloudinary.com/dvqsa7ko7/image/upload/v1760834561/THE_ABU_DHABI_PLAN_rakbuq.png',
  'https://res.cloudinary.com/dvqsa7ko7/image/upload/v1760834561/THE_ABU_DHABI_PLAN_rakbuq.png 300w, https://res.cloudinary.com/dvqsa7ko7/image/upload/v1760834561/THE_ABU_DHABI_PLAN_rakbuq.png 800w',
  '[{"role": "Client", "name": "Abu Dhabi Executive Council"}, {"role": "Production Company", "name": "DubaiFilmMaker"}]',
  1, 1
),
(
  'project-2',
  'Invest in Sharjah',
  'Invest in Sharjah Office',
  'Corporate / Investment Promotion',
  'corporate',
  'Arabic & English',
  'TVC',
  '739200966',
  'https://player.vimeo.com/video/739200966',
  'https://res.cloudinary.com/dvqsa7ko7/image/upload/v1760834311/INVEST_IN_SHARJAH_dwp7xf.png',
  'https://res.cloudinary.com/dvqsa7ko7/image/upload/v1760834311/INVEST_IN_SHARJAH_dwp7xf.png 300w, https://res.cloudinary.com/dvqsa7ko7/image/upload/v1760834311/INVEST_IN_SHARJAH_dwp7xf.png 800w',
  '[{"role": "Client", "name": "Invest in Sharjah Office"}, {"role": "Production Company", "name": "DubaiFilmMaker"}]',
  2, 1
),
(
  'project-3',
  'Impossible To Define',
  'Dubai Economy and Tourism',
  'Tourism Campaign',
  'tourism',
  'Arabic & English',
  'TVC',
  '739262822',
  'https://player.vimeo.com/video/739262822',
  'https://res.cloudinary.com/dvqsa7ko7/image/upload/v1760834192/IMPOSSIBLE_TO_DEFINE_wxopj4.png',
  'https://res.cloudinary.com/dvqsa7ko7/image/upload/v1760834192/IMPOSSIBLE_TO_DEFINE_wxopj4.png 300w, https://res.cloudinary.com/dvqsa7ko7/image/upload/v1760834192/IMPOSSIBLE_TO_DEFINE_wxopj4.png 800w',
  '[{"role": "Client", "name": "Dubai Economy and Tourism"}, {"role": "Production Company", "name": "DubaiFilmMaker"}]',
  3, 1
),
(
  'project-4',
  'Setup Your Business',
  'Dubai Economy and Tourism',
  'Business Promotion / Government Service',
  'business',
  'Arabic & English',
  'TVC',
  '739286803',
  'https://player.vimeo.com/video/739286803',
  'https://res.cloudinary.com/dvqsa7ko7/image/upload/v1760834192/IMPOSSIBLE_TO_DEFINE_wxopj4.png',
  'https://res.cloudinary.com/dvqsa7ko7/image/upload/v1760834192/IMPOSSIBLE_TO_DEFINE_wxopj4.png 300w, https://res.cloudinary.com/dvqsa7ko7/image/upload/v1760834192/IMPOSSIBLE_TO_DEFINE_wxopj4.png 800w',
  '[{"role": "Client", "name": "Dubai Economy and Tourism"}, {"role": "Production Company", "name": "DubaiFilmMaker"}]',
  4, 1
),
(
  'project-5',
  'Moving Forward',
  'SHUROOQ – Sharjah Investment and Development Authority',
  'Corporate / Investment Promotion',
  'corporate',
  'Arabic & English',
  'TVC',
  '840513516',
  'https://player.vimeo.com/video/840513516',
  'https://res.cloudinary.com/dvqsa7ko7/image/upload/v1760833991/MOVING_FORWARD_erghda.png',
  'https://res.cloudinary.com/dvqsa7ko7/image/upload/v1760833991/MOVING_FORWARD_erghda.png 300w, https://res.cloudinary.com/dvqsa7ko7/image/upload/v1760833991/MOVING_FORWARD_erghda.png 800w',
  '[{"role": "Client", "name": "SHUROOQ – Sharjah Investment and Development Authority"}, {"role": "Production Company", "name": "DubaiFilmMaker"}]',
  5, 1
);

-- Verify insertion
SELECT COUNT(*) as total_projects FROM projects;