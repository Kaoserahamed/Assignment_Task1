# 🚀 Task: Build a Modern E-Commerce Order Tracking Screen

You are a senior frontend engineer and UI/UX designer. Build a polished, modern, responsive **mobile Order Tracking Screen** for an e-commerce application. The project will be deployed on **Vercel**, and the repository must include professional documentation.

Your goal is to create a production-quality frontend experience that clearly communicates order progress and handles delayed, delivered-but-not-received, and unavailable tracking scenarios.

---

## 1. Development Workflow (Follow Step by Step)

### Phase 1: Analyze & Plan

1. Analyze the complete task requirements before writing code.
2. Inspect the existing repository structure, if any.
3. Select an appropriate frontend stack (prefer Next.js + TypeScript + Tailwind CSS if starting from scratch).
4. Define the component architecture, data models, and UI states.
5. Create a clear implementation plan.
6. Do not begin coding until the plan is organized.

### Phase 2: Project Setup

1. Set up the frontend project with a clean, maintainable structure.
2. Configure TypeScript, Tailwind CSS, and the required UI/icon libraries.
3. Ensure the application works correctly on Vercel.
4. Use mock data or local state; backend integration is not required.
5. Avoid unnecessary dependencies and overengineering.

Commit with clear message -> push.

### Phase 3: UI/UX Implementation

Build the complete Order Tracking Screen with:

- Modern, professional e-commerce design.
- Responsive layout optimized for mobile widths of approximately **360–430px**.
- Clear visual hierarchy, spacing, typography, and color consistency.
- Accessible buttons, readable text, and meaningful feedback.
- Smooth, purposeful interactions where appropriate.
- A polished experience rather than a basic list of order statuses.

Commit with clear message -> push.

### Phase 4: Implement Order States

Implement all three required scenarios using reusable components and mock data.

#### State 1: Delayed Order

- Clearly communicate that the estimated delivery time has passed or the order is significantly delayed.
- Show the current order status and delivery timeline.
- Explain the delay in a user-friendly manner.
- Provide an appropriate next step, such as contacting support or viewing updated delivery information.
- Avoid unnecessary panic-inducing messaging.

Commit with clear message -> push.

#### State 2: Delivered but Not Received

- Show that the system reports the order as delivered.
- Clearly communicate that the customer reports not receiving the order.
- Provide an appropriate next action, such as contacting support or reporting a delivery issue.
- Avoid claiming that a resolution has already occurred.

Commit with clear message -> push.

#### State 3: Tracking Not Available Yet

- Show that the order exists but tracking information is not currently available.
- Provide a clear explanation instead of displaying an empty or broken-looking screen.
- Show relevant order information and an appropriate next step.
- Maintain a polished visual experience even when tracking data is unavailable.

**Important:** The same product experience must adapt appropriately to all three states.

Commit with clear message -> push.

### Phase 5: Core Features

Implement the following:

1. **Visual Delivery Progress / Timeline**

   - Clear stages such as Processing, Shipped, Out for Delivery, and Delivered.
   - Distinguish completed, current, upcoming, and exception states.
   - Use meaningful visual indicators and accessible labels.

2. **Current Order Status**

   - Prominent status heading.
   - Supporting description and contextual information.

3. **Estimated Delivery Date / Time**

   - Display relevant delivery estimates.
   - Handle delayed or unavailable estimates appropriately.

4. **Order / Product Summary**

   - Product image placeholder or mock product image.
   - Product name, quantity, price, and order information.
   - Keep the summary clean and easy to scan.

5. **Customer Support**

   - Clear, accessible contact support action.
   - Use a mock interaction if backend integration is not available.

6. **Meaningful Interactions**

   - View order details.
   - Contact support.
   - Report a delivery issue.
   - Use modals, drawers, or other appropriate UI patterns where useful.
   - Include feedback for relevant user actions.

7. **Loading, Empty & Error States**

   - Add appropriate loading, empty, and error states where relevant.
   - Ensure these states look intentional and professional.

Commit with clear message -> push.

### Phase 6: Visual Quality & Responsiveness

1. Review the screen at 360px, 390px, and 430px widths.
2. Ensure no horizontal overflow or broken layouts.
3. Verify typography, spacing, alignment, and button usability.
4. Make the design feel consistent with a modern e-commerce product.
5. Avoid excessive animations, unnecessary gradients, and visual clutter.
6. Use a consistent design system for colors, spacing, borders, and components.

Commit with clear message -> push.

### Phase 7: Testing & Quality Assurance

Before deployment:

- Run TypeScript checks.
- Run linting.
- Build the project successfully.
- Test all three order scenarios.
- Test responsive layouts.
- Verify all interactive buttons and UI states.
- Check accessibility basics, including keyboard navigation, semantic HTML, and accessible labels.
- Fix errors and visual issues before deployment.

Do not claim that a test passed unless you actually run it.

Commit with clear message -> push.

### Phase 8: Vercel Deployment

1. Prepare the project for Vercel deployment.
2. Verify the production build locally.
3. Configure deployment settings only when necessary.
4. Deploy the application to Vercel.
5. Verify that the deployed URL works correctly.
6. Ensure the evaluator can access the application without needing to run the project locally.
7. Do not expose API keys, credentials, or sensitive environment variables.

Commit with clear message -> push.

### Phase 9: Documentation

Create professional documentation before completing the task.

---

Commit with clear message -> push.

## 2. Required Repository Structure

Use a clean structure appropriate for the selected framework. For a Next.js implementation, a suggested structure is:

```text
order-tracking/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── order-tracking/
│   │   ├── OrderTrackingScreen.tsx
│   │   ├── DeliveryTimeline.tsx
│   │   ├── OrderSummary.tsx
│   │   ├── StatusBanner.tsx
│   │   ├── SupportActions.tsx
│   │   └── TrackingStates.tsx
│   └── ui/
├── data/
│   └── mock-orders.ts
├── types/
│   └── order.ts
├── public/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DESIGN.md
│   └── TESTING.md
├── README.md
├── package.json
├── tsconfig.json
└── .gitignore
```

Adapt the structure to the actual project and avoid creating unnecessary files.

---

## 3. Documentation Requirements

### README.md

Include:

- Project overview.
- Key features.
- Technology stack.
- Screenshots or preview section, if available.
- Local installation instructions.
- Development commands.
- Build and testing instructions.
- Deployment instructions for Vercel.
- Mock data and supported order states.
- Project limitations and future improvements.
- Live deployed URL.
- GitHub repository URL.

### docs/ARCHITECTURE.md

Explain:

- Component architecture.
- Data models and state management.
- Component responsibilities.
- How the three order states are handled.
- How the project can be extended with a backend.

### docs/DESIGN.md

Explain:

- Design principles.
- Responsive design approach.
- Typography and spacing.
- Color and status semantics.
- Accessibility considerations.
- Key UX decisions for each order scenario.

### docs/TESTING.md

Include:

- Testing checklist.
- Commands used.
- Responsive testing approach.
- Order state testing.
- Known limitations.

Documentation must reflect the actual implementation. Do not add false claims or pretend that unavailable features are implemented.

---

## 4. Technical Requirements

- Framework: Next.js or another suitable React-based framework.
- Language: TypeScript preferred.
- Styling: Tailwind CSS or another maintainable styling solution.
- Icons: Use a consistent icon library where appropriate.
- Backend: Not required; mock data is acceptable.
- Deployment: Vercel.
- Mobile-first responsive design.
- Use reusable components and clean code.
- Avoid hardcoded repetitive UI when reusable data-driven components are appropriate.
- Ensure the project is easy to maintain and extend.

---

## 5. Execution Rules

Follow these rules throughout development:

1. Work step by step and complete each phase before moving to the next.
2. Inspect existing files before modifying them.
3. Preserve useful existing functionality if a repository already exists.
4. Do not rewrite the entire project unnecessarily.
5. Prefer simple, maintainable solutions over complex abstractions.
6. Verify changes using actual commands and testing.
7. If you encounter an error, investigate the root cause and fix it.
8. Do not skip the three required order scenarios.
9. Keep the UI focused on the task requirements.
10. Do not stop at a basic prototype; refine the visual experience.

---

## 6. Final Acceptance Criteria

The task is complete only when:

- [ ] Modern, professional order tracking screen is implemented.
- [ ] Responsive design works at approximately 360–430px widths.
- [ ] Delivery timeline is visually clear.
- [ ] Current status and estimated delivery information are visible.
- [ ] Order/product summary is implemented.
- [ ] Support and delivery issue actions are available.
- [ ] Delayed Order state is implemented.
- [ ] Delivered but Not Received state is implemented.
- [ ] Tracking Not Available Yet state is implemented.
- [ ] Loading, empty, and error states are handled where relevant.
- [ ] Interactions work without broken buttons.
- [ ] TypeScript checks and production build pass.
- [ ] Vercel deployment is successful.
- [ ] Deployed URL is accessible.
- [ ] GitHub repository contains the complete source code.
- [ ] README.md and supporting documentation are complete and accurate.

---

## 7. Final Response

After completing the implementation, provide:

1. Summary of implemented features.
2. Technology stack.
3. All supported order states.
4. Testing and validation results.
5. Live Vercel deployment URL.
6. GitHub repository URL.
7. Important design decisions.
8. Any known limitations or remaining tasks.

Start by analyzing the requirements and inspecting the repository. Then proceed through the implementation phases systematically.
