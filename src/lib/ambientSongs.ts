export interface AmbientSong { id: string; name: string; artist: string }

export const AMBIENT_SONGS: AmbientSong[] = [
  { id: 'xilcxmW7xYo', name: 'אישתי',         artist: 'בן צור' },
  { id: 'Z7OD4VEeOu8', name: 'טאטע תטהר',     artist: 'בן צור' },
  { id: 'qHdf4FOtqdo', name: 'אמונה',          artist: 'בן צור' },
  { id: 'QBrY-J9Vm-s', name: 'סולי',           artist: 'בן צור' },
  { id: 'Jhx8kKQOUDQ', name: 'נשמות צמאות',   artist: 'בן צור' },
  { id: 'C590zIn1znM', name: 'כל עכבה לטובה', artist: 'בן צור' },
  { id: '-1L6W2Z2KwI', name: 'אהבת השם',      artist: 'בן צור' },
  { id: '_HTyC9emB74', name: 'השבעתי אתכם',   artist: 'ישי ריבו' },
  { id: 'a470tNqmYJg', name: 'אחת ולתמיד',    artist: 'ישי ריבו' },
  { id: 'iG_XzBrfcl8', name: 'רבי שמעון',     artist: 'ישי ריבו' },
  { id: 'GVqt0MRI1q8', name: 'אין לי מלבדך',  artist: 'ישי ריבו' },
  { id: 'tGilTBGfP1E', name: 'הלב שלי',       artist: 'ישי ריבו' },
  { id: 'kq67kMNGgpg', name: 'כתר מלוכה',     artist: 'ישי ריבו' },
  { id: 'j9cPwwhah0c', name: 'סדר העבודה',    artist: 'ישי ריבו' },
  { id: 'E5mCRmuaSXU', name: 'לילה טוב שון',  artist: 'חנן בן ארי' },
  { id: 'gQaCWeAIrHI', name: 'שבורי לב',      artist: 'חנן בן ארי' },
  { id: '-gACoOrsQZM', name: 'מולדת',          artist: 'חנן בן ארי' },
  { id: 'tm-0AW0MoSs', name: 'שמש',            artist: 'חנן בן ארי' },
  { id: 'WUSzwJFXh2o', name: 'בסוף זה הלחן',  artist: 'חנן בן ארי' },
  { id: 'WPpuU-8cvb0', name: 'חנניה',          artist: 'חנן בן ארי' },
];

export function shuffleSongs(arr: AmbientSong[]): AmbientSong[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
