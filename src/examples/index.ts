export interface ExamplePrototype {
  id: string
  title: string
  description: string
  html: string
}

const teamSettings = `<main class="mx-auto max-w-3xl p-8">
  <h1 class="text-3xl font-bold">Team settings</h1>
  <p class="text-base-content/70 mt-2">Control who can publish prototypes and how they get reviewed.</p>

  <div class="divider"></div>

  <section>
    <h2 class="text-xl font-semibold">Workspace</h2>
    <div class="card card-border bg-base-100 mt-4">
      <div class="card-body gap-4">
        <div class="w-full max-w-sm">
          <label class="label" for="team-name">Team name</label>
          <input id="team-name" type="text" class="input w-full" value="Relishink Design" />
        </div>
        <div class="w-full max-w-sm">
          <label class="label" for="review-mode">Review mode</label>
          <select id="review-mode" class="select w-full">
            <option>Check before publish</option>
            <option>Check on demand</option>
          </select>
        </div>
        <label class="label w-fit cursor-pointer justify-start gap-3">
          <input type="checkbox" class="toggle toggle-primary" checked />
          <span>Run the checker automatically after each generation</span>
        </label>
      </div>
    </div>
  </section>

  <section class="mt-8">
    <h2 class="text-xl font-semibold">Members</h2>
    <div class="overflow-x-auto">
      <table class="table mt-4">
        <thead>
          <tr><th>Name</th><th>Role</th><th>Status</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="flex items-center gap-3">
                <div class="avatar">
                  <div class="w-8 rounded-full">
                    <img src="https://placehold.co/64x64/e5e7eb/6b7280?text=DR" alt="" />
                  </div>
                </div>
                <span>David Roddy</span>
              </div>
            </td>
            <td>Owner</td>
            <td><span class="badge badge-success">Active</span></td>
          </tr>
          <tr>
            <td>
              <div class="flex items-center gap-3">
                <div class="avatar avatar-placeholder">
                  <div class="bg-neutral text-neutral-content w-8 rounded-full"><span>AM</span></div>
                </div>
                <span>Alex Moreau</span>
              </div>
            </td>
            <td>Editor</td>
            <td><span class="badge">Invited</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <div role="alert" class="alert alert-info mt-8">
    Changes apply to every prototype in this workspace.
  </div>

  <div class="mt-6 flex justify-end gap-2">
    <button class="btn">Cancel</button>
    <button class="btn btn-primary">Save changes</button>
  </div>
</main>`

/**
 * Every defect below is planted deliberately. This doubles as the checker's
 * fixture: if a rule stops firing here, the rule regressed.
 *
 *   custom button (div + onclick) .... clickable-non-interactive, custom-button
 *   bare <input> ..................... form-label, custom-text input
 *   hand-rolled card ................. custom-card
 *   p-[13px] ......................... spacing-scale
 *   bg-[#5b21b6] / inline color ...... color-token
 *   <img> with no alt ................ img-alt
 *   h1 -> h3 ......................... heading-order
 *   text-base-300 on base-100 ........ color-contrast
 *   no <main> ........................ landmark-main
 */
const driftyPricing = `<div class="mx-auto max-w-3xl p-8">
  <h1 class="text-3xl font-bold">Upgrade your plan</h1>

  <h3 class="mt-6 text-xl font-semibold">Compare tiers</h3>
  <p class="text-base-300 mt-1">Prices shown exclude tax.</p>

  <div class="mt-6 grid gap-4 sm:grid-cols-2">
    <div class="rounded-lg border border-gray-200 p-[13px]">
      <h4 class="text-lg font-semibold">Starter</h4>
      <p class="mt-1 text-sm">Everything you need to try the checker.</p>
      <div style="color:#8a8a8a; font-size: 13px" class="mt-2">Free forever</div>
      <div onclick="selectPlan('starter')" class="mt-4 inline-block cursor-pointer rounded bg-[#5b21b6] px-4 py-2 text-white">
        Choose Starter
      </div>
    </div>

    <div class="card card-border bg-base-100">
      <div class="card-body">
        <h4 class="card-title text-lg">Team</h4>
        <p class="text-sm">Shared library, shared standards.</p>
        <p class="mt-2 font-semibold">$24 per editor</p>
        <div class="card-actions justify-end">
          <button class="btn btn-primary">Choose Team</button>
        </div>
      </div>
    </div>
  </div>

  <img src="https://placehold.co/600x120/e5e7eb/6b7280?text=Trusted+by+teams" class="mt-8 w-full rounded" />

  <div class="mt-8 rounded-lg border border-gray-200 p-6">
    <h4 class="text-lg font-semibold">Questions about billing?</h4>
    <p class="mt-2 text-sm">Leave your email and we will get back to you.</p>
    <input type="email" placeholder="you@company.com" class="mt-3 w-full rounded border px-3 py-2" />
    <a href="#" class="mt-3 inline-block underline">Click here</a>
  </div>
</div>`

export const examplePrototypes: ExamplePrototype[] = [
  {
    id: 'example-team-settings',
    title: 'Team settings (on-system)',
    description:
      'Built entirely from the approved library. Use this to see what a clean report looks like.',
    html: teamSettings,
  },
  {
    id: 'example-drifty-pricing',
    title: 'Pricing page (drifted)',
    description:
      'A plausible AI-generated screen with real drift in it — hand-rolled controls, off-scale spacing, a hard-coded brand color and several accessibility gaps.',
    html: driftyPricing,
  },
]
