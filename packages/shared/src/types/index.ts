import type { BuilderConfig } from '@modern-js/builder-rspack-provider';
import type { PluggableList } from 'unified';
import type { BuilderPlugin } from '@modern-js/builder';
import type { ZoomOptions } from 'medium-zoom';
import type {
  Config as DefaultThemeConfig,
  NormalizedConfig as NormalizedDefaultThemeConfig,
} from './defaultTheme';
import type { RspressPlugin, AdditionalPage } from './Plugin';

export type { DefaultThemeConfig, NormalizedDefaultThemeConfig };
export * from './defaultTheme';

export type { RspressPlugin, AdditionalPage, RspressPlugin as Plugin };

export interface Route {
  path: string;
  element: React.ReactElement;
  filePath: string;
  preload: () => Promise<PageModule<React.ComponentType<unknown>>>;
  lang: string;
}

export interface RouteMeta {
  routePath: string;
  absolutePath: string;
  relativePath: string;
  pageName: string;
  lang: string;
}

export interface ReplaceRule {
  search: string | RegExp;
  replace: string;
}

export interface Header {
  id: string;
  text: string;
  depth: number;
  charIndex: number;
}

// The general i18n config, which is not related to the theme.
export interface Locale {
  lang: string;
  label: string;
  title?: string;
  description?: string;
}

export interface UserConfig<ThemeConfig = DefaultThemeConfig> {
  /**
   * The root directory of the site.
   */
  root?: string;
  /**
   * Path to the logo file in nav bar.
   */
  logo?: string | { dark: string; light: string };
  /**
   * Base path of the site.
   */
  base?: string;
  /**
   * Path to html icon file.
   */
  icon?: string;
  /**
   * Language of the site.
   */
  lang?: string;
  /**
   * Title of the site.
   */
  title?: string;
  /**
   * Description of the site.
   */
  description?: string;
  /**
   * Head tags.
   */
  head?: string[];
  /**
   * I18n config of the site.
   */
  locales?: Locale[];
  /**
   * The i18n text data source path. Default is `i18n.json` in cwd.
   */
  i18nSourcePath?: string;
  /**
   * Theme config.
   */
  themeConfig?: ThemeConfig;
  /**
   * Builder Configuration
   */
  builderConfig?: BuilderConfig;
  /**
   * The custom config of vite-plugin-route
   */
  route?: RouteOptions;
  /**
   * The custom config of markdown compile
   */
  markdown?: MarkdownOptions;
  /**
   * Doc plugins
   */
  plugins?: RspressPlugin[];
  /**
   * Replace rule, will replace the content of the page.
   */
  replaceRules?: ReplaceRule[];
  /**
   * Output directory
   */
  outDir?: string;
  /**
   * Custom theme directory
   */
  themeDir?: string;
  /**
   * Global components
   */
  globalUIComponents?: (string | [string, object])[];
  /**
   * Global styles, is a Absolute path
   */
  globalStyles?: string;
  /**
   * Search options
   */
  search?: SearchOptions;
  /**
   * Whether to enable medium-zoom, default is true
   */
  mediumZoom?:
    | boolean
    | {
        selector?: string;
        options?: ZoomOptions;
      };
  /**
   * Add some extra builder plugins
   */
  builderPlugins?: BuilderPlugin[];
}

export type BaseRuntimePageInfo = Omit<
  PageIndexInfo,
  'id' | 'content' | 'domain'
>;

export interface SiteData<ThemeConfig = NormalizedDefaultThemeConfig> {
  root: string;
  base: string;
  lang: string;
  title: string;
  description: string;
  icon: string;
  themeConfig: ThemeConfig;
  logo: string | { dark: string; light: string };
  pages: BaseRuntimePageInfo[];
  search: SearchOptions;
  markdown: {
    showLineNumbers: boolean;
  };
}

export type PageIndexInfo = {
  id: number;
  title: string;
  routePath: string;
  toc: Header[];
  content: string;
  frontmatter: Record<string, unknown>;
  lang: string;
  domain: string;
  _filepath: string;
  _relativePath: string;
};

export type RemotePageInfo = PageIndexInfo & {
  _matchesPosition: {
    content: {
      start: number;
      length: number;
    }[];
  };
};

export interface Hero {
  name: string;
  text: string;
  tagline: string;
  image?: {
    src: string;
    alt: string;
  };
  actions: {
    text: string;
    link: string;
    theme: 'brand' | 'alt';
  }[];
}

export interface Feature {
  icon: string;
  title: string;
  details: string;
  link?: string;
}

export interface PageModule<T extends React.ComponentType<unknown>> {
  default: T;
  frontmatter?: FrontMatterMeta;
  content?: string;
  [key: string]: unknown;
}

export type PageType = 'home' | 'doc' | 'custom' | '404' | 'blank';

export interface FrontMatterMeta {
  title?: string;
  description?: string;
  overview?: boolean;
  pageType?: PageType;
  features?: Feature[];
  hero?: Hero;
  sidebar?: boolean;
  outline?: boolean;
  lineNumbers?: boolean;
}

export interface PageData {
  siteData: SiteData<DefaultThemeConfig>;
  page: BaseRuntimePageInfo & {
    pagePath: string;
    lastUpdatedTime?: string;
    description?: string;
    pageType: PageType;
    _relativePath: string;
    [key: string]: unknown;
  };
}

export interface RouteOptions {
  /**
   * The directory to search for pages
   */
  root?: string;
  /**
   * The basename of the site
   */
  prefix?: string;
  /**
   * The extension name of the filepath that will be converted to a route
   * @default ['js','jsx','ts','tsx','md','mdx']
   */
  extensions?: string[];
  /**
   * Include extra files from being converted to routes
   */
  include?: string[];
  /**
   * Exclude files from being converted to routes
   */
  exclude?: string[];
}

export interface SearchHooks {
  /**
   * The search hook function path. The corresponding file should export a function named `onSearch`.
   */
  searchHooks?: string;
}

export type LocalSearchOptions = SearchHooks & {
  mode: 'local';
};

export type RemoteSearchIndexInfo =
  | string
  | {
      value: string;
      label: string;
    };

export type RemoteSearchOptions = SearchHooks & {
  mode: 'remote';
  apiUrl: string;
  domain?: string;
  indexName: string;
  searchIndexes?: RemoteSearchIndexInfo[];
};

export type SearchOptions = LocalSearchOptions | RemoteSearchOptions | false;

export interface MarkdownOptions {
  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
  checkDeadLinks?: boolean;
  experimentalMdxRs?: boolean;
  showLineNumbers?: boolean;
  globalComponents?: string[];
}

export type Config =
  | UserConfig
  | Promise<UserConfig>
  | ((env: any) => UserConfig | Promise<UserConfig>);
