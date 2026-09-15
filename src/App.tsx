/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MusicProvider } from './context/MusicContext.tsx';
import { LettersWorld } from './components/experience/LettersWorld.tsx';

export default function App() {
  return (
    <MusicProvider>
      <LettersWorld />
    </MusicProvider>
  );
}

