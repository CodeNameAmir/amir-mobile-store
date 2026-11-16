/// <reference types="vite/client" />

import type { RawBuildCommitInfo } from './utils/buildInfo';

declare global {
  const __APP_BUILD_INFO__: RawBuildCommitInfo | undefined;
}
