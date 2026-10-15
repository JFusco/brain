import contentstack, { QueryOperation } from "@contentstack/delivery-sdk"
import ContentstackLivePreview, { IStackSdk } from "@contentstack/live-preview-utils";
import { getContentstackEndpoint, type ContentstackEndpoints } from "@contentstack/utils";
import { Page } from "./types";

// Region and endpoint configuration - computed once at module load time
// region resolution is now handled by getContentstackEndpoint
const endpoints = getContentstackEndpoint(process.env.NEXT_PUBLIC_CONTENTSTACK_REGION || 'NA', '', true) as ContentstackEndpoints

/**
 * Creates a new Contentstack SDK instance for each request.
 * 
 * IMPORTANT: This function MUST be called for each server-side request to ensure isolation.
 * 
 * Why isolated instances are critical:
 * - When Live Preview is enabled, the SDK modifies its configuration (API endpoints, etc.) 
 *   for specific requests via livePreviewQuery()
 * - Sharing a single SDK instance across concurrent requests causes configuration changes 
 *   from one user (User A) to affect others (User B), leading to incorrect content delivery
 * - Each request gets its own isolated stack instance, preventing cross-request interference
 * 
 * Usage:
 * - Server-side: Always call getStack() at the start of each request handler
 * - Client-side: Can reuse instances as there's no concurrent request handling
 */
export function getStack() {
  // Create a fresh stack instance with base configuration
  return contentstack.stack({
    apiKey: process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY as string,
    deliveryToken: process.env.NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN as string,
    environment: process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT as string,
    // Setting the region
    // for custom or dedicated Contentstack environments, override each endpoint individually using environment variables.
    // You can omit this if you have set a region above. Use @contentstack/utils getContentstackEndpoint to get the right urls for your region.
    region: process.env.NEXT_PUBLIC_CONTENTSTACK_REGION as any,
    // Setting the host for content delivery based on the region or environment variables
    // for custom or dedicated Contentstack environments, override each endpoint individually using environment variables.
    host: process.env.NEXT_PUBLIC_CONTENTSTACK_CONTENT_DELIVERY || endpoints.contentDelivery as string,

    live_preview: {
      enable: process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW === 'true',
      preview_token: process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN,
      // Setting the host for live preview based on the region
      // for custom or dedicated Contentstack environments, override each endpoint individually using environment variables.
      host: process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW_HOST || endpoints.preview as string
    }
  });
}

/**
 * Initializes Contentstack Live Preview for client-side editing.
 * 
 * This function is called once on the client-side (via ContentstackLivePreview component)
 * to enable the visual editing interface. It creates a stack instance to read configuration
 * but doesn't perform any server-side queries, so it's safe to call getStack() here.
 * 
 * Note: This is client-side only and doesn't affect server-side request isolation.
 */
export function initLivePreview() {
  // Create a stack instance to read configuration for Live Preview initialization
  const stack = getStack();
  ContentstackLivePreview.init({
    ssr: true,
    enable: process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW === 'true',
    mode: "builder",
    stackSdk: stack.config as IStackSdk,
    stackDetails: {
      apiKey: process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY as string,
      environment: process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT as string,
    },
    clientUrlParams: {
      // Setting the client URL parameters for live preview
      // for custom or dedicated Contentstack environments, override each endpoint individually using environment variables.
      host: process.env.NEXT_PUBLIC_CONTENTSTACK_CONTENT_APPLICATION || endpoints.application as string

    },
    editButton: {
      enable: true,
      exclude: ["outsideLivePreviewPortal"]
    },
  });
}

/**
 * Fetches a page entry from Contentstack by URL.
 * 
 * This function is focused solely on fetching page data - it does not handle Live Preview
 * configuration. Live Preview setup should be done by the caller before passing the stack instance.
 * 
 * @param url - The URL path to match against the page entry's url field
 * @param stackInstance - Optional pre-configured stack instance. If provided, uses this instance
 *                        (useful when Live Preview has been configured). If not provided, creates
 *                        a new isolated stack instance via getStack().
 * 
 * Usage pattern for Live Preview:
 *   1. Create a stack: const stack = getStack()
 *   2. Configure Live Preview: stack.livePreviewQuery({ ... })
 *   3. Pass to getPage: const page = await getPage("/", stack)
 * 
 * Usage pattern without Live Preview:
 *   const page = await getPage("/") // Creates its own isolated stack
 */
export async function getPage(url: string, stackInstance?: ReturnType<typeof getStack>) {
  // Use provided stack instance (with Live Preview config) or create a new isolated one
  const stack = stackInstance || getStack();

  // Query Contentstack for the page entry matching the URL
  const result = await stack
    .contentType("page")
    .entry()
    .query()
    .where("url", QueryOperation.EQUALS, url)
    .find<Page>();

  if (result.entries) {
    const entry = result.entries[0]

    // Add editable tags for Live Preview if enabled
    // These tags enable the visual editing interface to identify editable fields
    if (process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW === 'true') {
      contentstack.Utils.addEditableTags(entry, 'page', true);
    }

    return entry;
  }
}