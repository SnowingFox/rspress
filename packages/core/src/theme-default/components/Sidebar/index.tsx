import React, { useEffect, useRef, useState } from 'react';
import { NormalizedSidebarGroup, SidebarItem } from '@rspress/shared';
import { matchRoutes, useNavigate } from 'react-router-dom';
import { routes } from 'virtual-routes';
import { Link } from '../Link';
import { isActive } from '../../logic';
import ArrowRight from '../../assets/arrow-right.svg';
import { Tag } from '../Tag';
import styles from './index.module.scss';
import { removeBase, normalizeHref, withBase, usePageData } from '@/runtime';

interface Props {
  isSidebarOpen?: boolean;
  pathname: string;
  langRoutePrefix: string;
  sidebarData: (NormalizedSidebarGroup | SidebarItem)[];
}

const highlightTitleStyle = {
  color: 'var(--rp-c-text-1)',
  fontSize: '14px',
  paddingLeft: '24px',
  fontWeight: 'bold',
};

let matchCache: WeakMap<NormalizedSidebarGroup | SidebarItem, boolean> =
  new WeakMap();

interface SidebarItemProps {
  id: string;
  item: SidebarItem | NormalizedSidebarGroup;
  depth: number;
  activeMatcher: (link: string) => boolean;
  collapsed?: boolean;
  setSidebarData: React.Dispatch<
    React.SetStateAction<(NormalizedSidebarGroup | SidebarItem)[]>
  >;
  preloadLink: (link: string) => void;
}

export function SidebarItemComp(props: SidebarItemProps) {
  const { item, depth = 0, activeMatcher, id, setSidebarData } = props;
  const active = item.link && activeMatcher(item.link);

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (active) {
      ref.current?.scrollIntoView({
        block: 'center',
      });
    }
  }, []);

  const { text } = item;

  if ('items' in item) {
    return (
      <SidebarGroupComp
        id={id}
        key={`${item.text}-${id}`}
        item={item}
        depth={depth}
        activeMatcher={activeMatcher}
        collapsed={item.collapsed}
        setSidebarData={setSidebarData}
        preloadLink={props.preloadLink}
      />
    );
  } else {
    return (
      <Link href={normalizeHref(item.link)} className={styles.menuLink}>
        <div
          ref={ref}
          onMouseEnter={() => props.preloadLink(item.link)}
          className={`${
            active ? styles.menuItemActive : styles.menuItem
          } mt-1 py-2 px-3 font-medium flex`}
          style={{
            // The first level menu item will have the same font size as the sidebar group
            fontSize: depth === 0 ? '14px' : '13px',
            marginLeft: depth === 0 ? 0 : '12px',
            borderRadius: '0 1rem 1rem 0',
            ...(depth === 0 ? highlightTitleStyle : {}),
            ...(depth === 0 && active ? { color: 'var(--rp-c-brand)' } : {}),
          }}
        >
          <Tag tag={item.tag} />
          {text}
        </div>
      </Link>
    );
  }
}

export function SidebarGroupComp(props: SidebarItemProps) {
  const { item, depth = 0, activeMatcher, id, setSidebarData } = props;
  const navigate = useNavigate();
  const isGroupMatched = matchCache.get(item);
  const containerRef = useRef<HTMLDivElement>(null);
  const transitionRef = useRef<any>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const initialRender = useRef(true);
  const initialState = useRef((item as NormalizedSidebarGroup).collapsed);
  const active = item.link && activeMatcher(item.link);
  const { collapsed, collapsible = true } = item as NormalizedSidebarGroup;
  const collapsibleIcon = (
    <div
      style={{
        cursor: 'pointer',
        transition: 'transform 0.2s ease-out',
        transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)',
      }}
    >
      <ArrowRight />
    </div>
  );

  useEffect(() => {
    if (initialRender.current) {
      return;
    }

    if (!containerRef.current || !innerRef.current) {
      return;
    }

    if (transitionRef.current) {
      clearTimeout(transitionRef.current);
    }

    const container = containerRef.current;
    const inner = innerRef.current;
    // We should add the margin-top(4px) of first item in list, which is a part of the height of the container
    const contentHeight = inner.clientHeight + 4;
    if (collapsed) {
      container.style.maxHeight = `${contentHeight}px`;
      container.style.transitionDuration = '0.5s';
      inner.style.opacity = '0';

      transitionRef.current = setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.maxHeight = '0px';
        }
      }, 0);
    } else {
      container.style.maxHeight = `${contentHeight}px`;
      container.style.transitionDuration = '0.3s';
      inner.style.opacity = '1';

      transitionRef.current = setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.removeProperty('max-height');
        }
      }, 300);
    }
  }, [collapsed]);

  useEffect(() => {
    initialRender.current = false;
  }, []);

  const toggleCollapse: React.MouseEventHandler<HTMLDivElement> = (e): void => {
    e.stopPropagation();
    // update collapsed state
    setSidebarData(sidebarData => {
      const newSidebarData = [...sidebarData];
      const indexes = id.split('-').map(Number);
      const initialIndex = indexes.shift()!;
      const root = newSidebarData[initialIndex];
      let current = root;
      for (const index of indexes) {
        current = (current as NormalizedSidebarGroup).items[index];
      }
      if ('items' in current) {
        current.collapsed = !current.collapsed;
      }
      return newSidebarData;
    });
  };

  return (
    <section
      key={id}
      className="mt-1 block"
      style={{
        marginLeft: depth === 0 ? 0 : '20px',
      }}
    >
      <div
        className={`flex justify-between items-center rounded-xl ${
          isGroupMatched ? styles.menuItemActive : ''
        } ${
          // eslint-disable-next-line no-nested-ternary
          active
            ? styles.menuItemActive
            : collapsible || item.link
            ? styles.menuItem
            : styles.menuItemStatic
        }`}
        onMouseEnter={() => item.link && props.preloadLink(item.link)}
        onClick={e => {
          if (item.link) {
            navigate(withBase(normalizeHref(item.link)));
            collapsed && toggleCollapse(e);
          } else {
            collapsible && toggleCollapse(e);
          }
        }}
        style={{
          borderRadius: depth === 0 ? '0 1rem 1rem 0' : undefined,
          cursor: collapsible || item.link ? 'pointer' : 'normal',
        }}
      >
        <h2
          className="py-2.5 px-2 text-sm font-medium flex"
          style={{
            ...(depth === 0 ? highlightTitleStyle : {}),
            ...(depth === 0 && isGroupMatched
              ? {
                  color: 'var(--rp-c-brand)',
                }
              : {}),
          }}
        >
          <Tag tag={item.tag} />
          {item.text}
        </h2>
        {collapsible && (
          <div
            className={`${styles.collapseContainer} p-2 rounded-xl`}
            onClick={toggleCollapse}
          >
            {collapsibleIcon}
          </div>
        )}
      </div>
      <div
        ref={containerRef}
        className="transition-all duration-300 ease-in-out"
        style={{
          overflow: 'hidden',
          maxHeight: initialState.current ? 0 : undefined,
        }}
      >
        <div
          ref={innerRef}
          className="rspress-sidebar-group transition-opacity duration-500 ease-in-out"
          style={{
            opacity: initialState.current ? 0 : 1,
            marginLeft: depth === 0 ? '14px' : 0,
          }}
        >
          {(item as NormalizedSidebarGroup)?.items?.map((item, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index}>
              <SidebarItemComp
                {...props}
                item={item}
                depth={depth + 1}
                id={`${id}-${index}`}
                preloadLink={props.preloadLink}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SideBar(props: Props) {
  const {
    isSidebarOpen,
    langRoutePrefix,
    pathname: rawPathname,
    sidebarData: rawSidebarData,
  } = props;
  const {
    siteData: { themeConfig },
    page: { frontmatter },
  } = usePageData();
  const hideNavbar =
    frontmatter?.hideNavbar ?? themeConfig?.hideNavbar ?? false;
  const [sidebarData, setSidebarData] = useState<
    (SidebarItem | NormalizedSidebarGroup)[]
  >(rawSidebarData.filter(Boolean).flat());
  const pathname = decodeURIComponent(rawPathname);
  useEffect(() => {
    if (props.sidebarData === sidebarData) {
      return;
    }
    // 1. Update sidebarData when pathname changes
    // 2. For current active item, expand its parent group
    // Cache, Avoid redundant calculation
    matchCache = new WeakMap<NormalizedSidebarGroup | SidebarItem, boolean>();
    const match = (item: NormalizedSidebarGroup | SidebarItem) => {
      if (matchCache.has(item)) {
        return matchCache.get(item);
      }
      if (item.link && activeMatcher(item.link)) {
        matchCache.set(item, true);
        return true;
      }
      if ('items' in item) {
        const result = item.items.some(child => match(child));
        if (result) {
          matchCache.set(item, true);
          return true;
        }
      }
      matchCache.set(item, false);
      return false;
    };
    const traverse = (item: NormalizedSidebarGroup | SidebarItem) => {
      if ('items' in item) {
        item.items.forEach(traverse);
        if (match(item)) {
          item.collapsed = false;
        }
      }
    };
    const newSidebarData = props.sidebarData.filter(Boolean).flat();
    newSidebarData.forEach(traverse);
    setSidebarData(newSidebarData);
  }, [props.sidebarData, pathname]);

  const removeLangPrefix = (path: string) => {
    return path.replace(langRoutePrefix, '');
  };
  const activeMatcher = (path: string) =>
    isActive(
      removeBase(removeLangPrefix(pathname)),
      removeLangPrefix(path),
      true,
    );
  const preloadLink = (link: string) => {
    const match = matchRoutes(routes, link);
    if (match?.length) {
      const { route } = match[0];
      route.preload();
    }
  };
  return (
    <aside
      className={`${styles.sidebar} rspress-sidebar ${
        isSidebarOpen ? styles.open : ''
      }`}
      style={{
        ...(hideNavbar ? { marginTop: 0 } : {}),
      }}
    >
      <div className={`mt-1 ${styles.sidebarContent}`}>
        <div
          className="rspress-scrollbar"
          style={{
            maxHeight: 'calc(100vh - var(--rp-nav-height) - 8px)',
            overflow: 'scroll',
          }}
        >
          <nav className="pb-2">
            {sidebarData.map(
              (item: NormalizedSidebarGroup | SidebarItem, index: number) => (
                <SidebarItemComp
                  id={String(index)}
                  item={item}
                  depth={0}
                  activeMatcher={activeMatcher}
                  // The siderbarData is stable, so it's safe to use index as key
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  collapsed={(item as NormalizedSidebarGroup).collapsed ?? true}
                  setSidebarData={setSidebarData}
                  preloadLink={preloadLink}
                />
              ),
            )}
          </nav>
        </div>
      </div>
      {/* SwitchAppearance at the bottom of sidebar */}
      {/* <div
        className="border-t border-solid border-gray-200 dark:border-gray-500 absolute"
        style={{
          left: '1.8rem',
          width: 'calc(100% - 3.6rem)',
        }}
      >
        <div className="mt-2 flex-center">
          <NoSSR>
            <SwitchAppearance />
          </NoSSR>
        </div>
      </div> */}
    </aside>
  );
}
