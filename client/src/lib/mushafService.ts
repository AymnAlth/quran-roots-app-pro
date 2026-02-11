import axios from 'axios';

// Add required header so backend verifySource middleware accepts requests from the client
const api = axios.create({
  baseURL: '/api',
  headers: {
    'x-app-source': 'quran-roots-client-v1'
  }
});

export async function fetchSurah(surahNo: number) {
  const res = await api.get(`/surahs/${surahNo}`);
  return res.data;
}

export async function fetchAyah(ayahId: number) {
  const res = await api.get(`/ayah/${ayahId}`);
  return res.data;
}

export async function fetchByJuz(juz: number) {
  const res = await api.get(`/mushaf/by-juz/${juz}`);
  return res.data;
}

export async function fetchByPage(page: number) {
  const res = await api.get(`/mushaf/by-page/${page}`);
  return res.data;
}

export async function searchPlain(q: string, scope?: { type: 'surah'|'juz'|'page', value: number } ) {
  const params: any = { q };
  if (scope) { params.scope = scope.type; params.value = scope.value; }
  const res = await api.get('/mushaf/search', { params });
  return res.data;
}

export default {
  fetchSurah,
  fetchAyah,
  fetchByJuz,
  fetchByPage,
  searchPlain,
};
