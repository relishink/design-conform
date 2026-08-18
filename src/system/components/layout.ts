import type { SystemComponent } from '../types'

export const layoutComponents: SystemComponent[] = [
  {
    id: 'hero',
    name: 'Hero',
    category: 'Layout',
    summary: 'The opening statement of a page, with one clear action.',
    detect: ['hero'],
    variants: [
      {
        name: 'Centered',
        html: `<div class="hero bg-base-200 rounded-box py-12">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h1 class="text-4xl font-bold">Keep it on-system</h1>
      <p class="py-4">Describe a screen, let your AI build it, then see exactly what drifted.</p>
      <button class="btn btn-primary">Create a prototype</button>
    </div>
  </div>
</div>`,
      },
    ],
    usage: [
      'One hero per page, at the top. A second hero halfway down is a section header with ambitions.',
      'One primary action. A hero offering three equal choices offers none.',
    ],
    a11yNotes: [
      'The hero headline is usually the page’s only <h1>.',
      'Text over an image needs a scrim or overlay to hold contrast at every image.',
    ],
  },
  {
    id: 'divider',
    name: 'Divider',
    category: 'Layout',
    summary: 'A labelled or plain separator between sections.',
    detect: ['divider'],
    variants: [
      {
        name: 'Labelled',
        html: `<div class="flex flex-col w-64">
  <div class="p-2">On-system components</div>
  <div class="divider">OR</div>
  <div class="p-2">Custom components</div>
</div>`,
      },
      {
        name: 'Plain',
        html: `<div class="flex flex-col w-64">
  <div class="p-2">Section one</div>
  <div class="divider"></div>
  <div class="p-2">Section two</div>
</div>`,
      },
    ],
    usage: [
      'Reach for spacing first. A divider is for when proximity alone is genuinely ambiguous.',
      'Dividers between every item in a list make the list look like a form.',
    ],
    a11yNotes: [
      'A decorative divider should not be announced. Use a plain element rather than an <hr> when it carries no meaning.',
      'If the divider marks a real change of topic, use a heading instead — that is what screen reader users navigate by.',
    ],
  },
]
