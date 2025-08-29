import type { CompileOptions } from "@mdx-js/mdx";
import { Plugin, ResolvedConfig, createFilter, FilterPattern } from "vite";
import { SourceMapGenerator } from "source-map";
import fs from "node:fs";
import { createFormatAwareProcessors } from "@mdx-js/mdx/internal-create-format-aware-processors";
import { VFile } from "vfile";

export interface Options extends CompileOptions {
  /**
   * List of picomatch patterns to include
   */
  include?: FilterPattern;
  /**
   * List of picomatch patterns to exclude
   */
  exclude?: FilterPattern;
  /**
   * Use legacy resolution for older versions of Vite and React/Preact/Solid
   * plugins.
   *
   * @default false
   */
  legacyResolution?: boolean;
}

export function mdx(options: Options = {}): Plugin {
  const { include, exclude, legacyResolution = false, ...rest } = options;

  const { extnames, process } = createFormatAwareProcessors({
    SourceMapGenerator,
    ...rest,
  });

  const filter = createFilter(include, exclude);

  return {
    name: "vite-plugin-mdx",

    enforce: "pre",

    config() {
      // A minimal ESBuild plugin to allow optimizedDeps scanning
      const esbuildOptions: ResolvedConfig["optimizeDeps"]["esbuildOptions"] = {
        plugins: [
          {
            name: "mdx",
            setup(build) {
              build.onLoad({ filter: /\.mdx?$/ }, async (args) => {
                const contents = await fs.promises.readFile(args.path, "utf8");

                const compiled = await process(contents);

                return {
                  contents: String(compiled.value),
                  loader: "jsx",
                };
              });
            },
          },
        ],
      };

      return {
        optimizeDeps: {
          esbuildOptions,
        },
        ssr: {
          optimizeDeps: {
            esbuildOptions,
          },
        },
      };
    },

    async resolveId(id, importer, options) {
      if (!legacyResolution) return;

      const { name, searchParams } = parseId(id);
      const extname = name.match(/(\.[^.]+)$/)?.[1];
      if (extname && extnames.includes(extname)) {
        // Make sure ext=.jsx is at the very end
        searchParams.delete("ext");
        searchParams.set("ext", ".jsx");
        const query = "?" + searchParams.toString();

        const resolved = await this.resolve(name + query, importer, {
          ...options,
          skipSelf: true,
        });

        return resolved;
      }
    },

    async transform(code, id) {
      const name = id.split("?", 1)[0];
      const file = new VFile({ value: code, path: name });

      if (
        file.extname &&
        filter(file.path) &&
        extnames.includes(file.extname)
      ) {
        const compiled = await process(file);
        return {
          code: String(compiled.value),
          map: compiled.map,
        };
      }
    },
  };
}

function parseId(id: string) {
  const questionMarkPos = id.indexOf("?");
  let name: string;
  let query: string;

  if (questionMarkPos === -1) {
    name = id;
    query = "";
  } else {
    name = id.slice(0, questionMarkPos);
    query = id.slice(questionMarkPos + 1);
  }

  return {
    name,
    searchParams: new URLSearchParams(query),
  };
}
