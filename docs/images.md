# Site Image Plan

This file lists every non-player and non-staff image the team should prepare for the site.

Excluded on purpose:
- Player photos
- Staff photos

## Naming Rules

- Use lowercase filenames.
- Use hyphens instead of spaces.
- Prefer `.jpg` for photographic images and `.png` or `.svg` for logos with transparency.
- Keep one final approved version per filename so content editors are not guessing which file to use.

## Recommended Structure

```text
public/images/branding/
public/images/home/
public/images/merch/
public/images/partnership/
public/images/tickets/
public/images/contact/
public/images/fixtures/
public/images/sponsors/
```

## Global Brand Assets

These are used across the whole site or should exist even if a specific component is still using icons/placeholders today.

| Filename | Suggested size | Where it belongs | Description |
| --- | --- | --- | --- |
| `branding/club-crest-primary.png` | 1200x1200 | Navbar, footer, future brand placements | Main full-color club crest on transparent background. This should be the official master crest with clean edges, centered composition, and no glow or fake 3D effects. |
| `branding/club-crest-monochrome-white.png` | 1200x1200 | Dark backgrounds, overlays, watermark use | Single-color white crest for use over photography and dark sections. Keep it crisp and minimal so it reads well at small sizes. |
| `branding/club-wordmark-white.png` | 2000x600 | Navbar, footer, merchandise branding | Horizontal club wordmark for places where the full crest is too tall. Use the official typography or a carefully drawn custom wordmark, not a quick text export. |
| `branding/club-wordmark-color.png` | 2000x600 | Light backgrounds, documents, sponsor packs | Full-color horizontal wordmark version for broader brand use beyond the current site. |
| `branding/favicon-512.png` | 512x512 | Browser tab, app icons | Simplified crest or monogram that still reads clearly when reduced. Avoid tiny text because it will disappear at favicon size. |
| `branding/og-default.jpg` | 1200x630 | Social sharing fallback | Default social sharing image for the site. Use the crest, club colors, and a high-energy football background so shared links feel official rather than generic. |

## Landing Page

### Hero

| Filename | Suggested size | Section | Description |
| --- | --- | --- | --- |
| `home/home-hero-stadium.jpg` | 2400x1400 | Landing page hero | Wide cinematic stadium image with atmosphere, floodlights, crowd presence, and visible match intensity. It should feel like a marquee match night, with enough dark space for headline text to sit cleanly on top. |
| `home/home-hero-mobile.jpg` | 1200x1600 | Landing page hero on mobile | Vertical crop or alternate shot of the hero image that keeps the main subject centered on phones. Avoid important detail near the left and right edges. |

### Match Centre Support Art

These sections currently lean on UI, text, and icons, but the site will feel stronger if these assets exist for future use.

| Filename | Suggested size | Section | Description |
| --- | --- | --- | --- |
| `home/home-latest-result-cover.jpg` | 1600x900 | Latest result card or share image | Celebratory post-match image showing the team energy after a win or a key match moment. It should feel editorial and dramatic, suitable for a result recap card or social tile. |
| `home/home-next-fixture-cover.jpg` | 1600x900 | Next fixture card or promo area | Anticipation-focused match promo image, such as players walking out, fans arriving, or a lit stadium exterior. The goal is to communicate build-up rather than action aftermath. |

### Stay Connected

The social feed cards are placeholders today, but the site should still have branded visuals ready for embeds, empty states, or promo graphics.

| Filename | Suggested size | Section | Description |
| --- | --- | --- | --- |
| `home/home-social-instagram-placeholder.jpg` | 1080x1080 | Instagram block | Branded square image for when the Instagram feed is unavailable or not yet connected. Use club colors, crest, and a polished social-first composition rather than a plain logo on a flat background. |
| `home/home-social-x-placeholder.jpg` | 1600x900 | X/Twitter block | Clean branded graphic for the X feed placeholder. This should feel more like a news or announcement slate, with room for future overlaid copy if needed. |

### Landing Page CTA Tiles

| Filename | Suggested size | Section | Description |
| --- | --- | --- | --- |
| `home/home-shop-tile.jpg` | 1600x1200 | Official shop tile | Premium product-led image showing the club’s hero merchandise, ideally the latest home shirt styled neatly and lit professionally. It should look like retail photography, not a casual phone picture. |
| `home/home-partnership-tile.jpg` | 1600x1200 | Partnerships tile | Corporate-meets-football image that suggests brand collaboration, such as sponsor signage in stadium context, handshake moments, or hospitality environments. It should feel credible and commercial. |

## Merch Page

The current merch grid reuses one image for every product. The team should prepare at least one hero product image and a separate image for each core catalog item.

| Filename | Suggested size | Section | Description |
| --- | --- | --- | --- |
| `merch/merch-hero-kit.jpg` | 2000x2000 | Merch page anchor image | Signature product image for the season’s main kit. Show the shirt clearly, front-facing or slightly angled, with strong fabric detail and true-to-life club colors. |
| `merch/merch-home-kit.jpg` | 2000x2000 | Home kit card | Clean studio product image of the home jersey on neutral background. Keep shadows subtle and make sponsor marks, badge, and trim all legible. |
| `merch/merch-away-kit.jpg` | 2000x2000 | Away kit card | Same style as the home kit image so the store looks consistent. |
| `merch/merch-scarf.jpg` | 2000x2000 | Scarf product card | Folded or lightly styled scarf shot that clearly shows both color palette and woven details. |
| `merch/merch-training-top.jpg` | 2000x2000 | Training range card | Product image for the training top, matching the same lighting and angle as the jersey images. |
| `merch/merch-hoodie.jpg` | 2000x2000 | Hoodie product card | Premium apparel shot with the chest branding clearly visible and no distracting background clutter. |
| `merch/merch-cap.jpg` | 2000x2000 | Cap product card | Structured front or three-quarter cap image showing logo embroidery and color accurately. |

## Partnership Page

### Partner Logos

These are core content assets because the partnership page and dashboard both support sponsor/partner records.

| Filename | Suggested size | Section | Description |
| --- | --- | --- | --- |
| `sponsors/sponsor-global-port-logistics.png` | 1200x600 | Principal partners grid | Transparent-background logo exported cleanly from the sponsor’s official brand pack. Avoid screenshots or low-resolution web grabs. |
| `sponsors/sponsor-ocean-energy.png` | 1200x600 | Principal partners grid | Same standard as above. Logos should be normalized so they feel balanced when displayed together. |
| `sponsors/sponsor-harbor-bank.png` | 1200x600 | Principal partners grid | Clean vector-like export with good padding around the mark. |
| `sponsors/sponsor-sail-beverages.png` | 1200x600 | Principal partners grid | Transparent-background sponsor logo prepared for dark UI. |
| `sponsors/sponsor-webara-studio.png` | 1200x600 | Principal partners grid | Official logo lockup, centered and evenly padded. |
| `sponsors/sponsor-touchline-creator.png` | 1200x600 | Principal partners grid | Official logo prepared to match the visual weight of the other sponsor marks. |

### Partnership Storytelling

| Filename | Suggested size | Section | Description |
| --- | --- | --- | --- |
| `partnership/partnership-hero.jpg` | 2400x1400 | Partnership page feature image | Wide, premium image that sells the scale and professionalism of the club: crowd, hospitality, branded touchpoints, or stadium signage. It should reassure potential sponsors that the club is commercially serious. |
| `partnership/partnership-media-kit-cover.jpg` | 1600x900 | Media kit CTA or download promo | Polished cover image for a downloadable sponsor deck or media pack. Use club branding, audience energy, and a strong presentation-style composition. |

## Tickets Page

There are no ticket images in the current implementation, but this page has obvious image opportunities and should have prepared assets.

| Filename | Suggested size | Section | Description |
| --- | --- | --- | --- |
| `tickets/tickets-hero-matchday.jpg` | 2400x1400 | Tickets page hero or banner | Matchday atmosphere image focused on supporters entering the stadium, scarves up, lights on, and a sense of occasion. This should sell attendance emotionally. |
| `tickets/tickets-stadium-map.png` | 1800x1400 | Stadium info section | Clean branded stadium map or seating diagram showing stands, entrances, and key fan zones. This should be functional first, decorative second. |
| `tickets/tickets-season-pass.jpg` | 1600x900 | Season ticket promo | Premium fan-lifestyle image showing loyal supporters, seats, and club identity. It should communicate belonging and long-term commitment. |

## Fixtures Page

The fixtures page is text-led today, but it is one of the clearest places for expandable image content.

| Filename | Suggested size | Section | Description |
| --- | --- | --- | --- |
| `fixtures/fixtures-hero.jpg` | 2400x1400 | Fixtures page hero | Strong football atmosphere image that can represent the full season schedule. A wide action or stadium image works best here. |
| `fixtures/fixture-next-match-promo.jpg` | 1600x900 | Next fixture spotlight | Promo image focused on anticipation and event build-up for the upcoming match. |
| `fixtures/fixture-latest-result-promo.jpg` | 1600x900 | Latest result spotlight | Editorial recap image from a completed fixture, suitable for a result banner or summary card. |
| `fixtures/fixture-highlights-thumb-default.jpg` | 1280x720 | Fixture media/video thumbnail fallback | Default thumbnail image for match highlights when a video host thumbnail is unavailable. Use bold title-safe composition with room for a play icon overlay. |

## Contact Page

The contact page currently has no image slot, but two assets would improve it immediately and are worth preparing now.

| Filename | Suggested size | Section | Description |
| --- | --- | --- | --- |
| `contact/contact-stadium-exterior.jpg` | 2000x1200 | Contact page support visual | Clean exterior shot of the stadium or club office entrance. It should help visitors recognize the location in real life. |
| `contact/contact-map-card.jpg` | 1600x900 | Visit us / location support | Branded location image or stylized map card showing the surrounding area and access points. This should feel practical and easy to scan. |

## Site Sharing And Editorial Assets

These are not tied to one page component, but they matter across the site and should be planned as part of the image library.

| Filename | Suggested size | Section | Description |
| --- | --- | --- | --- |
| `branding/og-home.jpg` | 1200x630 | Shared homepage links | Social sharing image for the homepage with crest, club colors, and a flagship football scene. |
| `branding/og-merch.jpg` | 1200x630 | Shared merch links | Social sharing image focused on the latest shirt or fanwear. |
| `branding/og-partnership.jpg` | 1200x630 | Shared partnership links | Social sharing image that feels premium and sponsor-friendly. |
| `branding/og-tickets.jpg` | 1200x630 | Shared ticket links | Social sharing image built around matchday attendance and urgency. |

## Priority Order

If the team wants to work in phases, create these first:

1. `branding/club-crest-primary.png`
2. `branding/club-wordmark-white.png`
3. `branding/favicon-512.png`
4. `home/home-hero-stadium.jpg`
5. `home/home-shop-tile.jpg`
6. `partnership/partnership-hero.jpg`
7. All sponsor logo files in `sponsors/`
8. `merch/merch-home-kit.jpg`
9. `tickets/tickets-hero-matchday.jpg`
10. `fixtures/fixtures-hero.jpg`

## Quality Notes

- Avoid screenshots, WhatsApp exports, and social-media-compressed images.
- Keep color grading consistent so the site feels like one club, not a mix of unrelated assets.
- Leave some negative space in hero images so headlines and buttons can sit on top without covering key subjects.
- When exporting logos, preserve transparency and keep margins consistent across all sponsor files.
