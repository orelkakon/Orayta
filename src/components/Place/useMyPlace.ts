'use client';

import { useEffect, useState } from 'react';
import { MyPlace, onPlaceChange, readPlace } from '@/lib/myPlace';

export interface PlaceState {
  place: MyPlace | null;
  /** False until the device storage has been read (avoids a flash of "Jerusalem"). */
  ready: boolean;
}

/** The device's chosen place, kept in sync across components and tabs. */
export function useMyPlace(): PlaceState {
  const [state, setState] = useState<PlaceState>({ place: null, ready: false });
  useEffect(() => {
    setState({ place: readPlace(), ready: true });
    return onPlaceChange(place => setState({ place, ready: true }));
  }, []);
  return state;
}
