import { NotFoundLayout } from './layout/NotFountLayout';
import { Layout } from './layout/Layout';
import { HomeLayout } from './layout/HomeLayout';
import { setup } from './logic';

export { Nav } from './components/Nav';
export { Search } from './components/Search';
export { Tab, Tabs } from './components/Tabs';
export { Button } from './components/Button';
export { Link } from './components/Link';
export { HomeFooter } from './components/HomeFooter';
export { Toc } from './components/Toc';

export default {
  Layout,
  NotFoundLayout,
  HomeLayout,
  setup,
};

export { getCustomMDXComponent } from './layout/DocLayout/docComponents';

export * from './logic';
