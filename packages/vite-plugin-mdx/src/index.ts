import type { CompileOptions } from "@mdx-js/mdx";
import { createFormatAwareProcessors } from "@mdx-js/mdx/lib/util/create-format-aware-processors.js";
import { Plugin } from "vite";
import { FilterPattern, createFilter } from "@rollup/pluginutils";
import { SourceMapGenerator } from "source-map";
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
}

export default function mdxPlugin(options: Options = {}): Plugin {
  options.jsx ??= true;
  const { include, exclude, ...rest } = options;
  const { extnames, process } = createFormatAwareProcessors({
    SourceMapGenerator,
    ...rest,
  });
  const filter = createFilter(include, exclude);

  return {
    name: "@mdx-js/rollup",

    enforce: "pre",

    async resolveId(id, importer, options) {
      const { name, query } = parseId(id);
      const extname = name.match(/\.([^.]+)$/)?.[1];
      if (extname && extnames.includes("." + extname)) {
        return this.resolve(
          name + query + (query ? "&" : "?") + "ext=.jsx",
          importer,
          { ...options, skipSelf: true },
        );
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
    query: query && "?" + query,
  };
}
