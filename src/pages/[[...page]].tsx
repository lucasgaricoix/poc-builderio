import React from "react";
import { useRouter } from "next/router";
import { BuilderComponent, builder, useIsPreviewing } from "@builder.io/react";
import DefaultErrorPage from "next/error";
import Head from "next/head";

type Link = {
  label: string
  url: string
}

// Replace with your Public API Key
builder.init("03e7388953c641bf967d1944c109683e");

// Define a function that fetches the Builder
// content for a given page
export async function getStaticProps({ params }: any) {
  // Fetch the builder content for the given page
  const page = await builder.get("page", {
      userAttributes: {
        urlPath: "/" + (params?.page?.join("/") || ""),
      },
    })
    .toPromise();

  const links = await builder.getAll("nav-link", {
    options: {

    }
    // You can use options for queries, sorting, and targeting here
    // https://github.com/BuilderIO/builder/blob/main/packages/core/docs/interfaces/GetContentOptions.md
  });

  // Return the page content as props
  return {
    props: {
      page: page || null,
      links: links || null,
    },
    // Revalidate the content every 5 seconds
    revalidate: 5,
  };
}

// Define a function that generates the
// static paths for all pages in Builder
export async function getStaticPaths() {
  // Get a list of all pages in Builder
  const pages = await builder.getAll("page", {
    // We only need the URL field
    fields: "data.url",
    options: { noTargeting: true },
  });

  // Generate the static paths for all pages in Builder
  return {
    paths: [],
    fallback: true,
  };
}

// Define the Page component
export default function Page({ page, links }: any) {
  const router = useRouter();
  const isPreviewing = useIsPreviewing();

  // If the page is still being generated,
  // show a loading message
  if (router.isFallback) {
    return <h1>Loading...</h1>;
  }

  // If the page content is not available
  // and not in preview mode, show a 404 error page
  if (!page && !isPreviewing) {
    return <DefaultErrorPage statusCode={404} />;
  }

  // If the page content is available, render
  // the BuilderComponent with the page content
  return (
    <>
      <Head>
        <title>{page?.data.title}</title>
      </Head>
      {/** CMS Data */}
      <header>
        <nav className="flex justify-between items-center px-96">
          {links.map((link: any, index: number) => (
            <a key={index} href={link.data.url}>
              {link.data.label}
            </a>
          ))}
        </nav>
      </header>
      {/* Render the Builder page */}
      {/** Page model component */}
      <BuilderComponent model="page" content={page} /> 
    </>
  );
}
