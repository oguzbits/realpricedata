import type { MDXComponents } from "mdx/types";

/**
 * Global MDX components configuration
 * This file is used by @next/mdx to provide components to all MDX files
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Default component overrides
    h2: (props) => (
      <h2
        className="mt-16 mb-8 text-3xl font-black tracking-tight uppercase italic"
        {...props}
      />
    ),
    h3: (props) => (
      <h3 className="mt-12 mb-4 text-xl font-bold uppercase" {...props} />
    ),
    p: (props) => (
      <p
        className="text-muted-foreground mb-6 text-lg leading-relaxed font-medium"
        {...props}
      />
    ),
    ...components,
  };
}
