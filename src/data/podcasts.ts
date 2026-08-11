export interface PodcastFeed {
  feedUrl: string;
  title: string;
  publisher: string;
  category: string;
  image: string;
}

/** Curated public podcast feeds — BBC, NPR, AIR/Prasar Bharati, tech, business, science. */
export const CURATED_PODCASTS: PodcastFeed[] = [
  // BBC
  {
    feedUrl: 'https://podcasts.files.bbci.co.uk/p02nq0gn.rss',
    title: 'Global News Podcast',
    publisher: 'BBC World Service',
    category: 'News',
    image: 'https://ichef.bbci.co.uk/images/ic/1200x1200/p0kd8fzn.jpg',
  },
  {
    feedUrl: 'https://podcasts.files.bbci.co.uk/p02pc9pj.rss',
    title: 'The Documentary Podcast',
    publisher: 'BBC World Service',
    category: 'Documentary',
    image: 'https://ichef.bbci.co.uk/images/ic/1200x1200/p0kd8jvk.jpg',
  },
  {
    feedUrl: 'https://podcasts.files.bbci.co.uk/w13xtvgd.rss',
    title: 'The Inquiry',
    publisher: 'BBC World Service',
    category: 'News',
    image: 'https://ichef.bbci.co.uk/images/ic/1200x1200/p0jznsxp.jpg',
  },
  // NPR
  {
    feedUrl: 'https://feeds.npr.org/500005/podcast.xml',
    title: 'Up First',
    publisher: 'NPR',
    category: 'News',
    image: 'https://media.npr.org/assets/img/2022/09/23/upfirst_tile_npr-network-01_sq-05e01d4c1c1c30c8f37e2f4c3f4d6f83ea6e2027.jpg',
  },
  {
    feedUrl: 'https://feeds.npr.org/510289/podcast.xml',
    title: 'Planet Money',
    publisher: 'NPR',
    category: 'Business',
    image: 'https://media.npr.org/assets/img/2022/09/12/planet-money_tile_npr-network-01_sq-6ae4b8c4e5e0f5c50a2eee5c1b3a2f5b6a5c88c8.jpg',
  },
  {
    feedUrl: 'https://feeds.npr.org/510308/podcast.xml',
    title: 'Short Wave',
    publisher: 'NPR',
    category: 'Science',
    image: 'https://media.npr.org/assets/img/2022/09/23/shortwave_tile_npr-network-01_sq.jpg',
  },
  {
    feedUrl: 'https://feeds.npr.org/510282/podcast.xml',
    title: 'Fresh Air',
    publisher: 'NPR',
    category: 'Interview',
    image: 'https://media.npr.org/assets/img/2022/09/23/freshair_tile_npr-network-01_sq.jpg',
  },
  // Tech / Business
  {
    feedUrl: 'https://feeds.simplecast.com/54nAGcIl',
    title: 'The Daily',
    publisher: 'The New York Times',
    category: 'News',
    image: 'https://image.simplecastcdn.com/images/03d8b493-87fc-4bd7-931f-8a04d1f2a2ac/2cce5659-f647-4366-b318-46e4b67afcfa/3000x3000/the-daily-logo.jpg',
  },
  {
    feedUrl: 'https://lexfridman.com/feed/podcast/',
    title: 'Lex Fridman Podcast',
    publisher: 'Lex Fridman',
    category: 'Interview',
    image: 'https://lexfridman.com/wordpress/wp-content/uploads/powerpress/artwork_3000-3.png',
  },
  {
    feedUrl: 'https://feeds.megaphone.fm/hubermanlab',
    title: 'Huberman Lab',
    publisher: 'Scicomm Media',
    category: 'Science',
    image: 'https://megaphone.imgix.net/podcasts/e390e07a-1f4a-11ec-9dc9-6fe2b3e3d8f1/image/HubermanLab_2000x2000.png',
  },
  // India
  {
    feedUrl: 'https://feeds.simplecast.com/nD00tKBu',
    title: 'The Seen and the Unseen',
    publisher: 'Amit Varma',
    category: 'India',
    image: 'https://image.simplecastcdn.com/images/9c22e0a4-3f9c-4a3c-9f4a-9b9a7c9a1b3a/f8e0e6e0-1b3a-4f4a-9c22-e0a43f9c4a3c/3000x3000/tsatu-cover.jpg',
  },
  {
    feedUrl: 'https://feeds.megaphone.fm/thefilterindia',
    title: 'The Filter Coffee',
    publisher: 'Karthik Nachiappan',
    category: 'India',
    image: 'https://megaphone.imgix.net/podcasts/thefilterindia/image/cover.jpg',
  },
];
