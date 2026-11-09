# BizGuide SEO maintenance

Prepared 9 November 2026. This is the technical and on-page baseline for the current English-language site. It does not certify Google indexing, rich results, rankings, traffic, or Core Web Vitals field results.

## Before publishing

Run `python3 tools/check-seo.py`, `node --check site.js`, `node --check blog.js`, and `git diff --check` from the repository root. The SEO check verifies all HTML pages, local links and fragments, canonical URLs, metadata, JSON-LD, visible breadcrumbs, RSS and sitemap coverage.

## Content and URL rules

- Keep existing `.html` URLs stable. The canonical home URL is `https://bizguide.website/`; internal home links use `/`.
- Write a distinct title, description and main heading for each topic. Do not add keyword lists or duplicate an existing guide to target a minor wording variation.
- Each new article needs an honest publication date, a real byline, relevant primary sources, contextual links, a journal listing and an RSS item. Update source references when factual guidance changes.
- Keep the article headline in structured data aligned with its visible heading. Add only real organization details; this site is an educational publisher, not a local filing office.
- Add indexable pages to both `sitemap.xml` and `sitemap.html`. Keep `404.html` noindex and outside the sitemap. A missing URL must return HTTP 404.
- Update `lastmod` only after a meaningful change. A deployment or metadata adjustment alone does not make an old article newly published.
- Keep policy and referral information accessible. Use `rel="sponsored"` for activated paid referral links; maintain the existing approval controls in `config.js` and `site.js`.
- The default social image is a branded 1200 × 630 PNG. A social preview is not a guarantee about how Google displays a page.

## Search intent map

These are editorial topic assignments, not keyword-volume or ranking estimates. Hub pages explain the broader decision; linked articles address narrower tasks.

| Page | Topic / reader intent |
| --- | --- |
| `/about.html` | About BizGuide — Independent Business Resources |
| `/blog-after-formation.html` | After formation: organize your next 30 days — BizGuide |
| `/blog-business-setup-budget.html` | Build a business setup budget beyond the headline price — BizGuide |
| `/blog-domain-and-hosting-plan.html` | Your first business website: domain, hosting and access — BizGuide |
| `/blog-domain-renewal-checklist.html` | Business Domain Renewal Checklist — BizGuide |
| `/blog-ein-application-preparation.html` | Getting ready for an EIN application — BizGuide |
| `/blog-llc-preparation-checklist.html` | Before you form an LLC: a practical preparation checklist — BizGuide |
| `/blog-registered-agent-questions.html` | Seven questions to ask a registered agent service — BizGuide |
| `/blog-website-backup-plan.html` | Small Business Website Backup & Recovery Plan — BizGuide |
| `/blog-website-launch-checklist.html` | Small Business Website Launch Checklist — BizGuide |
| `/blog.html` | Business Setup & Website Planning Blog — BizGuide |
| `/contact.html` | Contact BizGuide — Editorial Questions & Corrections |
| `/disclosure.html` | Referral disclosure — BizGuide |
| `/domain-registration.html` | Domain registration planning — BizGuide |
| `/faq.html` | Business setup frequently asked questions — BizGuide |
| `/formation.html` | Business formation planning — BizGuide |
| `/guide-costs.html` | How to review a business service quote — BizGuide |
| `/guide-llc.html` | How to prepare for a U.S. LLC — BizGuide |
| `/guide-online.html` | Plan your business website — BizGuide |
| `/guide-planning.html` | Business setup planning checklist — BizGuide |
| `/guide-registered-agent.html` | What does a registered agent do? — BizGuide |
| `/guides.html` | Business planning guides — BizGuide |
| `/` | Business setup guides & provider research — BizGuide |
| `/pricing.html` | Business setup costs & renewals — BizGuide |
| `/privacy.html` | Privacy policy — BizGuide |
| `/provider.html` | Compare business service providers — BizGuide |
| `/registered-agent.html` | Registered agent service guide — BizGuide |
| `/services.html` | Business setup & website services — BizGuide |
| `/sitemap.html` | Site map — BizGuide |
| `/terms.html` | Website terms — BizGuide |
| `/website-hosting.html` | Website hosting planning — BizGuide |

## After publication

Check the deployed canonical pages and sitemap return HTTP 200, and a deliberately missing page returns HTTP 404. In the verified Search Console property, review sitemap processing, URL Inspection, Page indexing and Performance. Do not remove and recreate the property simply because indexing is delayed. Rich Results Test and Search Console are external checks; the local script checks syntax and consistency, not Google eligibility decisions. Use PageSpeed Insights on representative live templates and review field data when available.

The site currently uses static HTML and first-party CSS/JavaScript with no external font requests. This keeps the baseline small; it is not a measured performance score. No new analytics, advertising tracker or paid campaign was installed as part of preparation.

## Primary implementation references

- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/appearance/site-names
- https://developers.google.com/search/docs/appearance/structured-data/organization
- https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
