# augmentcode-poc

augmentcode-poc: POC using IDE agent from Augment Code.

## Augment Code in Action

Augment Code agent in action
<img src="results/augment-agent-mode-in-action.png" width="800" />

## Augment Code Trade-off Analysis | Experience notes

PROS
 * Was easy to install via IntelliJ plugin.
 * Was able to make it work and give tasks to the agent.

CONS
 * Did not use/detect my NVM and was trying to install node from scratch with brew.
 * Did not add the node_modules to the .gitignore file.
 * So first PR augment code open had 5K+ files and github only support ~ 3k
 * I had to intervene and fix some of the agent mistakes.
 * Augment code plugin: The font size in InteliJ is too small. Barely can read.
 * I could not install the vscode version for linux, it just do not authenticate it get stuck. 
 * There is a plugin for InteliJ but the plugin still run commands on the terminal just like the same as github copilot.
 * Slow. Claude Code and opencode are much faster.
 
## All PRs are available here

https://github.com/diegopacheco/augmentcode-poc/pulls?q=is%3Apr+is%3Aclosed

## Related POCs

* OpenAI Codex POC https://github.com/diegopacheco/codex-poc
* Google Jules https://github.com/diegopacheco/google-jules-poc
* Claude Code POC https://github.com/diegopacheco/claude-code-poc
* Cursor POC https://github.com/diegopacheco/docker-cleanup
* Gemini-cli POC: https://github.com/diegopacheco/gemini-cli-poc
* Sketch POC: https://github.com/diegopacheco/sketch-dev-poc