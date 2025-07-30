
### Changes

Describe the key changes in this PR with the Jira Issue reference 

### Changes to Public Facing API if any 

Please list the impact on the public facing API if any

### How Has This Been Tested?

Describe the testing approach and any relevant configurations (e.g., environment, platform)

### Checklist

- [ ] Code compiles without errors
- [ ] Version Bump added to package.json & CHANGELOG.md
- [ ] All tests pass
- [ ] Build process is successful
- [ ] Documentation has been updated (if needed)
- [ ] Automations are passing

#### Link to Deployed SDK 

Use these url for testing : 
1. `https://static.wizrocket.com/staging/<CURRENT_BRANCH_NAME>/js/clevertap.min.js`  
2. `https://static.wizrocket.com/staging/<CURRENT_BRANCH_NAME>/js/sw_webpush.min.js`

### How to trigger Automations

Just add a empty commit after all your changes are done in the PR with the command 

```bash
 git commit --allow-empty -m "[run-test] Testing Automation"
```

This will trigger the automation suite