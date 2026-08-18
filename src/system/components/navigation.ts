import type { SystemComponent } from '../types'

export const navigationComponents: SystemComponent[] = [
  {
    id: 'navbar',
    name: 'Navbar',
    category: 'Navigation',
    summary: 'The persistent top bar: identity, primary nav, account.',
    detect: ['navbar'],
    variants: [
      {
        name: 'Default',
        html: `<div class="navbar bg-base-100 border-b border-base-300">
  <div class="navbar-start">
    <a class="btn btn-ghost text-xl">Design Conform</a>
  </div>
  <div class="navbar-end gap-2">
    <button class="btn btn-ghost btn-sm">Library</button>
    <button class="btn btn-primary btn-sm">New prototype</button>
  </div>
</div>`,
      },
    ],
    usage: [
      'One navbar per page, at the top. A second bar below it is a toolbar, not a navbar.',
      'The product name links home. People try it before they try anything else.',
    ],
    a11yNotes: [
      'Wrap site navigation in a <nav> so it can be skipped and jumped to.',
      'If the bar is sticky, keep it short — it eats the viewport on small screens.',
    ],
  },
  {
    id: 'tabs',
    name: 'Tabs',
    category: 'Navigation',
    summary: 'Switch between sibling views of the same object.',
    detect: ['tabs', 'tab'],
    variants: [
      {
        name: 'Box',
        html: `<div role="tablist" class="tabs tabs-box">
  <button role="tab" class="tab tab-active">Prototype</button>
  <button role="tab" class="tab">Component Checker</button>
</div>`,
      },
      {
        name: 'Bordered',
        html: `<div role="tablist" class="tabs tabs-border">
  <button role="tab" class="tab tab-active">Overview</button>
  <button role="tab" class="tab">Accessibility</button>
  <button role="tab" class="tab">Tokens</button>
</div>`,
      },
    ],
    usage: [
      'Tabs are peers on one object. If choosing one changes what the page is about, those are links.',
      'Two to five tabs. More than that and people stop scanning and start hunting.',
      'One tab is always selected. There is no empty state for a tab bar.',
    ],
    a11yNotes: [
      'Use role="tablist" and role="tab", and mark the selected tab with aria-selected.',
      'Tabs are buttons, not links, when they swap content in place.',
    ],
  },
  {
    id: 'breadcrumbs',
    name: 'Breadcrumbs',
    category: 'Navigation',
    summary: 'Shows where you are in a hierarchy and how to climb out.',
    detect: ['breadcrumbs'],
    variants: [
      {
        name: 'Default',
        html: `<div class="breadcrumbs text-sm">
  <ul>
    <li><a>Prototypes</a></li>
    <li><a>Checkout flow</a></li>
    <li>Payment step</li>
  </ul>
</div>`,
      },
    ],
    usage: [
      'Only for genuine hierarchies. A linear wizard needs a step indicator, not breadcrumbs.',
      'The last crumb is the current page and is not a link.',
    ],
    a11yNotes: [
      'Wrap in <nav aria-label="Breadcrumb"> so it is distinguishable from other navigation.',
      'Mark the current page with aria-current="page".',
    ],
  },
  {
    id: 'menu',
    name: 'Menu',
    category: 'Navigation',
    summary: 'A vertical or horizontal list of navigation links.',
    detect: ['menu'],
    variants: [
      {
        name: 'Vertical',
        html: `<ul class="menu bg-base-100 rounded-box w-56">
  <li class="menu-title">Workspace</li>
  <li><a class="menu-active">Library</a></li>
  <li><a>Prototypes</a></li>
  <li><a>Standards</a></li>
</ul>`,
      },
      {
        name: 'Horizontal',
        html: `<ul class="menu menu-horizontal bg-base-100 rounded-box">
  <li><a class="menu-active">Library</a></li>
  <li><a>Prototypes</a></li>
  <li><a>Standards</a></li>
</ul>`,
      },
    ],
    usage: [
      'Mark the current item. Navigation without a "you are here" makes people click to find out.',
      'Group with menu-title rather than inventing spacing between clusters.',
    ],
    a11yNotes: [
      'Keep it a real <ul>/<li> so the number of items is announced.',
      'Mark the current item with aria-current="page", not color alone.',
    ],
  },
  {
    id: 'pagination',
    name: 'Pagination',
    category: 'Navigation',
    summary: 'Move through pages of results.',
    detect: ['join'],
    variants: [
      {
        name: 'Default',
        html: `<div class="join">
  <button class="join-item btn">«</button>
  <button class="join-item btn btn-active">1</button>
  <button class="join-item btn">2</button>
  <button class="join-item btn">3</button>
  <button class="join-item btn">»</button>
</div>`,
      },
    ],
    usage: [
      'Show the total where you can. "Page 2" without a total tells people nothing about how far they are.',
      'Disable rather than hide the previous/next controls at the ends, so the control does not jump.',
    ],
    a11yNotes: [
      'Wrap in <nav aria-label="Pagination">.',
      'Mark the current page with aria-current="page"; page numbers alone are ambiguous out of context.',
    ],
  },
]
