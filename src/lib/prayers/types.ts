export interface StaticItem {
  icon?: string;
  label?: string;
  text: string;
}

export interface StaticGroup {
  title: string;
  explanation?: string;
  items: StaticItem[];
}

export interface SiddurPart {
  subtitle: string;
  sefariaRef: string;
}

export interface SiddurJump {
  label: string;
  match: string;
}

export interface SiddurSection {
  name: string;
  sefariaRef?: string;
  groups?: StaticGroup[];
  isMenorah?: boolean;
  parts?: SiddurPart[];
  jump?: SiddurJump;
}
