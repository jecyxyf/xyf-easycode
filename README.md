# XYF EasyCode

[简体中文](README_CN.md)

> [!TIP]
> As AI advances, Vibe Coding is the way things are heading. I often find it frustrating when AI keeps expanding the scope and struggles to stay focused, so I created this set of skills.
>
> Everyone has different coding habits. A development workflow that feels right to me may not work for everyone. If it helps even a small group of people, I'll be very happy.
>
> Suggestions are welcome.

## Project description

XYF EasyCode is a set of skills for AI-assisted coding, with a visual software architecture editor.

It helps users organize requirements into clear modules, interfaces, and interactions. AI then follows the agreed architecture to develop, test, and review code, reducing missed features and departures from the design.

## Usage

### 1. Install

Run [xyf-easycode-install](skills/xyf-easycode-install/SKILL.md) to install the architecture webpage and shared rules in your project.

### 2. Analyze existing code, discuss requirements, and define the software architecture

If the project already has code, first analyze its modules, interfaces, and interactions to understand the current software architecture.

Use [xyf-easycode-requirements](skills/xyf-easycode-requirements/SKILL.md) to discuss requirements, then generate or update the software architecture once the requirements are agreed.

The architecture is JSON data stored in `docs/xyf-easycode/html/software_architecture.js`.

### 3. Refine the software architecture

Open `docs/xyf-easycode/html/index.html` and edit the modules on the webpage to correct and improve the software architecture until it matches your needs. Save your changes when you are satisfied.

### 4. Review and create a work plan

Use [xyf-easycode-check](skills/xyf-easycode-check/SKILL.md) to compare the existing code with the software architecture, identify differences, and create a work plan.

Review reports are saved in `docs/xyf-easycode/reports/`. Confirm the work plan before starting development.

### 5. Implement and review the code

Use [xyf-easycode-code](skills/xyf-easycode-code/SKILL.md) to implement the software according to the architecture and confirmed work plan.

During development, run tests and use [review-agent](skills/review-agent/SKILL.md) to review the code. Fix any issues, rerun tests, and review again; deliver once all checks pass.
