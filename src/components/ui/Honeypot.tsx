import styled from 'styled-components';

/**
 * A field bots fill and people never see. Hidden in place (clipped to nothing
 * at its own position) — never pushed off-screen: in an RTL page an element
 * at `left: -9999px` widens the scrollable area, so iOS lets the whole page
 * zoom out and pan sideways.
 */
export const Honeypot = styled.input`
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; border: 0;
  opacity: 0; overflow: hidden; clip-path: inset(50%); pointer-events: none;
`;
