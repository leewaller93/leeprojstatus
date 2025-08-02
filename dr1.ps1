# dr1.ps1 - Shorthand for deploy-robust.ps1
# Usage: .\dr1.ps1 [commit message]

param(
    [string]$CommitMessage = ""
)

if ($CommitMessage -eq "") {
    # No commit message provided, use default
    & ".\deploy-robust.ps1"
} else {
    # Commit message provided, pass it through
    & ".\deploy-robust.ps1" -CommitMessage $CommitMessage
} 