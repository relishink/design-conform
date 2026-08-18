import type { SystemComponent } from '../types'

export const feedbackComponents: SystemComponent[] = [
  {
    id: 'alert',
    name: 'Alert',
    category: 'Feedback',
    summary: 'An inline message about the state of the page or an action.',
    detect: ['alert'],
    variants: [
      {
        name: 'Info',
        html: '<div role="alert" class="alert alert-info">Add an AI key in Settings to start generating prototypes.</div>',
      },
      {
        name: 'Success',
        html: '<div role="alert" class="alert alert-success">All 18 components are on-system.</div>',
      },
      {
        name: 'Warning',
        html: '<div role="alert" class="alert alert-warning">3 components use spacing outside the scale.</div>',
      },
      {
        name: 'Error',
        html: '<div role="alert" class="alert alert-error">Two images are missing alt text, so this screen fails WCAG 1.1.1.</div>',
      },
    ],
    usage: [
      'Place the alert next to what it is about. A banner at the top of the page about a field at the bottom will be missed.',
      'Say what happened and what to do next. "Something went wrong" is not a message.',
      'Errors persist until resolved. Success can auto-dismiss.',
    ],
    a11yNotes: [
      'Use role="alert" for messages that appear in response to an action so they are announced.',
      'Do not use role="alert" for content present on load — it interrupts for no reason.',
      'Never rely on the color alone to distinguish an error from a success.',
    ],
  },
  {
    id: 'progress',
    name: 'Progress',
    category: 'Feedback',
    summary: 'How far along a determinate operation is.',
    detect: ['progress'],
    expect: ['progress'],
    variants: [
      {
        name: 'Determinate',
        html: `<div class="w-64">
  <progress class="progress progress-primary" value="62" max="100" aria-label="Checking components"></progress>
  <p class="text-sm mt-1">Checked 13 of 21 components</p>
</div>`,
      },
    ],
    usage: [
      'Use a progress bar only when you know the proportion. Otherwise use a spinner.',
      'Pair the bar with text. A bar alone does not say what is being waited on.',
    ],
    a11yNotes: [
      'The native <progress> element carries its own role and value; use it rather than a styled div.',
      'Give it an accessible name so "62%" has a subject.',
    ],
  },
  {
    id: 'loading',
    name: 'Loading',
    category: 'Feedback',
    summary: 'Indeterminate activity indicator.',
    detect: ['loading'],
    variants: [
      {
        name: 'Spinner',
        html: `<div class="flex items-center gap-2">
  <span class="loading loading-spinner"></span>
  <span>Generating prototype…</span>
</div>`,
      },
    ],
    usage: [
      'Always label what is loading. A bare spinner is a shrug.',
      'Under about 300ms, show nothing — a flash of spinner reads as a glitch.',
    ],
    a11yNotes: [
      'Put the status text in an aria-live region so the change is announced, not just animated.',
      'Animation alone conveys nothing to a screen reader.',
    ],
  },
  {
    id: 'tooltip',
    name: 'Tooltip',
    category: 'Feedback',
    summary: 'A short hint attached to a control.',
    detect: ['tooltip'],
    variants: [
      {
        name: 'Default',
        html: `<div class="tooltip tooltip-right" data-tip="Re-runs every rule against the current markup">
  <button class="btn btn-sm">Run checker</button>
</div>`,
      },
    ],
    usage: [
      'Tooltips supplement, never replace. Anything essential must be visible without hovering.',
      'Attach to a focusable control, or keyboard and touch users will never see it.',
    ],
    a11yNotes: [
      'Tooltip content must be reachable on focus, not only on hover.',
      'Never put interactive content inside a tooltip — there is no reliable way to reach it.',
    ],
  },
]
