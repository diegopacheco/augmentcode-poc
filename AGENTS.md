# AGENTS.md

Backend Code Guidelines:
- Avoid comments, do not use comments on the code(no comments on go files). No Comments!
- Format all Go code with gofmt.
- Run gofmt and ensure `go test ./...` passes before submitting code.
- Follow good and modern Go engineering practices:
  Avoid creating global variables
  Avoid adding unnecessary dependencies, be minimalistic add only add dependencies that are strictly necessary for the task.
  Use meaningful names for functions, variables, and packages
- When you open a PR in github make sure you:
  Make sure you run the tests before committing your code and fix all errors.
  Add the Prompt used on this task. (Prompt section)
  Print the test outout in the PR description. Test Output (section) 

Frontend Code Guidelines:
- Avoid comments, do not use comments on the code(no comments on html, css, js or tsx code). No Comments!
- Make sure you follow code pratices of modern react and typescript engineering.
  Make sure you always do input validation and sanitization.
  Use functional components and hooks, avoid class components.
  Avoid usage of redux and unnecessary state management libraries.
  Prefer to not add external libraries unless absolutely necessary.
- After modifying code, run the test suite:
  npm test
- Build output should not be committed; only source files and tests.
- When you open a PR in github make sure you:
   Make sure you run the linter before committing your code and fix all linter errors.
   Add the Prompt used on this task. (Prompt section)
   Print the test outout in the PR description. Test Output (section)
- Avoid using the following libs: redux.
- Favor usage of: react, vite, bun, typescript.