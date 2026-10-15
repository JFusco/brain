import DOMPurify from "isomorphic-dompurify";
import { getPage, getStack } from "@/lib/contentstack";
import { headers } from "next/headers";
import Image from "next/image";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    live_preview?: string;
    content_type_uid?: string;
    entry_uid?: string;
    preview_timestamp?: string;
  }>;
}) {
  await headers();
  const { live_preview, entry_uid, content_type_uid, preview_timestamp } =
    await searchParams;

  const stack = getStack();

  if (live_preview) {
    stack.livePreviewQuery({
      live_preview,
      contentTypeUid: content_type_uid || "",
      entryUid: entry_uid || "",
      preview_timestamp: preview_timestamp || "",
    });
  }

  const page = await getPage("/", stack);

  return (
    <main className="max-w-(--breakpoint-md) mx-auto">
      <section className="p-4">
        {live_preview ? (
          <ul className="mb-8 text-sm">
            <li>
              live_preview_hash: <code>{live_preview}</code>
            </li>
            <li>
              content_type_uid: <code>{content_type_uid}</code>
            </li>
            <li>
              entry_uid: <code>{entry_uid}</code>
            </li>
            {preview_timestamp ? (
              <li>
                preview_timestamp: <code>{preview_timestamp}</code>
              </li>
            ) : null}
          </ul>
        ) : null}

        {page?.title ? (
          <h1
            className="text-4xl font-bold mb-4"
            {...(page?.$ && page?.$.title)}
          >
            {page?.title}
          </h1>
        ) : null}

        {page?.description ? (
          <p className="mb-4" {...(page?.$ && page?.$.description)}>
            {page?.description}
          </p>
        ) : null}

        {page?.image ? (
          <Image
            className="mb-4"
            width={768}
            height={414}
            src={page?.image.url}
            alt={page?.image.title}
            {...(page?.image?.$ && page?.image?.$.url)}
          />
        ) : null}

        {page?.rich_text ? (
          <div
            {...(page?.$ && page?.$.rich_text)}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(page?.rich_text),
            }}
          />
        ) : null}

        <div className="space-y-8 max-w-full mt-4">
          {page?.blocks?.map((item, index) => {
            const { block } = item;
            const isImageLeft = block.layout === "image_left";

            return (
              <div
                key={block._metadata.uid}
                {...(page?.$ && page?.$[`blocks__${index}`])}
                className={`flex flex-col md:flex-row items-center space-y-4 md:space-y-0 bg-slate-100 ${
                  isImageLeft ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className="w-full md:w-1/2">
                  {block.image ? (
                    <Image
                      src={block.image.url}
                      alt={block.image.title}
                      width={200}
                      height={112}
                      className="w-full"
                      {...(block?.$ && block?.$.image)}
                    />
                  ) : null}
                </div>
                <div className="w-full md:w-1/2 p-4">
                  {block.title ? (
                    <h2
                      className="text-2xl font-bold"
                      {...(block?.$ && block?.$.title)}
                    >
                      {block.title}
                    </h2>
                  ) : null}
                  {block.copy ? (
                    <div
                      {...(block?.$ && block?.$.copy)}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(block.copy),
                      }}
                      className="prose"
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
