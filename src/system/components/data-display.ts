import type { SystemComponent } from '../types'

export const dataDisplayComponents: SystemComponent[] = [
  {
    id: 'card',
    name: 'Card',
    category: 'Data display',
    summary: 'A bounded container for one coherent object.',
    detect: ['card'],
    variants: [
      {
        name: 'Default',
        html: `<div class="card bg-base-100 w-80 shadow-sm">
  <div class="card-body">
    <h2 class="card-title">Checkout flow</h2>
    <p>12 components, 2 off-system. Last checked 3 minutes ago.</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary">Open</button>
    </div>
  </div>
</div>`,
      },
      {
        name: 'Bordered',
        description: 'Use on tinted backgrounds where a shadow disappears.',
        html: `<div class="card card-border bg-base-100 w-80">
  <div class="card-body">
    <h2 class="card-title">Pricing page</h2>
    <p>All 18 components on-system.</p>
  </div>
</div>`,
      },
      {
        name: 'With media',
        html: `<div class="card bg-base-100 w-80 shadow-sm">
  <figure><img src="https://placehold.co/320x160/e5e7eb/6b7280?text=Preview" alt="Preview of the settings screen" /></figure>
  <div class="card-body">
    <h2 class="card-title">Settings screen</h2>
    <p>Generated from a one-line prompt.</p>
  </div>
</div>`,
      },
    ],
    usage: [
      'One card, one subject. A card holding two unrelated things is a layout container wearing a costume.',
      'Cards in a grid should be the same shape. Ragged cards read as broken rather than varied.',
      'A card is not automatically clickable. If the whole card is a link, say so with a real anchor.',
    ],
    a11yNotes: [
      'The card title should be a real heading at the right level for its place on the page.',
      'Images inside cards need alt text, or an empty alt if they are purely decorative.',
      'Avoid nesting an interactive card inside another interactive element.',
    ],
  },
  {
    id: 'badge',
    name: 'Badge',
    category: 'Data display',
    summary: 'A short status or count attached to something else.',
    detect: ['badge'],
    variants: [
      {
        name: 'Statuses',
        html: `<div class="flex flex-wrap items-center gap-2">
  <span class="badge badge-success">On-system</span>
  <span class="badge badge-warning">Needs review</span>
  <span class="badge badge-error">Off-system</span>
  <span class="badge">Draft</span>
</div>`,
      },
      {
        name: 'Soft',
        html: `<div class="flex items-center gap-2">
  <span class="badge badge-soft badge-info">Beta</span>
  <span class="badge badge-outline">v2</span>
</div>`,
      },
    ],
    usage: [
      'One or two words. A badge holding a sentence should be a paragraph.',
      'Color carries meaning consistently across the product — green is never "warning" on one screen.',
    ],
    a11yNotes: [
      'Color is decoration; the word carries the meaning. Never ship a bare colored dot as status.',
      'A count badge needs context in its accessible name — "3 unread", not "3".',
    ],
  },
  {
    id: 'table',
    name: 'Table',
    category: 'Data display',
    summary: 'Rows of comparable records with shared columns.',
    detect: ['table'],
    expect: ['table'],
    variants: [
      {
        name: 'Default',
        html: `<div class="overflow-x-auto">
  <table class="table">
    <thead>
      <tr><th>Component</th><th>Status</th><th>Uses</th></tr>
    </thead>
    <tbody>
      <tr><td>Button</td><td><span class="badge badge-success">On-system</span></td><td>14</td></tr>
      <tr><td>Card</td><td><span class="badge badge-success">On-system</span></td><td>6</td></tr>
      <tr><td>Custom pill</td><td><span class="badge badge-error">Off-system</span></td><td>3</td></tr>
    </tbody>
  </table>
</div>`,
      },
      {
        name: 'Zebra',
        description: 'Use only when rows are wide enough to lose your place.',
        html: `<div class="overflow-x-auto">
  <table class="table table-zebra table-sm">
    <thead><tr><th>Rule</th><th>Severity</th></tr></thead>
    <tbody>
      <tr><td>img-alt</td><td>Error</td></tr>
      <tr><td>color-contrast</td><td>Error</td></tr>
      <tr><td>spacing-scale</td><td>Warning</td></tr>
    </tbody>
  </table>
</div>`,
      },
    ],
    usage: [
      'Tables are for comparing records. A single record is a description list, not a two-column table.',
      'Right-align numbers so digits line up; left-align text.',
      'Wrap in an overflow container so narrow screens scroll the table rather than the page.',
    ],
    a11yNotes: [
      'Header cells must be <th>. A <td> in the header row is invisible to screen readers as a header.',
      'Never use a table for layout. Screen readers announce it as data and the row/column count is nonsense.',
    ],
  },
  {
    id: 'avatar',
    name: 'Avatar',
    category: 'Data display',
    summary: 'A person or entity’s image, or their initials as a fallback.',
    detect: ['avatar'],
    variants: [
      {
        name: 'Image',
        html: `<div class="avatar">
  <div class="w-12 rounded-full">
    <img src="https://placehold.co/96x96/e5e7eb/6b7280?text=DR" alt="David Roddy" />
  </div>
</div>`,
      },
      {
        name: 'Initials fallback',
        html: `<div class="avatar avatar-placeholder">
  <div class="bg-neutral text-neutral-content w-12 rounded-full">
    <span>DR</span>
  </div>
</div>`,
      },
    ],
    usage: [
      'Always have an initials fallback. Broken image icons in a list of people look like an outage.',
      'An avatar alone is not identification — pair it with a name wherever the person matters.',
    ],
    a11yNotes: [
      'Alt text is the person’s name. If the name is already beside it, use an empty alt so it is not read twice.',
    ],
  },
  {
    id: 'stat',
    name: 'Stat',
    category: 'Data display',
    summary: 'A headline number with its label and trend.',
    detect: ['stats', 'stat'],
    variants: [
      {
        name: 'Group',
        html: `<div class="stats shadow-sm">
  <div class="stat">
    <div class="stat-title">On-system</div>
    <div class="stat-value text-success">18</div>
    <div class="stat-desc">of 21 components</div>
  </div>
  <div class="stat">
    <div class="stat-title">Off-system</div>
    <div class="stat-value text-error">3</div>
    <div class="stat-desc">2 fixable automatically</div>
  </div>
</div>`,
      },
    ],
    usage: [
      'The label says what the number counts; the description says what it means. Both, or neither is useful.',
      'Keep stats in a row comparable — same unit, same period.',
    ],
    a11yNotes: [
      'Reading order is title then value then description, which is what a screen reader announces. Keep that order in the markup.',
      'A trend shown only as a colored arrow is invisible to some readers — include the number.',
    ],
  },
  {
    id: 'collapse',
    name: 'Collapse',
    category: 'Data display',
    summary: 'Progressive disclosure for secondary detail.',
    detect: ['collapse'],
    variants: [
      {
        name: 'Arrow',
        html: `<div class="collapse collapse-arrow bg-base-100 border border-base-300">
  <input type="checkbox" />
  <div class="collapse-title font-semibold">Why was this flagged off-system?</div>
  <div class="collapse-content text-sm">
    <p>This element behaves like a button but does not use the Button component, so it misses focus styles and keyboard activation.</p>
  </div>
</div>`,
      },
    ],
    usage: [
      'Hide detail, never the primary answer. If people must expand it to complete the task, it should be open.',
      'The title must describe what is inside — "Details" tells nobody whether to open it.',
    ],
    a11yNotes: [
      'The toggle must be reachable and operable by keyboard.',
      'Never collapse an error message. It has to be visible when it appears.',
    ],
  },
]
