# augmentcode-poc

augmentcode-poc: POC using IDE agent from Augment Code.

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

## All PRs are available here

https://github.com/diegopacheco/augmentcode-poc/pulls?q=is%3Apr+is%3Aclosed

## Related POCs

* OpenAI Codex POC https://github.com/diegopacheco/codex-poc
* Google Jules https://github.com/diegopacheco/google-jules-poc
* Cursor POC https://github.com/diegopacheco/docker-cleanup
* Gemini-cli POC: https://github.com/diegopacheco/gemini-cli-poc
* Sketch POC: https://github.com/diegopacheco/sketch-dev-poc