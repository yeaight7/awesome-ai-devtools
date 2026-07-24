/// <reference types="vite/client" />

declare module "virtual:catalog" {
  import type { WebCatalog } from "./lib/types";

  const catalog: WebCatalog;
  export default catalog;
}
