# Sourced by hooks. pnpm does not search parent directories for binaries, so
# nightly worktrees (no node_modules of their own) use the primary checkout's.
primary=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
PATH="$root/node_modules/.bin:$primary/node_modules/.bin:$PATH"
export PATH
unset primary
