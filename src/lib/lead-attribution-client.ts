'use client';

import { createVisitAttributionCapture } from './lead-attribution.mjs';

// As ferramentas e o formulário do layout compartilham a primeira entrada da
// visita SPA. Somente UTMs permitidas e caminho público ficam em memória.
export const captureVisitAttribution = createVisitAttributionCapture();
