# Media dimensions for Section blocks

What size to export an image or video for each block that holds media. Measured from the block code
(`src/blocks`), so it holds until a block's grid span or aspect ratio changes.

## The rules behind every number

- **Images: 2× the widest the frame ever renders.** The page column tops out at 1408px (viewport
  1536px and up), the composition grid splits it into 8 columns with a 32px gap, and full-bleed
  frames run the width of the window. Cloudflare resizes and serves AVIF/WebP per screen, so a
  larger upload costs nothing on the page; a smaller one goes soft on retina.
- **Video: 1920px wide (1080p) at the frame's ratio.** Cloudflare Stream builds the smaller
  renditions. Export MP4 (H.264). Go to 2560px only for a full-bleed frame that must stay sharp on
  large monitors.
- **Frames crop to fill, from the centre.** There is no focal point. Export at the listed ratio
  and nothing is lost; where a frame changes ratio between phone and desktop, keep the subject in
  the band both crops share (noted per block).
- **Keep images under 10 MB.** JPEG at high quality or PNG for flat graphics; no need to export
  WebP/AVIF yourself.

| Grid width | Rendered (max) | Export width |
|---|---|---|
| Full bleed (window) | viewport | 2880 |
| 8 columns (the page column) | 1408 | 2800 |
| 6 columns | 1048 | 2100 |
| 5 columns | 868 | 1800 |
| 4 columns | 688 | 1440 |
| 3 columns | 508 (575 stacked on a phone) | 1200 |

## By block

### Media and content

| Block | Option | Frame | Image | Video |
|---|---|---|---|---|
| Full media | Full width | 16:9 on phones, 21:9 from tablet | 2880 × 1620 (16:9). Subject in the middle 21:9 band (centre 76% of the height) | 1920 × 1080 (2560 × 1440 for a hero) |
| Full media | Contained, 16:9 | 16:9, 8 columns | 2800 × 1575 | 1920 × 1080 |
| Full media | Contained, 3:2 | 3:2, 8 columns | 2800 × 1867 | 1920 × 1280 |
| Full media | Contained, 21:9 | 21:9, 8 columns | 2800 × 1200 | 1920 × 824 |
| Media and content | 16:9 / 3:2 / 21:9 | chosen ratio, 4 columns | 1440 × 810 / 1440 × 960 / 1440 × 618 | 1920 wide at the same ratio |
| Split content (narrow) | | 5:4 on phones, 3:2 from tablet, 6 columns | 2100 × 1400 (3:2). Subject in the centre 5:4 (middle 83% of the width) | 1920 × 1280 |
| Carousel split | | each slide keeps its own ratio, 6 columns | 2100 wide | 1920 wide |
| Image pair | Left image | 4:5, 3 columns | 1200 × 1500 | 1080 × 1350 |
| Image pair | Right image | stretches to the left image's height from tablet (about 1.37:1, 1.40:1 at the narrowest), 16:10 on phones, 5 columns | 1736 × 1270. Subject in the centre 16:10 band (middle 85% of the height) | 1920 × 1400 |
| Split image offset | Large image | 5:4, 5 columns | 1800 × 1440 | 1350 × 1080 |
| Split image offset | Small image | 3:2, 3 columns | 1200 × 800 | 1280 × 854 |

### Media

| Block | Option | Frame | Image | Video |
|---|---|---|---|---|
| Image statement | Responsive (default) | 3:2 on phones, 21:9 from tablet | 2880 × 1920 (3:2). Subject in the middle 21:9 band (centre 64% of the height) | 1920 × 1280 |
| Image statement | 16:9 / 3:2 / 21:9 | chosen ratio | Full: 2880 wide. Contained: 2800 wide | 1920 wide at the same ratio |
| Caption | Full width | the media's own ratio, no crop | 2880 wide | 1920 wide |
| Caption | Contained | own ratio | 2800 wide | 1920 wide |
| Caption | Inset | own ratio, 768px max | 1600 wide | 1280 wide |
| Caption | Small | own ratio, 448px max | 900 wide | 1280 wide |
| YouTube | | hosted on YouTube | nothing to upload | upload 1080p or better to YouTube |

### Interactive

| Block | Option | Frame | Image | Video |
|---|---|---|---|---|
| Carousel | Contained, slide Full / Half / One third | each slide keeps its own ratio | 2800 / 2300 / 1200 wide | 1920 wide |
| Carousel | Full width, slide Full / Half / One third | own ratio | 2880 / 2400 / 1200 wide | 1920 wide |
| Carousel tabs | | own ratio, 5 columns (8 on tablet) | 1800 wide | 1920 wide |
| Feature tabs | | 3:2 below desktop, 16:9 on desktop, 5 columns | 1920 × 1080 (16:9). Subject in the centre 3:2 (middle 84% of the width) | 1920 × 1080 |

**Carousels:** a deck's slide height is capped at 70% of the window by its tallest slide, so
every slide in a deck should share one ratio. A portrait slide in a landscape deck shrinks the whole
deck.
