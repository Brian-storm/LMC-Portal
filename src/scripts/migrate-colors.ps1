# Color migration script: hardcoded #1b4332 → design tokens
# Run from project root: PowerShell .\src\scripts\migrate-colors.ps1

$projectRoot = "C:\Users\bb891\projects\LMC\lmc-cpd-web\lmc-portal"

# Files to process (all .tsx files with #1b4332 matches)
$files = @(
    "src\components\enrollment\EnrollmentWizard.tsx",
    "src\app\[locale]\(portal)\dashboard\page.tsx",
    "src\app\[locale]\privacy\page.tsx",
    "src\app\[locale]\terms\page.tsx",
    "src\app\[locale]\register\register-form.tsx",
    "src\components\courses\CourseDetailView.tsx",
    "src\components\courses\CourseFilters.tsx",
    "src\components\courses\CourseCard.tsx",
    "src\components\receipt\ReceiptView.tsx",
    "src\app\[locale]\login\login-form.tsx",
    "src\app\[locale]\contact\page.tsx",
    "src\app\[locale]\admin\page.tsx",
    "src\app\[locale]\admin\enrolments\page.tsx",
    "src\app\[locale]\admin\courses\page.tsx",
    "src\app\[locale]\admin\courses\new\page.tsx",
    "src\app\[locale]\(portal)\dashboard\enrolments\page.tsx",
    "src\app\[locale]\(portal)\dashboard\enrolments\[enrolmentId]\page.tsx",
    "src\components\courses\CourseHeader.tsx",
    "src\components\courses\CourseList.tsx",
    "src\components\courses\CoursesView.tsx",
    "src\components\home\HeroCarousel.tsx",
    "src\components\home\ConsultationForm.tsx",
    "src\app\[locale]\admin\AdminLayoutClient.tsx",
    "src\lib\receipt\styles.ts",
    "src\lib\email\templates.ts"
)

# Dark-region file paths (bg-[#1b4332] as full-bleed section → bg-primary-deep)
$darkRegionFiles = @(
    "src\components\home\HeroCarousel.tsx",
    "src\components\home\ConsultationForm.tsx",
    "src\components\courses\CoursesView.tsx",
    "src\app\[locale]\admin\AdminLayoutClient.tsx",
    "src\app\[locale]\(portal)\dashboard\page.tsx"
)

function Process-File {
    param([string]$relativePath)
    
    $fullPath = Join-Path $projectRoot $relativePath
    if (-not (Test-Path $fullPath)) {
        Write-Host "  SKIP (not found): $relativePath" -ForegroundColor Yellow
        return
    }
    
    Write-Host "  Processing: $relativePath" -ForegroundColor Cyan
    $content = Get-Content $fullPath -Raw
    
    $original = $content
    
    # ── STEP 1: Dark-region full-bleed bg replacements (run before general bg replacements) ──
    if ($relativePath -eq "src\components\home\HeroCarousel.tsx") {
        $content = $content -replace 'bg-\[#1b4332\] text-white', 'bg-primary-deep text-white'
    }
    if ($relativePath -eq "src\components\home\ConsultationForm.tsx") {
        $content = $content -replace 'bg-\[#1b4332\] text-white', 'bg-primary-deep text-white'
    }
    if ($relativePath -eq "src\components\courses\CoursesView.tsx") {
        $content = $content -replace 'bg-\[#1b4332\] text-white border-b-2 border-\[#0d2118\]', 'bg-primary-deep text-white border-b-2 border-primary-deep/80'
        $content = $content -replace 'border-\[#0d2118\]', 'border-primary-deep/80'
    }
    if ($relativePath -eq "src\app\[locale]\admin\AdminLayoutClient.tsx") {
        $content = $content -replace 'bg-\[#1b4332\]', 'bg-primary-deep'
    }
    # dashboard banner (dark region)
    if ($relativePath -eq "src\app\[locale]\(portal)\dashboard\page.tsx") {
        $content = $content -replace 'bg-\[#1b4332\] text-emerald-100', 'bg-primary-deep text-emerald-100'
        $content = $content -replace 'border-b-2 border-\[#2d6a4f\]', 'border-b-2 border-primary-deep/40'
        # dashboard gradient progress bar: from-[#1b4332] to-[#2d6a4f] → from-primary to-primary/80
        $content = $content -replace 'from-\[#1b4332\] to-\[#2d6a4f\]', 'from-primary to-primary/80'
        $content = $content -replace 'hover:bg-\[#2d6a4f\]', 'hover:bg-primary/80'
        $content = $content -replace 'border-\[#2d6a4f\]', 'border-primary/40'
        $content = $content -replace 'text-\[#2d6a4f\]', 'text-primary/80'
    }
    
    # ── STEP 2: Button-specific patterns (full strings with text-white) ──
    # These must be replaced before the general #1b4332 replacements
    
    # enroll tab active: "bg-[#1b4332] text-white" (admin/enrolments)
    if ($relativePath -eq "src\app\[locale]\admin\enrolments\page.tsx") {
        $content = $content -replace 'bg-\[#1b4332\] text-white', 'bg-primary text-primary-foreground'
    }
    
    # radio selected: "bg-[#1b4332] text-white border-[#1b4332]"
    $content = $content -replace 'bg-\[#1b4332\] text-white border-\[#1b4332\]', 'bg-primary text-primary-foreground border-primary'
    
    # button: bg-[#1b4332] hover:bg-[#112a1f] disabled:opacity-50 text-white font-bold px-4 py-2 text-xs uppercase tracking-wider rounded-xs transition-colors
    $content = $content -replace 'bg-\[#1b4332\] hover:bg-\[#112a1f\] disabled:opacity-50 text-white font-bold px-4 py-2 text-xs uppercase tracking-wider rounded-xs transition-colors', 'bg-primary hover:bg-primary/80 disabled:opacity-50 text-primary-foreground font-bold px-4 py-2 text-xs uppercase tracking-wider rounded-xs transition-colors'
    
    # button: bg-[#1b4332] hover:bg-[#112a1f] disabled:opacity-50 text-white font-bold px-6 py-2.5 text-xs uppercase tracking-wider rounded-xs transition-all shadow-md
    $content = $content -replace 'bg-\[#1b4332\] hover:bg-\[#112a1f\] disabled:opacity-50 text-white font-bold px-6 py-2.5 text-xs uppercase tracking-wider rounded-xs transition-all shadow-md', 'bg-primary hover:bg-primary/80 disabled:opacity-50 text-primary-foreground font-bold px-6 py-2.5 text-xs uppercase tracking-wider rounded-xs transition-all shadow-md'
    
    # button: bg-[#1b4332] hover:bg-[#112a1f] active:bg-[#091711] border-[#0d2118] ... text-white ... (CourseDetailView enroll CTA - long string)
    $content = $content -replace 'bg-\[#1b4332\] hover:bg-\[#112a1f\] active:bg-\[#091711\] border-\[#0d2118\] text-\[10px\] font-mono font-bold text-white', 'bg-primary hover:bg-primary/80 active:bg-primary/90 border-primary/40 text-[10px] font-mono font-bold text-primary-foreground'
    
    # button: bg-[#1b4332] hover:bg-[#112a1f] active:bg-[#091711] text-white font-mono font-bold px-2 py-1 uppercase tracking-wider transition-colors rounded-xs shadow-2xs border border-[#0d2118] (CourseCard)
    $content = $content -replace 'bg-\[#1b4332\] hover:bg-\[#112a1f\] active:bg-\[#091711\] text-white font-mono font-bold px-2 py-1 uppercase tracking-wider transition-colors rounded-xs shadow-2xs border border-\[#0d2118\]', 'bg-primary hover:bg-primary/80 active:bg-primary/90 text-primary-foreground font-mono font-bold px-2 py-1 uppercase tracking-wider transition-colors rounded-xs shadow-2xs border border-primary/40'
    
    # button: bg-[#1b4332] hover:bg-[#112a1f] text-white font-bold (generic button - admin courses/new, login, register, dashboard enrolments)
    $content = $content -replace 'bg-\[#1b4332\] hover:bg-\[#112a1f\] text-white font-bold', 'bg-primary hover:bg-primary/80 text-primary-foreground font-bold'
    
    # button: bg-[#1b4332] hover:bg-[#112a1f] text-white (generic button - simpler)
    $content = $content -replace 'bg-\[#1b4332\] hover:bg-\[#112a1f\] text-white', 'bg-primary hover:bg-primary/80 text-primary-foreground'
    
    # button: bg-[#1b4332] hover:bg-[#2d6a4f] text-white (dashboard CTA)
    $content = $content -replace 'bg-\[#1b4332\] hover:bg-\[#2d6a4f\] text-white', 'bg-primary hover:bg-primary/80 text-primary-foreground'
    
    # button: bg-[#1b4332] text-white text-xs font-bold px-4 py-2 rounded-xs uppercase tracking-wider (EnrollmentWizard print)
    $content = $content -replace 'bg-\[#1b4332\] text-white text-xs font-bold px-4 py-2 rounded-xs uppercase tracking-wider', 'bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-xs uppercase tracking-wider'
    
    # button: bg-[#1b4332] hover:bg-[#112a1f] text-white text-xs font-bold uppercase tracking-wider py-2 px-6 rounded-xs transition-colors shadow-2xs (register step 1 CTA)
    $content = $content -replace 'bg-\[#1b4332\] hover:bg-\[#112a1f\] text-white text-xs font-bold uppercase tracking-wider py-2 px-6 rounded-xs transition-colors shadow-2xs', 'bg-primary hover:bg-primary/80 text-primary-foreground text-xs font-bold uppercase tracking-wider py-2 px-6 rounded-xs transition-colors shadow-2xs'
    
    # button: w-full inline-flex ... bg-[#1b4332] hover:bg-[#112a1f] ... text-white ... (register step 2, login)
    $content = $content -replace 'w-full inline-flex items-center justify-center space-x-2 bg-\[#1b4332\] hover:bg-\[#112a1f\] text-white text-xs font-bold uppercase tracking-wider py-2 rounded-xs transition-colors shadow-2xs disabled:opacity-50', 'w-full inline-flex items-center justify-center space-x-2 bg-primary hover:bg-primary/80 text-primary-foreground text-xs font-bold uppercase tracking-wider py-2 rounded-xs transition-colors shadow-2xs disabled:opacity-50'
    
    # button: flex-1 inline-flex items-center justify-center space-x-1.5 bg-[#1b4332] hover:bg-[#112a1f] text-white font-bold px-3 py-2 text-xs uppercase tracking-wider rounded-xs transition-colors shadow-2xs (admin courses new, dashboard enrolments)
    $content = $content -replace 'flex-1 inline-flex items-center justify-center space-x-1.5 bg-\[#1b4332\] hover:bg-\[#112a1f\] text-white font-bold px-3 py-2 text-xs uppercase tracking-wider rounded-xs transition-colors shadow-2xs', 'flex-1 inline-flex items-center justify-center space-x-1.5 bg-primary hover:bg-primary/80 text-primary-foreground font-bold px-3 py-2 text-xs uppercase tracking-wider rounded-xs transition-colors shadow-2xs'
    
    # button: inline-flex items-center space-x-1.5 bg-[#1b4332] hover:bg-[#112a1f] disabled:opacity-50 text-white font-bold px-4 py-2 text-xs uppercase tracking-wider rounded-xs transition-colors (EnrollmentWizard step 2/3 next)
    $content = $content -replace 'inline-flex items-center space-x-1.5 bg-\[#1b4332\] hover:bg-\[#112a1f\] disabled:opacity-50 text-white font-bold px-4 py-2 text-xs uppercase tracking-wider rounded-xs transition-colors', 'inline-flex items-center space-x-1.5 bg-primary hover:bg-primary/80 disabled:opacity-50 text-primary-foreground font-bold px-4 py-2 text-xs uppercase tracking-wider rounded-xs transition-colors'
    
    # button: inline-flex items-center space-x-1 bg-[#1b4332] hover:bg-[#112a1f] text-white text-xs font-bold px-3 py-2 rounded-xs transition-colors (admin courses)
    $content = $content -replace 'inline-flex items-center space-x-1 bg-\[#1b4332\] hover:bg-\[#112a1f\] text-white text-xs font-bold px-3 py-2 rounded-xs transition-colors', 'inline-flex items-center space-x-1 bg-primary hover:bg-primary/80 text-primary-foreground text-xs font-bold px-3 py-2 rounded-xs transition-colors'
    
    # button: rounded-none text-xs font-bold h-8 px-3 bg-[#1b4332] hover:bg-[#112a1f] (ReceiptView download)
    $content = $content -replace 'rounded-none text-xs font-bold h-8 px-3 bg-\[#1b4332\] hover:bg-\[#112a1f\]', 'rounded-none text-xs font-bold h-8 px-3 bg-primary hover:bg-primary/80'
    
    # ── STEP 3: Companion colors (replace before #1b4332 to avoid conflicts) ──
    $content = $content -replace 'hover:bg-\[#112a1f\]', 'hover:bg-primary/80'
    $content = $content -replace 'hover:text-\[#112a1f\]', 'hover:text-primary/80'
    $content = $content -replace 'active:bg-\[#091711\]', 'active:bg-primary/90'
    $content = $content -replace 'border-\[#0d2118\]', 'border-primary/40'
    $content = $content -replace 'group-hover:bg-\[#0d2118\]', 'group-hover:bg-primary'
    
    # ── STEP 4: #1b4332 replacements (most specific first) ──
    # selection:bg-[#1b4332] selection:text-white
    $content = $content -replace 'selection:bg-\[#1b4332\] selection:text-white', 'selection:bg-primary selection:text-primary-foreground'
    
    # border-t-4 border-t-[#1b4332] (card top accent bar)
    $content = $content -replace 'border-t-4 border-t-\[#1b4332\]', 'border-t-4 border-t-primary'
    
    # border-l-4 border-[#1b4332]
    $content = $content -replace 'border-l-4 border-\[#1b4332\]', 'border-l-4 border-primary'
    
    # focus:border-[#1b4332]
    $content = $content -replace 'focus:border-\[#1b4332\]', 'focus:border-primary'
    
    # accent-[#1b4332]
    $content = $content -replace 'accent-\[#1b4332\]', 'accent-primary'
    
    # hover:border-[#1b4332]
    $content = $content -replace 'hover:border-\[#1b4332\]', 'hover:border-primary'
    
    # hover:text-[#1b4332]
    $content = $content -replace 'hover:text-\[#1b4332\]', 'hover:text-primary'
    
    # border-t-[#1b4332] (single top accent)
    $content = $content -replace 'border-t-\[#1b4332\]', 'border-t-primary'
    
    # border-[#1b4332] (remaining generic border)
    $content = $content -replace 'border-\[#1b4332\]', 'border-primary'
    
    # text-[#1b4332] (remaining text)
    $content = $content -replace 'text-\[#1b4332\]', 'text-primary'
    
    # bg-[#1b4332] (remaining bg - buttons already handled)
    $content = $content -replace 'bg-\[#1b4332\]', 'bg-primary'
    
    # ── STEP 5: Fix mix of bg-primary with text-white in button contexts that I missed ──
    # These are button patterns that somehow still have text-white after bg-primary
    # Only fix where bg-primary and text-white appear in the same className
    # This is a regex: "bg-primary" followed by content then "text-white"
    # We'll handle this more carefully
    
    # ── STEP 6: Lib files (non-Tailwind) ──
    if ($relativePath -eq "src\lib\receipt\styles.ts") {
        # Reset and use brand hex for PDF rendering (CSS vars don't work in @react-pdf)
        # The old #1b4332 → new brand hex #1e2e14 (primary-deep) for dark backgrounds
        # and #5f923b (primary) for text accents
        # For receipt styles, use primary-deep hex for dark backgrounds
        $content = $content -replace '"#1b4332"', '"#1e2e14"'
    }
    if ($relativePath -eq "src\lib\email\templates.ts") {
        # Email templates use #1b4332 in raw CSS. CSS vars not supported in email clients.
        # Use primary-deep hex for dark brand background
        # and primary hex for header text
        $content = $content -replace '#1b4332', '#1e2e14'
    }
    
    if ($content -ne $original) {
        Set-Content $fullPath -Value $content -NoNewline
        Write-Host "    Updated" -ForegroundColor Green
    } else {
        Write-Host "    No changes" -ForegroundColor Gray
    }
}

Write-Host "=== Color Migration: #1b4332 → Design Tokens ===" -ForegroundColor White
Write-Host ""

foreach ($file in $files) {
    Process-File $file
}

Write-Host ""
Write-Host "=== Migration Complete ===" -ForegroundColor White