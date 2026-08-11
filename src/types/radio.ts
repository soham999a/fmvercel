export interface RadioStation {
  id: string;
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  favicon: string;
  country: string;
  countrycode: string;
  language: string;
  tags: string;
  votes: number;
  codec: string;
  bitrate: number;
  homepage: string;
}

export interface CuratedStation {
  searchName: string;
  displayName: string;
  hint?: string; // optional country/tag hint
}

/**
 * Curated station catalog — 110+ verified stations across regions.
 * Balamii and Cinemix removed per direction.
 */
export const CURATED_STATIONS: Record<string, CuratedStation[]> = {
  india: [
    { searchName: 'Radio Mirchi', displayName: 'Radio Mirchi 98.3' },
    { searchName: 'Red FM 93.5', displayName: 'Red FM 93.5' },
    { searchName: 'Big FM 92.7', displayName: 'Big FM 92.7' },
    { searchName: 'Radio City', displayName: 'Radio City 91.1' },
    { searchName: 'Fever FM', displayName: 'Fever FM 104' },
    { searchName: 'Radio Nasha', displayName: 'Radio Nasha' },
    { searchName: 'All India Radio', displayName: 'All India Radio' },
    { searchName: 'AIR News', displayName: 'AIR News' },
    { searchName: 'AIR Bengali', displayName: 'AIR Bengali' },
    { searchName: 'Akashvani Kolkata', displayName: 'Akashvani Kolkata' },
    { searchName: 'Friends FM', displayName: 'Friends 91.9 FM Kolkata' },
    { searchName: 'Radio Foorti', displayName: 'Radio Foorti' },
    { searchName: 'Radio Mango', displayName: 'Radio Mango 91.9' },
    { searchName: 'Suryan FM', displayName: 'Suryan FM' },
    { searchName: 'Radio Mirchi Tamil', displayName: 'Mirchi Tamil' },
    { searchName: 'Vividh Bharati', displayName: 'Vividh Bharati' },
    { searchName: 'Radio Indigo', displayName: 'Radio Indigo 91.9' },
    { searchName: 'Radio Mirchi Marathi', displayName: 'Mirchi Marathi' },
    { searchName: 'Radio One India', displayName: 'Radio One 94.3' },
    { searchName: 'Bombay Beats', displayName: 'Bombay Beats' },
    { searchName: 'Hungama Bollywood', displayName: 'Hungama Bollywood' },
    { searchName: 'Radio Sadaye', displayName: 'Radio Sadaye Kashmir' },
    { searchName: 'Kolkata FM', displayName: 'Kolkata FM' },
    { searchName: 'Mirchi Bengali', displayName: 'Mirchi Bengali 98.3' },
    { searchName: 'Radio Choice Bengali', displayName: 'Radio Choice Bengali' },
    { searchName: 'Aamar FM', displayName: 'Aamar FM 106.2 Kolkata' },
    { searchName: 'Power FM 107.8', displayName: '107.8 Power FM Kolkata' },
    { searchName: 'Radio Misty', displayName: 'Radio Misty Bengal' },
    { searchName: 'Amar 106.2', displayName: 'Amar 106.2 Kolkata' },
  ],
  us: [
    { searchName: 'NPR News', displayName: 'NPR News' },
    { searchName: 'KEXP', displayName: 'KEXP Seattle' },
    { searchName: 'WFMU', displayName: 'WFMU' },
    { searchName: 'KCRW', displayName: 'KCRW' },
    { searchName: 'Hot 97', displayName: 'Hot 97 NY' },
    { searchName: 'Z100', displayName: 'Z100 New York' },
    { searchName: 'Power 106', displayName: 'Power 106 LA' },
    { searchName: 'KISS FM 102.7', displayName: 'KIIS FM Los Angeles' },
    { searchName: 'WNYC', displayName: 'WNYC' },
    { searchName: 'KROQ', displayName: 'KROQ 106.7' },
    { searchName: 'ESPN Radio', displayName: 'ESPN Radio' },
    { searchName: 'Bloomberg Radio', displayName: 'Bloomberg Radio' },
    { searchName: 'WBEZ', displayName: 'WBEZ Chicago' },
    { searchName: 'The Beat 96.5', displayName: 'The Beat 96.5' },
    { searchName: 'Alt Nation', displayName: 'Alt Nation' },
  ],
  europe: [
    { searchName: 'BBC Radio 1', displayName: 'BBC Radio 1' },
    { searchName: 'BBC Radio 2', displayName: 'BBC Radio 2' },
    { searchName: 'BBC Radio 4', displayName: 'BBC Radio 4' },
    { searchName: 'BBC Radio 6 Music', displayName: 'BBC Radio 6 Music' },
    { searchName: 'BBC World Service', displayName: 'BBC World Service' },
    { searchName: 'NTS Radio', displayName: 'NTS Radio London' },
    { searchName: 'Rinse FM', displayName: 'Rinse FM' },
    { searchName: 'Capital FM UK', displayName: 'Capital FM UK' },
    { searchName: 'Heart FM', displayName: 'Heart FM' },
    { searchName: 'RTL', displayName: 'RTL Radio' },
    { searchName: 'NRJ', displayName: 'NRJ France' },
    { searchName: 'FIP Radio', displayName: 'FIP Paris' },
    { searchName: 'TSF Jazz', displayName: 'TSF Jazz' },
    { searchName: 'Antenne Bayern', displayName: 'Antenne Bayern' },
    { searchName: 'Deutschlandfunk', displayName: 'Deutschlandfunk' },
    { searchName: 'Radio 538', displayName: 'Radio 538 Netherlands' },
    { searchName: 'Cadena SER', displayName: 'Cadena SER Spain' },
    { searchName: 'Los 40', displayName: 'Los 40 Principales' },
    { searchName: 'RAI Radio 1', displayName: 'RAI Radio 1 Italy' },
    { searchName: 'Sveriges Radio P3', displayName: 'Sveriges Radio P3' },
  ],
  australia: [
    { searchName: 'Triple J', displayName: 'Triple J' },
    { searchName: 'Nova 96.9', displayName: 'Nova 96.9 Sydney' },
    { searchName: 'ABC Radio National', displayName: 'ABC Radio National' },
    { searchName: 'KIIS 1065', displayName: 'KIIS 1065 Sydney' },
    { searchName: 'RNZ National', displayName: 'RNZ National' },
  ],
  southamerica: [
    { searchName: 'Rádio Gaúcha', displayName: 'Rádio Gaúcha' },
    { searchName: 'Caracol Radio', displayName: 'Caracol Radio' },
    { searchName: 'Jovem Pan FM', displayName: 'Jovem Pan FM' },
    { searchName: 'Radio Nacional AR', displayName: 'Radio Nacional Argentina' },
    { searchName: 'Radio Mitre', displayName: 'Radio Mitre Buenos Aires' },
    { searchName: 'La 100', displayName: 'La 100 FM' },
    { searchName: 'Antena 1', displayName: 'Antena 1 Brasil' },
    { searchName: 'Radio Bio Bio', displayName: 'Bio Bio Chile' },
    { searchName: 'RPP Noticias', displayName: 'RPP Noticias Peru' },
    { searchName: 'Radio Cooperativa', displayName: 'Cooperativa Chile' },
  ],
  africa: [
    { searchName: 'Metro FM', displayName: 'Metro FM South Africa' },
    { searchName: 'Kaya 959', displayName: 'Kaya 959 Johannesburg' },
    { searchName: '5FM', displayName: '5FM' },
    { searchName: 'YFM', displayName: 'YFM Johannesburg' },
    { searchName: 'Jacaranda FM', displayName: 'Jacaranda FM' },
    { searchName: 'Classic FM 102.7', displayName: 'Classic FM Lagos' },
    { searchName: 'Capital FM Kenya', displayName: 'Capital FM Kenya' },
    { searchName: 'Radio Citizen', displayName: 'Radio Citizen Kenya' },
    { searchName: 'Nile FM', displayName: 'Nile FM Egypt' },
    { searchName: 'Hit Radio Maroc', displayName: 'Hit Radio Morocco' },
    { searchName: 'Peace FM', displayName: 'Peace FM Ghana' },
    { searchName: 'Radio Ghana', displayName: 'Radio Ghana' },
    { searchName: 'Cool FM Nigeria', displayName: 'Cool FM Nigeria' },
    { searchName: 'Wazobia FM', displayName: 'Wazobia FM' },
    { searchName: 'Metro FM Kenya', displayName: 'Metro FM Kenya' },
  ],
  apac: [
    { searchName: 'J-Wave', displayName: 'J-Wave Tokyo' },
    { searchName: 'InterFM', displayName: 'InterFM Tokyo' },
    { searchName: 'FM Yokohama', displayName: 'FM Yokohama' },
    { searchName: 'Class 95', displayName: 'Class 95 Singapore' },
    { searchName: '987FM Singapore', displayName: '987FM Singapore' },
    { searchName: 'KBS Cool FM', displayName: 'KBS Cool FM Korea' },
    { searchName: 'MBC FM4U', displayName: 'MBC FM4U Korea' },
    { searchName: 'Prambors FM', displayName: 'Prambors Indonesia' },
    { searchName: 'Gen FM', displayName: 'Gen FM Jakarta' },
    { searchName: 'Fly FM', displayName: 'Fly FM Malaysia' },
    { searchName: 'Hitz FM', displayName: 'Hitz FM Malaysia' },
    { searchName: 'Cool 93', displayName: 'Cool 93 Thailand' },
    { searchName: 'Virgin Hitz', displayName: 'Virgin Hitz Bangkok' },
    { searchName: 'VOV', displayName: 'VOV Vietnam' },
    { searchName: 'XoneFM', displayName: 'Xone FM Vietnam' },
    { searchName: 'Radio Taiwan', displayName: 'Radio Taiwan International' },
    { searchName: 'RTHK Radio 3', displayName: 'RTHK Radio 3 Hong Kong' },
    { searchName: 'CBC Radio One', displayName: 'CBC Radio One Canada' },
    { searchName: 'CBC Music', displayName: 'CBC Music' },
    { searchName: 'KNR Greenland', displayName: 'KNR Greenland' },
  ],
  editors: [
    { searchName: 'KEXP', displayName: 'KEXP Seattle' },
    { searchName: 'NTS Radio', displayName: 'NTS Radio London' },
    { searchName: 'Worldwide FM', displayName: 'Worldwide FM' },
    { searchName: 'KCRW', displayName: 'KCRW Santa Monica' },
    { searchName: 'RTR FM', displayName: 'RTR-FM Perth' },
    { searchName: 'Radiooooo', displayName: 'Radiooooo · France' },
    { searchName: 'dublab', displayName: 'dublab Los Angeles' },
    { searchName: 'FIP Radio', displayName: 'FIP Paris' },
    { searchName: 'TSF Jazz', displayName: 'TSF Jazz' },
    { searchName: 'Netil Radio', displayName: 'Netil Radio' },
    { searchName: 'Soho Radio', displayName: 'Soho Radio London' },
    { searchName: 'The Lot Radio', displayName: 'The Lot Radio Brooklyn' },
    { searchName: 'Rinse FM', displayName: 'Rinse FM' },
  ],
};

export interface Region {
  id: string;
  name: string;
  code: string;      // ISO short code for display
  countries: string[];
  count: number;     // curated count target
}

export const REGIONS: Region[] = [
  { id: 'india',        name: 'India',          code: 'IN',  countries: ['IN'],                                                                                     count: 25 },
  { id: 'us',           name: 'United States',  code: 'US',  countries: ['US'],                                                                                     count: 15 },
  { id: 'europe',       name: 'Europe',         code: 'EU',  countries: ['GB','DE','FR','ES','IT','NL','BE','SE','NO','DK','FI','PL','IE','AT','CH','PT','CZ'],       count: 20 },
  { id: 'apac',         name: 'Asia Pacific',   code: 'AP',  countries: ['JP','SG','KR','ID','MY','TH','VN','TW','HK','PH','CA'],                                    count: 20 },
  { id: 'australia',    name: 'Australia · NZ', code: 'AU',  countries: ['AU','NZ'],                                                                                 count: 5 },
  { id: 'southamerica', name: 'South America',  code: 'SA',  countries: ['BR','AR','CL','CO','PE','VE','UY'],                                                        count: 10 },
  { id: 'africa',       name: 'Africa',         code: 'AF',  countries: ['ZA','NG','KE','EG','MA','GH','TZ','UG'],                                                   count: 15 },
];

export const CATEGORIES = [
  { id: 'editors',   name: "Editor's Picks",  icon: 'star' },
  { id: 'trending',  name: 'Trending',         icon: 'trending' },
  { id: 'news',      name: 'News',             icon: 'news' },
  { id: 'jazz',      name: 'Jazz',             icon: 'music' },
  { id: 'classical', name: 'Classical',        icon: 'music' },
  { id: 'rock',      name: 'Rock',             icon: 'music' },
  { id: 'bollywood', name: 'Bollywood',        icon: 'music' },
  { id: 'talk',      name: 'Talk',             icon: 'mic' },
  { id: 'electronic',name: 'Electronic',       icon: 'wave' },
] as const;
