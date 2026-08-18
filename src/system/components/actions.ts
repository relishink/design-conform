import type { SystemComponent } from '../types'

export const actionComponents: SystemComponent[] = [
  {
    id: 'button',
    name: 'Button',
    category: 'Actions',
    summary: 'The single approved way to render a clickable action.',
    detect: ['btn'],
    expect: ['button', '[role="button"]', 'input[type="submit"]', 'input[type="button"]'],
    variants: [
      {
        name: 'Primary',
        description: 'One per view — the action you want people to take.',
        html: '<button class="btn btn-primary">Save changes</button>',
      },
      {
        name: 'Secondary',
        description: 'Supporting actions that sit beside a primary.',
        html: '<button class="btn">Cancel</button>',
      },
      {
        name: 'Ghost',
        description: 'Low-emphasis actions in dense toolbars.',
        html: '<button class="btn btn-ghost">Dismiss</button>',
      },
      {
        name: 'Destructive',
        description: 'Irreversible actions. Always pair with a confirmation.',
        html: '<button class="btn btn-error">Delete account</button>',
      },
      {
        name: 'Sizes',
        html: `<div class="flex items-center gap-2">
  <button class="btn btn-sm">Small</button>
  <button class="btn">Default</button>
  <button class="btn btn-lg">Large</button>
</div>`,
      },
      {
        name: 'Loading',
        description: 'Disable while in flight so the action cannot fire twice.',
        html: '<button class="btn btn-primary" disabled><span class="loading loading-spinner loading-sm"></span>Saving</button>',
      },
    ],
    usage: [
      'Exactly one primary button per view. More than one means the hierarchy is unresolved.',
      'Label with a verb phrase describing the outcome — "Save changes", not "Submit" or "OK".',
      'Use a real <button> for actions and an <a> for navigation. Styling one as the other breaks keyboard and middle-click behavior.',
    ],
    a11yNotes: [
      'Every button needs a discernible name — visible text, or aria-label when it is icon-only.',
      'Never remove the focus ring. Keyboard users have no other way to see where they are.',
      'A disabled button is not announced as an error. If an action is blocked, say why in text.',
    ],
  },
  {
    id: 'dropdown',
    name: 'Dropdown',
    category: 'Actions',
    summary: 'A menu of actions revealed from a trigger.',
    detect: ['dropdown'],
    variants: [
      {
        name: 'Default',
        html: `<details class="dropdown">
  <summary class="btn">Actions</summary>
  <ul class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
    <li><a>Duplicate</a></li>
    <li><a>Archive</a></li>
    <li><a>Delete</a></li>
  </ul>
</details>`,
      },
      {
        name: 'End-aligned',
        description: 'Align to the trigger’s trailing edge when it sits at the right of a bar.',
        html: `<details class="dropdown dropdown-end">
  <summary class="btn btn-ghost">More</summary>
  <ul class="dropdown-content menu bg-base-100 rounded-box z-1 w-40 p-2 shadow-sm">
    <li><a>Rename</a></li>
    <li><a>Export</a></li>
  </ul>
</details>`,
      },
    ],
    usage: [
      'Use for actions. For choosing a value in a form, use Select instead.',
      'Keep to a single level. Nested submenus are hard to hit and harder to reach by keyboard.',
    ],
    a11yNotes: [
      'The <details>/<summary> form is keyboard-operable and closes on Escape without any script.',
      'Put the menu items in a real list so screen readers announce how many options there are.',
    ],
  },
  {
    id: 'modal',
    name: 'Modal',
    category: 'Actions',
    summary: 'A focused interruption that blocks the page until resolved.',
    detect: ['modal'],
    variants: [
      {
        name: 'Confirmation',
        html: `<button class="btn" onclick="delete_project_modal.showModal()">Delete project</button>
<dialog id="delete_project_modal" class="modal">
  <div class="modal-box">
    <h3 class="text-lg font-bold">Delete this project?</h3>
    <p class="py-4">This removes all 14 prototypes inside it. This cannot be undone.</p>
    <div class="modal-action">
      <form method="dialog">
        <button class="btn">Cancel</button>
      </form>
      <button class="btn btn-error">Delete project</button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop"><button>close</button></form>
</dialog>`,
        previewHtml: `<div class="modal-box border border-base-300 w-full max-w-xs p-4 shadow-sm">
  <h3 class="font-bold">Delete this project?</h3>
  <p class="py-2 text-sm">This cannot be undone.</p>
  <div class="modal-action mt-0">
    <button class="btn btn-sm">Cancel</button>
    <button class="btn btn-sm btn-error">Delete</button>
  </div>
</div>`,
      },
    ],
    usage: [
      'Reserve for decisions that genuinely cannot wait. Everything else belongs inline on the page.',
      'Name the consequence in the heading, not the mechanism — "Delete this project?" rather than "Confirm".',
      'The confirm button repeats the verb from the heading so it reads correctly out of context.',
    ],
    a11yNotes: [
      'Use the native <dialog> element — it traps focus, restores it on close, and handles Escape.',
      'Focus should land inside the dialog on open and return to the trigger on close.',
    ],
  },
]
