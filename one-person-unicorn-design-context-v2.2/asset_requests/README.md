# Asset requests

`pending/` is the handoff queue for visuals/audio that Codex cannot or should not generate directly.

The existence of a pending request is preferable to shipping a generic substitute that violates the design system.

Once the user adds the final asset to the requested destination path, Codex should:
1. inspect the asset;
2. validate transparency/size/style;
3. integrate it;
4. delete or move the completed request according to the repo's normal workflow.
