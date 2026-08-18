import type { SystemComponent } from '../types'

export const dataInputComponents: SystemComponent[] = [
  {
    id: 'input',
    name: 'Text input',
    category: 'Data input',
    summary: 'Single-line text entry with a persistent visible label.',
    detect: ['input'],
    expect: [
      'input[type="text"]',
      'input[type="email"]',
      'input[type="password"]',
      'input[type="search"]',
      'input[type="tel"]',
      'input[type="url"]',
      'input[type="number"]',
      'input:not([type])',
    ],
    variants: [
      {
        name: 'With label',
        description: 'The default. A visible label survives autofill, zoom and translation.',
        html: `<fieldset class="fieldset">
  <legend class="fieldset-legend">Work email</legend>
  <input type="email" class="input" placeholder="you@company.com" />
  <p class="label">We only use this for billing receipts.</p>
</fieldset>`,
      },
      {
        name: 'Error state',
        html: `<fieldset class="fieldset">
  <legend class="fieldset-legend">Work email</legend>
  <input type="email" class="input input-error" value="not-an-email" aria-describedby="email-error" />
  <p id="email-error" class="label text-error">Enter an email address, like you@company.com.</p>
</fieldset>`,
      },
      {
        name: 'Sizes',
        html: `<div class="flex flex-col gap-2">
  <input type="text" class="input input-sm" placeholder="Small" />
  <input type="text" class="input" placeholder="Default" />
  <input type="text" class="input input-lg" placeholder="Large" />
</div>`,
      },
    ],
    usage: [
      'Placeholder text is not a label. It disappears the moment someone types.',
      'Say what good input looks like before they get it wrong, not only after.',
      'Set the right type so mobile keyboards and autofill behave.',
    ],
    a11yNotes: [
      'Every input needs a programmatic label — a <label for>, a wrapping <label>, or a fieldset legend.',
      'Point at the error message with aria-describedby so it is announced, not just seen.',
      'Do not rely on red alone to signal an error; include text.',
    ],
  },
  {
    id: 'select',
    name: 'Select',
    category: 'Data input',
    summary: 'Choose one value from a known, bounded list.',
    detect: ['select'],
    expect: ['select'],
    variants: [
      {
        name: 'Default',
        html: `<fieldset class="fieldset">
  <legend class="fieldset-legend">Environment</legend>
  <select class="select">
    <option>Production</option>
    <option>Staging</option>
    <option>Development</option>
  </select>
</fieldset>`,
      },
    ],
    usage: [
      'Under about five options, radios show everything at once and cost one fewer tap.',
      'Over about fifteen, people need to search — use a filterable pattern instead.',
      'Order options meaningfully. Alphabetical is a fallback, not a default.',
    ],
    a11yNotes: [
      'Use the native <select>. Custom listboxes almost always lose keyboard behavior somewhere.',
      'The first option should be a real choice or an explicit "Select…", never a blank line.',
    ],
  },
  {
    id: 'textarea',
    name: 'Textarea',
    category: 'Data input',
    summary: 'Multi-line free text.',
    detect: ['textarea'],
    expect: ['textarea'],
    variants: [
      {
        name: 'Default',
        html: `<fieldset class="fieldset">
  <legend class="fieldset-legend">Release notes</legend>
  <textarea class="textarea h-24" placeholder="What changed in this release?"></textarea>
</fieldset>`,
      },
    ],
    usage: [
      'Size the field to the expected answer — a one-line box invites a one-line answer.',
      'If there is a character limit, show the remaining count and let people exceed it before blocking.',
    ],
    a11yNotes: [
      'Same labelling rules as a text input.',
      'Never disable resize; people rely on it to see what they wrote.',
    ],
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    category: 'Data input',
    summary: 'Independent on/off choices — zero or more may be selected.',
    detect: ['checkbox'],
    expect: ['input[type="checkbox"]:not([class*="toggle"])'],
    variants: [
      {
        name: 'Single',
        html: `<label class="label cursor-pointer justify-start gap-3">
  <input type="checkbox" class="checkbox" checked />
  <span>Email me when a check fails</span>
</label>`,
      },
      {
        name: 'Group',
        html: `<fieldset class="fieldset">
  <legend class="fieldset-legend">Notify me about</legend>
  <label class="label cursor-pointer justify-start gap-3">
    <input type="checkbox" class="checkbox" checked /><span>Accessibility errors</span>
  </label>
  <label class="label cursor-pointer justify-start gap-3">
    <input type="checkbox" class="checkbox" /><span>Off-system components</span>
  </label>
</fieldset>`,
      },
    ],
    usage: [
      'Label the positive action. "Email me when a check fails" beats "Disable failure emails".',
      'Group related checkboxes in a fieldset with a legend so the set has a name.',
    ],
    a11yNotes: [
      'Wrap the control in its <label> so the text is part of the hit target.',
      'Keep the box at least 24×24 including padding.',
    ],
  },
  {
    id: 'radio',
    name: 'Radio',
    category: 'Data input',
    summary: 'Exactly one choice from a small visible set.',
    detect: ['radio'],
    expect: ['input[type="radio"]'],
    variants: [
      {
        name: 'Group',
        html: `<fieldset class="fieldset">
  <legend class="fieldset-legend">Export format</legend>
  <label class="label cursor-pointer justify-start gap-3">
    <input type="radio" name="format" class="radio" checked /><span>Standalone HTML</span>
  </label>
  <label class="label cursor-pointer justify-start gap-3">
    <input type="radio" name="format" class="radio" /><span>HTML + spec</span>
  </label>
</fieldset>`,
      },
    ],
    usage: [
      'Always pre-select a sensible default. An empty radio group is a decision with no starting point.',
      'Every radio in a group shares one name attribute — that is what makes it a group.',
    ],
    a11yNotes: [
      'Wrap the group in a fieldset with a legend, or the options have no collective label.',
      'Arrow keys move within a radio group; Tab moves past it. That is expected — do not fight it.',
    ],
  },
  {
    id: 'toggle',
    name: 'Toggle',
    category: 'Data input',
    summary: 'A setting that takes effect immediately, with no save step.',
    detect: ['toggle'],
    variants: [
      {
        name: 'Default',
        html: `<label class="label cursor-pointer justify-start gap-3">
  <input type="checkbox" class="toggle toggle-primary" checked />
  <span>Run the checker automatically</span>
</label>`,
      },
    ],
    usage: [
      'A toggle applies instantly. If the change needs a Save button, use a checkbox instead.',
      'The label states what being on means, and does not change when toggled.',
    ],
    a11yNotes: [
      'Do not use color alone to convey state — the knob position carries it too.',
      'If applying takes time, announce the result; silence reads as a failure.',
    ],
  },
]
