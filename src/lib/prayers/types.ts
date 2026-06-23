export interface StaticItem {
  icon?: string;
  label?: string;
  text: string;
}

export interface StaticGroup {
  title: string;
  items: StaticItem[];
}

export interface SiddurSection {
  name: string;
  sefariaRef?: string;
  groups?: StaticGroup[];
}
