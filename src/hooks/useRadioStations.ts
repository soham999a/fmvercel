import { useQuery } from '@tanstack/react-query';
import { RadioStation, REGIONS, CURATED_STATIONS } from '@/types/radio';

const RADIO_BROWSER_API = 'https://de1.api.radio-browser.info/json';

function transformStation(station: any): RadioStation {
  return {
    ...station,
    id: station.stationuuid || station.id,
    url: station.url_resolved || station.url,
    url_resolved: station.url_resolved || station.url,
  };
}

async function fetchStationsByCountry(countryCode: string, limit = 10): Promise<RadioStation[]> {
  const response = await fetch(
    `${RADIO_BROWSER_API}/stations/bycountrycodeexact/${countryCode}?limit=${limit}&order=votes&reverse=true&hidebroken=true`
  );
  if (!response.ok) throw new Error('Failed to fetch stations');
  const data = await response.json();
  return data.map(transformStation);
}

async function fetchStationsByName(name: string, limit = 3): Promise<RadioStation[]> {
  const response = await fetch(
    `${RADIO_BROWSER_API}/stations/byname/${encodeURIComponent(name)}?limit=${limit}&order=votes&reverse=true&hidebroken=true`
  );
  if (!response.ok) return [];
  const data = await response.json();
  return data.map(transformStation);
}

async function searchStations(query: string, limit = 20): Promise<RadioStation[]> {
  const response = await fetch(
    `${RADIO_BROWSER_API}/stations/byname/${encodeURIComponent(query)}?limit=${limit}&order=votes&reverse=true&hidebroken=true`
  );
  if (!response.ok) throw new Error('Failed to search stations');
  const data = await response.json();
  return data.map(transformStation);
}

async function fetchStationsForRegion(regionId: string): Promise<RadioStation[]> {
  const region = REGIONS.find(r => r.id === regionId);
  const curatedList = CURATED_STATIONS[regionId] || [];
  const targetCount = region?.count ?? 12;

  // Fetch curated stations by name — parallel
  const curatedResults = await Promise.all(
    curatedList.map(async (c) => {
      try {
        const stations = await fetchStationsByName(c.searchName, 2);
        return stations[0] || null;
      } catch {
        return null;
      }
    })
  );

  const seenIds = new Set<string>();
  const combined: RadioStation[] = [];

  for (const s of curatedResults) {
    if (s && !seenIds.has(s.id)) {
      combined.push(s);
      seenIds.add(s.id);
    }
  }

  // Fill gaps by country if we have countries defined
  if (region && combined.length < targetCount) {
    const countryStations = await Promise.all(
      region.countries.slice(0, 6).map(cc => fetchStationsByCountry(cc, 6).catch(() => []))
    );
    for (const s of countryStations.flat()) {
      if (!seenIds.has(s.id)) {
        combined.push(s);
        seenIds.add(s.id);
        if (combined.length >= targetCount) break;
      }
    }
  }

  return combined.slice(0, targetCount);
}

async function fetchEditorsPicks(): Promise<RadioStation[]> {
  const list = CURATED_STATIONS.editors || [];
  const results = await Promise.all(
    list.map(async (c) => {
      try {
        const stations = await fetchStationsByName(c.searchName, 2);
        return stations[0] || null;
      } catch {
        return null;
      }
    })
  );
  return results.filter((s): s is RadioStation => s !== null);
}

export function useStationsByRegion(regionId: string) {
  return useQuery({
    queryKey: ['stations', 'region', regionId],
    queryFn: () => fetchStationsForRegion(regionId),
    staleTime: 1000 * 60 * 10,
  });
}

export function useEditorsPicks() {
  return useQuery({
    queryKey: ['stations', 'editors'],
    queryFn: fetchEditorsPicks,
    staleTime: 1000 * 60 * 15,
  });
}

export function useSearchStations(query: string) {
  return useQuery({
    queryKey: ['stations', 'search', query],
    queryFn: () => searchStations(query),
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}

export function usePopularStations() {
  return useQuery({
    queryKey: ['stations', 'popular'],
    queryFn: async () => {
      const response = await fetch(
        `${RADIO_BROWSER_API}/stations/topvote/24?hidebroken=true`
      );
      if (!response.ok) throw new Error('Failed to fetch popular stations');
      const data = await response.json();
      return data.map(transformStation) as RadioStation[];
    },
    staleTime: 1000 * 60 * 10,
  });
}
